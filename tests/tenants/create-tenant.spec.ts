import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { Tenant } from '../../src/entity/Tenant';

describe('POST /api/tenants', () => {
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
    const tenantData = {
      name: 'Tenant name',
      address: 'Tenant address'
    };

    it('should return 201 status code', async () => {
      const response = await request(app).post('/api/tenants').send(tenantData);
      expect(response.statusCode).toBe(201);
    });
    it('should create tenant in the database', async () => {
      await request(app).post('/api/tenants').send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tanants = await tenantRepository.find();

      expect(tanants).toHaveLength(1);
      expect(tanants[0]?.name).toBe(tenantData.name);
      expect(tanants[0]?.address).toBe(tenantData.address);
    });
  });

  describe('failure cases', () => {});
});
