import { DataSource } from 'typeorm';
import request from 'supertest';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import bcrypt from 'bcrypt';
import { isJwt } from '../utils';

describe('POST /api/auth/login', () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();

    // create a user before each test
    const userRepository = connection.getRepository(User);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await userRepository.save({ ...userData, password: hashedPassword });
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
    const creds = {
      email: 'ankit@gmail.com',
      password: 'test1234'
    };

    it('should return 200 status code', async () => {
      const response = await request(app).post('/api/auth/login').send(creds);

      expect(response.statusCode).toBe(200);
    });

    it('should return accessToken and refreshToken and should be jwt', async () => {
      const response = await request(app).post('/api/auth/login').send(creds);

      interface Headers {
        ['set-cookie']: string[];
      }

      let accessToken = null;
      let refreshToken = null;
      const cookies =
        (response.headers as unknown as Headers)['set-cookie'] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0]?.split('=')[1];
        } else if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0]?.split('=')[1];
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });
  });

  describe('failure cases', () => {
    it('should return error if email or password is missing', async () => {
      const creds = {
        email: '',
        password: ''
      };

      const response = await request(app).post('/api/auth/login').send(creds);

      expect(response.statusCode).toBe(400);
      expect((response.body as Record<string, string>).errors).toHaveLength(3);
    });

    it('should return error if email is not valid', async () => {
      const creds = {
        email: 'ankit',
        password: 'test1234'
      };

      const response = await request(app).post('/api/auth/login').send(creds);

      expect(response.statusCode).toBe(400);
      expect((response.body as Record<string, string>).errors).toHaveLength(1);
    });

    it('should return error if email or password is incorrect', async () => {
      const creds = {
        email: 'ankit@gmail.com',
        password: 'test12345'
      };

      const response = await request(app).post('/api/auth/login').send(creds);

      expect(response.statusCode).toBe(400);
      expect((response.body as Record<string, string>).errors).toHaveLength(1);
    });
  });
});
