import createJWKSMock, { JWKSMock } from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config';
import { User } from '../../src/entity';
import { API_ROUTE_PREFIX, ERoles, EStatus } from '../../src/utils/constants';
import { createUser } from '../utils';

describe(`GET ${API_ROUTE_PREFIX}/users`, () => {
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
    it('should return all users with 200 status code', async () => {
      await createUser(connection.getRepository(User));

      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/users`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(EStatus.SUCCESS);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return filtered users', async () => {
      await createUser(connection.getRepository(User));

      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/users?q=ankit&role=customer`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send();

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe('ankit@gmail.com');
      expect(response.body.data[0].role).toBe(ERoles.CUSTOMER);
    });
  });
  describe('failure cases', () => {
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/users`)
        .send();

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('ref');
    });

    it('should return 403 if user is not an admin', async () => {
      const nonAdminToken = jwks.token({
        sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
        role: ERoles.MANAGER
      });

      const response = await request(app)
        .get(`${API_ROUTE_PREFIX}/users`)
        .set('Cookie', [`accessToken=${nonAdminToken};`])
        .send();

      expect(response.statusCode).toBe(403);
      expect(response.body).toHaveProperty('ref');
    });
  });
});
