import createJWKSMock, { JWKSMock } from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config';
import { User } from '../../src/entity';
import { ERoles } from '../../src/types/auth.types';
import { createUser, getUsers } from '../utils';
import { EStatus } from '../../src/types';

describe('DELETE /api/users/:userId', () => {
  let connection: DataSource;
  let jwks: JWKSMock;
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
      role: ERoles.ADMIN
    });
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('success cases', () => {
    it('should delete a user and return success message with 200 status code', async () => {
      const { id } = await createUser(connection.getRepository(User));
      const response = await request(app)
        .delete(`/api/users/${id}`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send();

      const users = await getUsers(connection);
      expect(users).toHaveLength(0);
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(EStatus.SUCCESS);
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
        role: ERoles.MANAGER
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
