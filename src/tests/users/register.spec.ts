import request from 'supertest';
import app from '../../app';

describe('POST /api/auth/register', () => {
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
  });
  describe('failure cases', () => {});
});
