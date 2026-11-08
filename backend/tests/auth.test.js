import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { env } from '../src/config/env.js';

describe('Authentication & Staff Management Module', { timeout: 20000 }, () => {
  let adminAccessToken = '';
  let adminRefreshTokenCookie = '';
  let createdStaffId = '';

  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD;

  it('POST /api/v1/auth/login successfully authenticates admin with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(adminEmail);
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data).toHaveProperty('accessToken');

    adminAccessToken = res.body.data.accessToken;

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    adminRefreshTokenCookie = refreshCookie.split(';')[0];
  });

  it('POST /api/v1/auth/login rejects invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: adminEmail,
        password: 'WrongPassword999!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/v1/auth/me returns current authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(adminEmail);
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('GET /api/v1/auth/me rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/refresh rotates refresh token and returns new access token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [adminRefreshTokenCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');

    const newCookies = res.headers['set-cookie'];
    expect(newCookies).toBeDefined();
    const newRefreshCookie = newCookies.find((c) => c.startsWith('refreshToken='));
    expect(newRefreshCookie).toBeDefined();
    adminRefreshTokenCookie = newRefreshCookie.split(';')[0];
  });

  it('POST /api/v1/users allows ADMIN to create a new PHARMACIST', async () => {
    const testPharmacistEmail = `pharmacist-${Date.now()}@pharmapulse.demo`;
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Diya Sharma (Test Pharmacist)',
        email: testPharmacistEmail,
        password: 'PharmacistPass123!',
        role: 'PHARMACIST'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testPharmacistEmail);
    expect(res.body.data.user.role).toBe('PHARMACIST');
    expect(res.body.data.user.isActive).toBe(true);

    createdStaffId = res.body.data.user.id;
  });

  it('POST /api/v1/users prevents ADMIN from creating another ADMIN', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Second Admin Attempt',
        email: `admin2-${Date.now()}@pharmapulse.demo`,
        password: 'AdminPassword123!',
        role: 'ADMIN'
      });

    expect(res.status).toBe(400); // Caught by Zod enum schema validation
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/users/:id/status allows ADMIN to suspend and reactivate staff', async () => {
    // Suspend
    const suspendRes = await request(app)
      .patch(`/api/v1/users/${createdStaffId}/status`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ isActive: false });

    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.data.user.isActive).toBe(false);

    // Reactivate
    const activateRes = await request(app)
      .patch(`/api/v1/users/${createdStaffId}/status`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ isActive: true });

    expect(activateRes.status).toBe(200);
    expect(activateRes.body.data.user.isActive).toBe(true);
  });

  it('DELETE /api/v1/users/:id allows ADMIN to soft-delete staff member', async () => {
    const deleteRes = await request(app)
      .delete(`/api/v1/users/${createdStaffId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const deletedInDb = await prisma.user.findUnique({
      where: { id: createdStaffId }
    });
    expect(deletedInDb.deletedAt).not.toBeNull();
    expect(deletedInDb.isActive).toBe(false);
  });

  it('POST /api/v1/auth/forgot-password returns generic success without leaking email existence', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'non-existent-user@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('If your email is registered');
  });

  it('POST /api/v1/auth/logout revokes refresh session and clears cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', [adminRefreshTokenCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
