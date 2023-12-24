import request from 'supertest';
import app from '../../app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { truncateTables } from '../utils';
import { User } from '../../entity/User';

describe('POST /api/auth/register', () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // Database truncate
    await truncateTables(connection);
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
      password: 'test1234'
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
  });
  describe('failure cases', () => {});
});
