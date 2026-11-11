import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';

describe('Real-Time Notifications & System Alerts Module', { timeout: 30000 }, () => {
  let adminAccessToken = '';

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD
      });

    adminAccessToken = adminLogin.body.data.accessToken;
  });

  it('GET /api/v1/notifications rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/notifications returns operational notifications and summary', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('notifications');
    expect(res.body.data).toHaveProperty('summary');
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.data.summary).toHaveProperty('total');
    expect(res.body.data.summary).toHaveProperty('criticalCount');
    expect(res.body.data.summary).toHaveProperty('warningCount');
    expect(res.body.data.summary).toHaveProperty('infoCount');

    // If notifications exist, verify structure
    if (res.body.data.notifications.length > 0) {
      const first = res.body.data.notifications[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('category');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('severity');
      expect(first).toHaveProperty('title');
      expect(first).toHaveProperty('message');
      expect(first).toHaveProperty('targetUrl');
    }
  });
});
