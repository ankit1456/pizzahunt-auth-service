import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';

describe('POST /api/auth/login', () => {
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
  });

  describe('failure cases', () => {});
});
