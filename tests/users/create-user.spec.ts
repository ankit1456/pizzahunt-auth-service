import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Tenant } from '../../src/entity/Tenant';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/types/auth.types';
import { createTenant } from '../utils';

describe('POST /api/users', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5000');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();

    adminToken = jwks.token({
      sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
      role: Roles.ADMIN
    });
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('success cases', () => {
    it('should return 201 status code', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234',
        role: Roles.MANAGER,
        tenantId: tenant.id
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      expect(response.statusCode).toBe(201);
    });

    it('should persist user in the database', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234',
        role: Roles.MANAGER,
        tenantId: tenant.id
      };

      await request(app)
        .post('/api/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      const userRepository = connection.getRepository(User);

      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0]?.email).toBe(userData.email);
      expect(users[0]?.role).toBe(Roles.MANAGER);
    });
  });
  describe('failure cases', () => {
    it('should return 500 on unexpected error', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234',
        role: Roles.MANAGER,
        tenantId: tenant.id
      };

      const userRepository = connection.getRepository(User);

      userRepository.findOneBy = jest
        .fn()
        .mockRejectedValue(new Error('Unexpected error'));

      const users = await userRepository.find();

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      expect(response.statusCode).toBe(500);
      expect(response.body.errors).toHaveLength(1);
      expect(users).toHaveLength(0);
    });
    it("should return 401 statuscode if token doesn't exist", async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234',
        role: Roles.MANAGER,
        tenantId: tenant.id
      };
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      const response = await request(app).post('/api/users').send(userData);

      expect(response.statusCode).toBe(401);
      expect((response.body as Record<string, string>).errors).toHaveLength(1);
      expect(users).toHaveLength(0);
    });

    it('should return 400 status code if firstName, lastName, email or password is missing', async () => {
      const userData = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect((response.body as Record<string, string>).errors?.length).toBe(8);

      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(0);
    });

    it('should return 400 status code if email is not valid', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail',
        password: 'test1234',
        role: Roles.MANAGER,
        tenantId: tenant.id
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      const userRepository = connection.getRepository(User);

      const users = await userRepository.find();

      expect(users).toHaveLength(0);
      expect(response.statusCode).toBe(400);
      expect((response.body as Record<string, string>).errors?.length).toBe(1);
    });

    it('should return 403 if non admin creates a user', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234',
        role: Roles.MANAGER,
        tenantId: tenant.id
      };
      const nonAdminToken = jwks.token({
        sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
        role: Roles.MANAGER
      });
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', [`accessToken=${nonAdminToken};`])
        .send(userData);

      expect(response.statusCode).toBe(403);
      expect((response.body as Record<string, string>).errors).toHaveLength(1);
      expect(users).toHaveLength(0);
    });
  });
});
