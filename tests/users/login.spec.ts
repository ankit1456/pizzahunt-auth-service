import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { createUser, isJwt } from '../utils';

describe('POST /api/auth/login', () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();

    // create a user before each test
    await createUser(connection.getRepository(User));
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Success cases', () => {
    const creds = {
      email: 'ankit@gmail.com',
      password: 'test1234'
    };

    it('should return 200 status code', async () => {
      const response = await request(app).post('/api/auth/login').send(creds);

      expect(response.statusCode).toBe(200);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return accessToken and refreshToken and should be jwt', async () => {
      const response = await request(app).post('/api/auth/login').send(creds);

      interface Headers {
        'set-cookie': string[];
      }

      let accessToken = '';
      let refreshToken = '';
      const cookies =
        (response.headers as unknown as Headers)['set-cookie'] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0]?.split('=')[1] as string;
        } else if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0]?.split('=')[1] as string;
        }
      });

      expect(accessToken).not.toBeFalsy();
      expect(refreshToken).not.toBeFalsy();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });
  });

  describe('Failure cases', () => {
    it('should return error if email or password is missing', async () => {
      const creds = {
        email: '',
        password: ''
      };

      const response = await request(app).post('/api/auth/login').send(creds);

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toHaveLength(3);
    });

    it('should return error if email is not valid', async () => {
      const creds = {
        email: 'ankit',
        password: 'test1234'
      };

      const response = await request(app).post('/api/auth/login').send(creds);

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toHaveLength(1);
    });

    it('should return error if email or password is incorrect', async () => {
      const creds = {
        email: 'ankit@gmail.com',
        password: 'test12345'
      };

      const response = await request(app).post('/api/auth/login').send(creds);

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toHaveLength(1);
    });
  });
});
