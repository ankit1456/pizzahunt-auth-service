import request from 'supertest';
import app from './app';
import { calculateDiscount } from './utils';

describe('App', () => {
  it('should calculate discount and return', () => {
    const discount = calculateDiscount(1000, 10);

    expect(discount).toBe(100);
  });

  it('should return success status', async () => {
    const response = await request(app).get('/').send();

    expect(response.statusCode).toBe(200);
  });
});
