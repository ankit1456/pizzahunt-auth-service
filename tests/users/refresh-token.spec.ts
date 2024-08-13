import { JwtPayload } from 'jsonwebtoken';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config';
import { RefreshToken, User } from '../../src/entity';
import {
  persistRefreshToken,
  createUser,
  generateRefreshToken,
  isJwt
} from '../utils';

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

  describe('Success cases', () => {
    it('should return user id with accessToken and refreshToken in cookie', async () => {
      const user = await createUser(connection.getRepository(User));

      const payload: JwtPayload = {
        sub: user.id,
        role: user.role
      };

      const refreshTokenDocument = await persistRefreshToken(
        connection.getRepository(RefreshToken),
        user
      );

      const refreshToken = generateRefreshToken({
        ...payload,
        id: refreshTokenDocument.id
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken};`])
        .send();

      interface Headers {
        'set-cookie': string[];
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

      expect(response.ok).toBeTruthy();
      expect(response.body).toHaveProperty('status');

      expect(accessToken).not.toBeFalsy();
      expect(rfToken).not.toBeFalsy();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(rfToken)).toBeTruthy();
    });
  });
  describe('Failure cases', () => {
    it('should return 401 if refresh token is missing', async () => {
      const response = await request(app).post('/api/auth/refresh').send();

      expect(response.unauthorized).toBeTruthy();
      expect(response.body.type).toBe('UnauthorizedError');
    });

    it('should return 400 if refresh token is invalid', async () => {
      const user = await createUser(connection.getRepository(User));

      const payload: JwtPayload = {
        sub: user.id,
        role: user.role
      };

      const refreshTokenDocument = await persistRefreshToken(
        connection.getRepository(RefreshToken),
        user
      );

      const refreshToken = generateRefreshToken({
        ...payload,
        id: refreshTokenDocument.id
      });

      const refreshTokenRepository = connection.getRepository(RefreshToken);
      await refreshTokenRepository.delete({ id: refreshTokenDocument.id });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken};`])
        .send();

      expect(response.unauthorized).toBeTruthy();
      expect(response.body.type).toBe('UnauthorizedError');
    });
  });
});
