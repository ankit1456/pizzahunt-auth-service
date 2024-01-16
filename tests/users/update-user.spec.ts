import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/types/roles.enum';
import { createUser } from '../utils';

describe('PATCH /api/users/:userId', () => {
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
    it('should update a user and return 200 status code', async () => {
      const userRepository = connection.getRepository(User);

      const { id } = await createUser(userRepository);

      const response = await request(app)
        .patch(`/api/users/${id}`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send({ role: Roles.CUSTOMER, firstName: 'Ankit Kumar' });

      const users = await userRepository.find();

      expect(response.statusCode).toBe(200);
      expect(users[0]?.firstName).toBe('Ankit Kumar');
      expect(users[0]?.role).toBe(Roles.CUSTOMER);
    });
  });
  describe('failure cases', () => {
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .patch('/api/users/fa72c1dc-00d1-42f4-9e87-fe03afab0560')
        .send({ role: Roles.CUSTOMER });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 403 if user is not an admin', async () => {
      const nonAdminToken = jwks.token({
        sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
        role: Roles.MANAGER
      });

      const response = await request(app)
        .patch('/api/users/fa72c1dc-00d1-42f4-9e87-fe03afab0560')
        .set('Cookie', [`accessToken=${nonAdminToken};`])
        .send({ role: Roles.CUSTOMER });

      expect(response.statusCode).toBe(403);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 if id is not a valid uuid', async () => {
      const response = await request(app)
        .patch('/api/users/wfwef')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send({ role: Roles.CUSTOMER });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
    it('should return 404 if user not found', async () => {
      const response = await request(app)
        .patch('/api/users/fa72c1dc-00d1-42f4-9e87-fe03afab0560')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send();

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('errors');
    });
    it('should return 400 if fields are not valid', async () => {
      const userData = {
        firstName: '',
        lastName: 'T',
        email: 'ankit@gmail.'
      };

      const response = await request(app)
        .patch('/api/users/fa72c1dc-00d1-42f4-9e87-fe03afab0560')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      expect(response.statusCode).toBe(400);
      expect((response.body as Record<string, string>).errors).toHaveLength(2);
    });
  });
});