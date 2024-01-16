import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/types/roles.enum';

describe('DELETE /api/users/:userId', () => {
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
    const userData = {
      firstName: 'Ankit',
      lastName: 'Tripahi',
      email: 'ankit@gmail.com',
      password: 'test1234',
      role: Roles.MANAGER
    };
    it('should delete a user and return success message with 200 status code', async () => {
      const userRepository = connection.getRepository(User);

      const { id } = await userRepository.save(userData);

      const response = await request(app)
        .delete(`/api/users/${id}`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send();

      const users = await userRepository.find();

      expect(users).toHaveLength(0);
      expect(response.statusCode).toBe(200);
    });
  });
  describe('failure cases', () => {
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .delete('/api/users/fa72c1dc-00d1-42f4-9e87-fe03afab0560')
        .send();

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 403 if user is not an admin', async () => {
      const nonAdminToken = jwks.token({
        sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
        role: Roles.MANAGER
      });

      const response = await request(app)
        .delete('/api/users/fa72c1dc-00d1-42f4-9e87-fe03afab0560')
        .set('Cookie', [`accessToken=${nonAdminToken};`])
        .send();

      expect(response.statusCode).toBe(403);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 if id is not a valid uuid', async () => {
      const response = await request(app)
        .delete('/api/users/wfwef')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send();

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
    it('should return 404 if user not found', async () => {
      const response = await request(app)
        .delete('/api/users/fa72c1dc-00d1-42f4-9e87-fe03afab0560')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send();

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
