import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Healthcheck & Global Middleware', () => {
  it('GET /api/v1/health returns 200 with service status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.service).toBe('PharmaPulse Backend API');
    expect(res.body.meta).toHaveProperty('requestId');
  });

  it('GET /non-existent-route returns 404 AppError envelope', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RESOURCE_NOT_FOUND');
    expect(res.body.meta).toHaveProperty('requestId');
  });
});
