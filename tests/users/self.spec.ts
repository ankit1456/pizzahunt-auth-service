import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { createUser } from '../utils';

describe('GET /api/auth/self', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5000');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
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
    it('should return 200 status code', async () => {
      const user = await createUser(connection.getRepository(User));

      const accessToken = jwks.token({
        sub: user.id,
        role: user.role
      });

      const response = await request(app)
        .get('/api/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.statusCode).toBe(200);
    });

    it('should return the user data', async () => {
      const user = await createUser(connection.getRepository(User));

      const accessToken = jwks.token({ sub: user.id, role: user.role });

      const response = await request(app)
        .get('/api/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect((response.body as Record<string, string>).id).toBe(user.id);
    });

    it('should not return password', async () => {
      const user = await createUser(connection.getRepository(User));

      const accessToken = jwks.token({ sub: user.id, role: user.role });

      const response = await request(app)
        .get('/api/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.body).not.toHaveProperty('password');
    });
    it("should return 401 statuscode if token doesn't exist", async () => {
      const response = await request(app).get('/api/auth/self').send();

      expect(response.statusCode).toBe(401);
    });

    it("should return 404 statuscode if user doesn't exists", async () => {
      const accessToken = jwks.token({
        sub: 'a9ef7318-c4b3-4ee6-95c0-d4cb102673e9',
        role: 'customer'
      });

      const response = await request(app)
        .get('/api/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
