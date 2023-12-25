import request from 'supertest';
import app from '../../app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { User } from '../../entity/User';
import { Roles } from '../../types/roles.enum';

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

  describe('success cases', () => {
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

      const userRespository = connection.getRepository(User);
      const users = await userRespository.find();

      expect(users).toHaveLength(1);
      expect(users[0]?.firstName).toBe('Ankit');
    });
    it('should return created user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const userRespository = connection.getRepository(User);
      const users = await userRespository.find();
      expect(response.body).toHaveProperty('id');
      expect((response.body as Record<string, string>).id).toBe(users[0]?.id);
    });

    it('should assign a customer role', async () => {
      await request(app).post('/api/auth/register').send(userData);

      const userRespository = connection.getRepository(User);
      const users = await userRespository.find();
      expect(users[0]).toHaveProperty('role');
      expect(users[0]?.role).toBe(Roles.CUSTOMER);
    });
    it('should store hashed password', async () => {
      await request(app).post('/api/auth/register').send(userData);

      const userRespository = connection.getRepository(User);
      const users = await userRespository.find();

      expect(users[0]?.password).not.toBe(userData.password);
      expect(users[0]?.password).toHaveLength(60);
      expect(users[0]?.password).toMatch(/^\$2[a|b]\$\d+\$/);
    });
    it('should return 400 statuscode if email exists', async () => {
      const userRespository = connection.getRepository(User);
      await userRespository.save({ ...userData, role: Roles.CUSTOMER });
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const users = await userRespository.find();

      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });
  });
  describe('failure cases', () => {});
});
