import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { RefreshToken } from '../../src/entity/RefreshToken';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/types/auth.types';
import { createUser, getUsers, isJwt } from '../utils';

describe('POST /api/auth/register', () => {
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
    // AAA
    //   A -> Arrange

    const userData = {
      firstName: 'Ankit',
      lastName: 'Tripahi',
      email: 'ankit@gmail.com',
      password: 'test1234',
      role: Roles.CUSTOMER
    };
    it('should return 201 statusCode', async () => {
      //   A -> Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      //   A -> Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return a valid json', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json')
      );
    });

    it('should persist the user in the database', async () => {
      await request(app).post('/api/auth/register').send(userData);

      const users = await getUsers(connection);

      expect(users).toHaveLength(1);
      expect(users[0]?.firstName).toBe('Ankit');
    });

    it('should return created user and role should be customer', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const users = await getUsers(connection);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(users[0]?.id);

      expect(users[0]).toHaveProperty('role');
      expect(users[0]?.role).toBe(Roles.CUSTOMER);
    });

    it('should store hashed password', async () => {
      await request(app).post('/api/auth/register').send(userData);

      const userRespository = connection.getRepository(User);
      const users = await userRespository.find({
        select: ['password']
      });

      expect(users[0]?.password).not.toBe(userData.password);
      expect(users[0]?.password).toHaveLength(60);
      expect(users[0]?.password).toMatch(/^\$2[a|b]\$\d+\$/);
    });

    it('should return 400 statuscode if email already exists', async () => {
      const userRespository = connection.getRepository(User);
      await createUser(userRespository);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const users = await userRespository.find();

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toHaveLength(1);
      expect(users).toHaveLength(1);
    });

    it('should return the access token and refresh token inside a cookie', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      interface Headers {
        ['set-cookie']: string[];
      }

      let accessToken = '';
      let refreshToken = '';
      const cookies =
        (response.headers as unknown as Headers)['set-cookie'] || [];
      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0]?.split('=')[1] as string;
        }
        if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0]?.split('=')[1] as string;
        }
      });

      expect(accessToken).not.toBeFalsy();
      expect(refreshToken).not.toBeFalsy();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it('should store the refresh token in the database', async () => {
      const respose = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const refreshTokenRepository = connection.getRepository(RefreshToken);

      const tokens = await refreshTokenRepository
        .createQueryBuilder('refreshToken')
        .where('refreshToken.userId = :userId', {
          userId: respose.body.id
        })
        .getMany();

      expect(tokens).toHaveLength(1);
    });
  });

  describe('Failure cases', () => {
    it('should return 400 status code if email is missing', async () => {
      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: '',
        password: 'test1234'
      };

      const users = await getUsers(connection);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(users.length).toBe(0);
    });
    it('should return 400 status code if firstName,lastName or password is missing', async () => {
      const userData = {
        firstName: '   ',
        lastName: '',
        email: 'ankit@gmail.com',
        password: ''
      };

      const users = await getUsers(connection);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(3);
      expect(users.length).toBe(0);
    });
  });

  describe('Input sanitization', () => {
    it('should trim all the fields', async () => {
      const userData = {
        firstName: ' Ankit ',
        lastName: ' Tripahi  ',
        email: ' ankit@gmail.com ',
        password: 'test1234',
        role: Roles.CUSTOMER
      };

      await request(app).post('/api/auth/register').send(userData);

      const users = await getUsers(connection);

      expect(users[0]?.email).toBe(userData.email.trim());
      expect(users[0]?.firstName).toBe(userData.firstName.trim());
      expect(users[0]?.lastName).toBe(userData.lastName.trim());
    });

    it('should return 400 status code if email is not valid', async () => {
      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit',
        password: 'test1234',
        role: Roles.CUSTOMER
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const users = await getUsers(connection);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(users).toHaveLength(0);
    });

    it('should return 400 status code if password is shorter than 8 chars', async () => {
      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit',
        password: 'test12'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const users = await getUsers(connection);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(users).toHaveLength(0);
    });

    it('should return 400 status code if firstName or lastName exceeds the chars limit', async () => {
      const userData = {
        firstName: 'ChristopherMichaelJacksonwefwefwefe',
        lastName: 'AndersonCooperJohnsonSmithwefwefwefwefwef',
        email: 'ankit@gmail.com',
        password: 'test1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const users = await getUsers(connection);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(1);
      expect(users).toHaveLength(0);
    });
  });
});
