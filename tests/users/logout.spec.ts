import { JwtPayload } from 'jsonwebtoken';
import createJWKSMock, { JWKSMock } from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config';
import { RefreshToken, User } from '../../src/entity';
import { ERoles } from '../../src/utils/constants';
import {
  createUser,
  generateRefreshToken,
  getRefreshTokens,
  persistRefreshToken
} from '../utils';

describe('POST /api/auth/logout', () => {
  let connection: DataSource;
  let jwks: JWKSMock;

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

  describe('Success cases', () => {
    it('should clear the cookies and return success message', async () => {
      const user = await createUser(connection.getRepository(User));

      const payload: JwtPayload = {
        sub: user.id,
        role: user.role
      };
      const accessToken = jwks.token(payload);

      const refreshTokenDocument = await persistRefreshToken(
        connection.getRepository(RefreshToken),
        user
      );

      const refreshToken = generateRefreshToken({
        ...payload,
        id: refreshTokenDocument.id
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [
          `refreshToken=${refreshToken};accessToken=${accessToken}`
        ])
        .send();

      interface Headers {
        'set-cookie': string[];
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

      const refreshTokens = await getRefreshTokens(connection);

      expect(refreshTokens).toHaveLength(0);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(acToken).toBeFalsy();
      expect(rfToken).toBeFalsy();
    });
  });
  describe('Failure cases', () => {
    it('should return 401 if refresh token or accessToken is missing', async () => {
      const payload: JwtPayload = {
        sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
        role: ERoles.CUSTOMER
      };
      const accessToken = jwks.token(payload);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send();

      expect(response.statusCode).toBe(401);
      expect(response.body.type).toBe('UnauthorizedError');
    });
  });
});
