import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import createJWKSMock from 'mock-jwks';

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

  const userData = {
    firstName: 'Ankit',
    lastName: 'Tripahi',
    email: 'ankit@gmail.com',
    password: 'test1234'
  };

  describe('success cases', () => {
    it('should return 200 status code', async () => {
      const accessToken = jwks.token({
        sub: 'a9ef7318-c4b3-4ee6-95c0-d4cb102673e9',
        role: 'customer'
      });

      const response = await request(app)
        .get('/api/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.statusCode).toBe(200);
    });

    it('should return the user data', async () => {
      const userRepository = connection.getRepository(User);
      const user = await userRepository.save(userData);

      const accessToken = jwks.token({ sub: user.id, role: user.role });

      const response = await request(app)
        .get('/api/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect((response.body as Record<string, string>).id).toBe(user.id);
    });

    it('should not return password', async () => {
      const userRepository = connection.getRepository(User);
      const user = await userRepository.save(userData);

      const accessToken = jwks.token({ sub: user.id, role: user.role });

      const response = await request(app)
        .get('/api/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.body).not.toHaveProperty('password');
    });
    it('should return 401 statuscode if token doesn"t exist', async () => {
      const userRepository = connection.getRepository(User);
      await userRepository.save(userData);

      const response = await request(app).get('/api/auth/self').send();

      expect(response.statusCode).toBe(401);
    });
  });
});
