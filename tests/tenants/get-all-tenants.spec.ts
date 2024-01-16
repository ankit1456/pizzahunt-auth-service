import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Tenant } from '../../src/entity/Tenant';
import { createTenant } from '../utils';

describe('GET /api/tenants', () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('success cases', () => {
    it('should return all tenants with 200 status code', async () => {
      await createTenant(connection.getRepository(Tenant));

      const response = await request(app).get('/api/tenants').send();

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
    });
  });
});
