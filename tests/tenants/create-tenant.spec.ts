import createJWKSMock, { JWKSMock } from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/types/auth.types';
import { getTenants } from '../utils';

describe('POST /api/tenants', () => {
  let connection: DataSource;
  let jwks: JWKSMock;
  let adminToken: string;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5000');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();

    adminToken = jwks.token({
      sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
      role: Roles.ADMIN
    });

    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Success cases', () => {
    const tenantData = {
      name: 'Tenant name',
      address: 'Tenant address'
    };

    it('should return 201 status code', async () => {
      const response = await request(app)
        .post('/api/tenants')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(tenantData);

      expect(response.statusCode).toBe(201);
    });

    it('should create a tenant in the database', async () => {
      await request(app)
        .post('/api/tenants')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(tenantData);

      const tenants = await getTenants(connection);

      expect(tenants).toHaveLength(1);
      expect(tenants[0]?.name).toBe(tenantData.name);
      expect(tenants[0]?.address).toBe(tenantData.address);
    });
  });

  describe('Failure cases', () => {
    const tenantData = {
      name: 'Tenant name',
      address: 'Tenant address'
    };

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app).post('/api/tenants').send(tenantData);

      const tenants = await getTenants(connection);

      expect(response.statusCode).toBe(401);
      expect(tenants).toHaveLength(0);
    });

    it('should return 403 if user is not authorized (non admin)', async () => {
      const managerToken = jwks.token({
        sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
        role: Roles.MANAGER
      });

      const response = await request(app)
        .post('/api/tenants')
        .set('Cookie', [`accessToken=${managerToken};`])
        .send(tenantData);

      const tenants = await getTenants(connection);

      expect(response.statusCode).toBe(403);
      expect(tenants).toHaveLength(0);
    });

    it('should return 400 status code if name or address is missing', async () => {
      const tenantData = {
        name: '',
        address: ''
      };

      const response = await request(app)
        .post('/api/tenants')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(tenantData);

      const tenants = await getTenants(connection);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(tenants).toHaveLength(0);
    });
  });
});
