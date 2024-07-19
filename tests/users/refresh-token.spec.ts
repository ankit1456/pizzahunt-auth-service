import { JwtPayload } from 'jsonwebtoken';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { RefreshToken, User } from '../../src/entity';
import {
  createRefreshToken,
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

      const refreshTokenDocument = await createRefreshToken(
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

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');

      expect(accessToken).not.toBeFalsy();
      expect(rfToken).not.toBeFalsy();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(rfToken)).toBeTruthy();
    });
  });
  describe('Failure cases', () => {
    it('should return exception for unexpected error', async () => {
      const refreshTokenRepository = connection.getRepository(RefreshToken);
      const user = await createUser(connection.getRepository(User));

      const payload: JwtPayload = {
        sub: user.id,
        role: user.role
      };

      const newRefreshToken = await createRefreshToken(
        refreshTokenRepository,
        user
      );

      const refreshToken = generateRefreshToken({
        ...payload,
        id: newRefreshToken.id
      });

      refreshTokenRepository.findOne = jest
        .fn()
        .mockRejectedValue(new Error('unexpected error'));

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken};`])
        .send();

      expect(response.statusCode).toBe(401);
      expect(response.body.errors).toHaveLength(1);
    });

    it('should return 401 if refresh token is missing', async () => {
      const response = await request(app).post('/api/auth/refresh').send();

      expect(response.statusCode).toBe(401);
    });
  });
});
