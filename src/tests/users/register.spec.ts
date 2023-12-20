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
    it('should return 201 statusCode', async () => {
      // AAA
      //   A -> Arrange

      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234'
      };
      //   A -> Act

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      //   A -> Assert

      expect(response.statusCode).toBe(201);
    });

    it('should return a valid json', async () => {
      const response = await request(app).post('/api/auth/register').send();

      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json')
      );
    });

    it('should persist the user in the database', async () => {
      const userData = {
        firstName: 'Ankit',
        lastName: 'Tripahi',
        email: 'ankit@gmail.com',
        password: 'test1234'
      };
      await request(app).post('/api/auth/register').send(userData);

      const userRespository = connection.getRepository(User);
      const users = await userRespository.find();

      expect(users).toHaveLength(1);
    });
  });
  describe('failure cases', () => {});
});
