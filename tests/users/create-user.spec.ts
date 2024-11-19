import createJWKSMock, { JWKSMock } from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config';
import { Tenant, User } from '../../src/entity';
import { API_ROUTE_PREFIX, ERoles, EStatus } from '../../src/utils/constants';
import { createTenant, createUser, getUsers } from '../utils';

describe(`POST ${API_ROUTE_PREFIX}/users`, () => {
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

  describe('Success cases', () => {
    it('should return 201 status code', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234',
        role: ERoles.MANAGER,
        tenantId: tenant.id
      };

      const response = await request(app)
        .post(`${API_ROUTE_PREFIX}/users`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe(EStatus.SUCCESS);
    });

    it('should persist user in the database', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234',
        role: ERoles.MANAGER,
        tenantId: tenant.id
      };

      await request(app)
        .post(`${API_ROUTE_PREFIX}/users`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      const users = await getUsers(connection);

      expect(users).toHaveLength(1);
      expect(users[0]?.email).toBe(userData.email);
      expect(users[0]?.role).toBe(ERoles.MANAGER);
    });
  });
  describe('failure cases', () => {
    it("should return 401 statuscode if token doesn't exist", async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234',
        role: ERoles.MANAGER,
        tenantId: tenant.id
      };

      const users = await getUsers(connection);
      const response = await request(app)
        .post(`${API_ROUTE_PREFIX}/users`)
        .send(userData);

      expect(response.statusCode).toBe(401);
      expect(response.body.type).toBe('UnauthorizedError');
      expect(users).toHaveLength(0);
    });

    it('should return 400 status code if firstName, lastName, email or password is missing', async () => {
      const userData = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      };

      const response = await request(app)
        .post(`${API_ROUTE_PREFIX}/users`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      const users = await getUsers(connection);

      expect(response.body.errors?.length).not.toBeFalsy();

      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(0);
    });

    it('should return 400 status code if email already exists', async () => {
      await createUser(connection.getRepository(User));
      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234'
      };
      const response = await request(app)
        .post(`${API_ROUTE_PREFIX}/users`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      const users = await getUsers(connection);

      expect(response.body.type).toBe('BadRequestError');
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });

    it('should return 400 status code if email is not valid', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail',
        password: 'test1234',
        role: ERoles.MANAGER,
        tenantId: tenant.id
      };

      const response = await request(app)
        .post(`${API_ROUTE_PREFIX}/users`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      const users = await getUsers(connection);
      expect(users).toHaveLength(0);
      expect(response.statusCode).toBe(400);
      expect(response.body.errors?.length).toBe(1);
    });

    it('should return 403 if non admin creates a user', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234',
        role: ERoles.MANAGER,
        tenantId: tenant.id
      };
      const nonAdminToken = jwks.token({
        sub: 'fa72c1dc-00d1-42f4-9e87-fe03afab0560',
        role: ERoles.MANAGER
      });

      const users = await getUsers(connection);

      const response = await request(app)
        .post(`${API_ROUTE_PREFIX}/users`)
        .set('Cookie', [`accessToken=${nonAdminToken};`])
        .send(userData);

      expect(response.statusCode).toBe(403);
      expect(response.body.type).toBe('ForbiddenError');
      expect(users).toHaveLength(0);
    });
  });
});
