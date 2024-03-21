import request from 'supertest';
import app from '../src/app';

describe('Service health check', () => {
  it('should return service health status', async () => {
    const response = await request(app).get('/').send();

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('OK');
  });
});
