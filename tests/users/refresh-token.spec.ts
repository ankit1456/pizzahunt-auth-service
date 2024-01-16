import bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { RefreshToken } from '../../src/entity/RefreshToken';
import { User } from '../../src/entity/User';
import { generateRefreshToken, isJwt } from '../utils';
import { Roles } from '../../src/types/roles.enum';

describe('POST /api/auth/refresh', () => {
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
    it('should return user id with accessToken and refreshToken in cookie', async () => {
      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: ' ankit@gmail.com ',
        password: 'test1234',
        role: Roles.CUSTOMER
      };

      const userRepository = connection.getRepository(User);
      const refreshTokenRepository = connection.getRepository(RefreshToken);

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await userRepository.save({
        ...userData,
        password: hashedPassword
      });

      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1 year

      const payload: JwtPayload = {
        sub: user.id,
        role: user.role
      };

      const newRefreshToken = await refreshTokenRepository.save({
        user,
        expiresAt: new Date(Date.now() + MS_IN_YEAR)
      });

      const refreshToken = generateRefreshToken({
        ...payload,
        id: newRefreshToken.id
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken};`])
        .send();

      interface Headers {
        ['set-cookie']: string[];
      }

      let accessToken = '';
      let rfToken = '';
      const cookies =
        (response.headers as unknown as Headers)['set-cookie'] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0]?.split('=')[1] as string;
        } else if (cookie.startsWith('refreshToken=')) {
          rfToken = cookie.split(';')[0]?.split('=')[1] as string;
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');

      expect(accessToken).not.toBeFalsy();
      expect(rfToken).not.toBeFalsy();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(rfToken)).toBeTruthy();
    });
  });
  describe('failure cases', () => {
    it('should return 401 if refresh token is missing', async () => {
      const response = await request(app).post('/api/auth/refresh').send();

      expect(response.statusCode).toBe(401);
    });
  });
});
