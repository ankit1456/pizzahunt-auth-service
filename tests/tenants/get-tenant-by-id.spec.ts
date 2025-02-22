import createJWKSMock, { JWKSMock } from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config';
import { Tenant } from '../../src/entity';
import { API_ROUTE_PREFIX, ERoles, EStatus } from '../../src/utils/constants';
import { createTenant } from '../utils';

describe(`GET ${API_ROUTE_PREFIX}/tenants/:tenantId`, () => {
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
      role: ERoles.ADMIN
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

  describe('success cases', () => {
    it('should return a tenant of passed id with 200 status code', async () => {
      const { id } = await createTenant(connection.getRepository(Tenant));

      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/tenants/${id}`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(EStatus.SUCCESS);
      expect(response.body.tenant.id).toBe(id);
    });
    it('should return 404 status code if tenant not found', async () => {
      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/tenants/bb7972d1-4642-4612-927f-c70afbdcba89`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send();

      expect(response.statusCode).toBe(404);
    });
  });

  describe('failure cases', () => {
    it('should return 401 if user is not logged in', async () => {
      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/tenants/bb7972d1-4642-4612-927f-c70afbdcba89`)
        .send();

      expect(response.statusCode).toBe(401);
      expect(response.body.type).toBe('UnauthorizedError');
    });

    it('should return 403 if user is not admin', async () => {
      const nonAdminToken = jwks.token({
        sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
        role: ERoles.MANAGER
      });

      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/tenants/bb7972d1-4642-4612-927f-c70afbdcba89`)
        .set('Cookie', [`accessToken=${nonAdminToken}`])
        .send();

      expect(response.statusCode).toBe(403);
      expect(response.body.type).toBe('ForbiddenError');
    });
    it('should return 400 if id is not a valid uuid', async () => {
      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/tenants/fwef`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send();

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
