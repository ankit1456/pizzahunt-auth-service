import bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { RefreshToken } from '../../src/entity/RefreshToken';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/types/roles.enum';
import { generateRefreshToken } from '../utils';

describe('POST /api/auth/refresh', () => {
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
    it('should clear the cookies and return success message', async () => {
      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: ' ankit@gmail.com ',
        password: 'test1234'
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
      const accessToken = jwks.token(payload);

      const newRefreshToken = await refreshTokenRepository.save({
        user,
        expiresAt: new Date(Date.now() + MS_IN_YEAR)
      });

      const refreshToken = generateRefreshToken({
        ...payload,
        id: newRefreshToken.id
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [
          `refreshToken=${refreshToken};accessToken=${accessToken}`
        ])
        .send();

      interface Headers {
        ['set-cookie']: string[];
      }

      let acToken = '';
      let rfToken = '';
      const cookies =
        (response.headers as unknown as Headers)['set-cookie'] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          acToken = cookie.split(';')[0]?.split('=')[1] as string;
        } else if (cookie.startsWith('refreshToken=')) {
          rfToken = cookie.split(';')[0]?.split('=')[1] as string;
        }
      });

      const refreshTokens = await refreshTokenRepository.find();

      expect(refreshTokens).toHaveLength(0);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(acToken).toBeFalsy();
      expect(rfToken).toBeFalsy();
    });
  });
  describe('failure cases', () => {
    it('should return 401 if refresh token or accessToken is missing', async () => {
      const payload: JwtPayload = {
        sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
        role: Roles.CUSTOMER
      };
      const accessToken = jwks.token(payload);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send();

      expect(response.statusCode).toBe(401);
    });
  });
});
