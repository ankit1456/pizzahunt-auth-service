import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config';
import { Tenant } from '../../src/entity';
import { createTenant } from '../utils';
import { EStatus } from '../../src/types';

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

  const tenantData = {
    name: 'New tenant name'
  };

  describe('success cases', () => {
    it('should return all tenants with 200 status code', async () => {
      await createTenant(connection.getRepository(Tenant));

      const response = await request(app).get('/api/tenants').send();

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(EStatus.SUCCESS);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return all tenants with 200 status code', async () => {
      await createTenant(connection.getRepository(Tenant));

      const response = await request(app).get('/api/tenants?q=name').send();

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe(tenantData.name);
    });
  });
});
