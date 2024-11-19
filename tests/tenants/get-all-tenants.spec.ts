import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config';
import { API_ROUTE_PREFIX, EStatus } from '../../src/utils/constants';
import { Tenant } from '../../src/entity';
import { createTenant } from '../utils';

describe(`GET ${API_ROUTE_PREFIX}/tenants`, () => {
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

      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/tenants`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(EStatus.SUCCESS);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return all tenants with 200 status code with search query', async () => {
      await createTenant(connection.getRepository(Tenant));

      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/tenants?q=name`)
        .send();

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe(tenantData.name);
    });
  });
});
