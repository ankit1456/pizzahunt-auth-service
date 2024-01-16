import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { Tenant } from '../../src/entity/Tenant';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/types/roles.enum';
import { createTenant } from '../utils';

describe('POST /api/tenants', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let accessToken: string;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5000');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();

    accessToken = jwks.token({
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

  describe('success cases', () => {
    it('should return all tenants with 200 status code', async () => {
      await createTenant(connection.getRepository(Tenant));

      const response = await request(app)
        .get('/api/tenants')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
    });
  });

  describe('failure cases', () => {
    it('should return 401 if user is not logged in', async () => {
      const response = await request(app).get('/api/tenants').send();

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
