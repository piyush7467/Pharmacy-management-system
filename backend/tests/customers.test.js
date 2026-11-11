import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';

describe('Multi-Tier Customer Management & Ledger API', { timeout: 35000 }, () => {
  let adminAccessToken = '';
  let createdCustomerId = '';
  let createdCustomerCode = '';

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD
      });

    adminAccessToken = adminLogin.body.data.accessToken;
  });

  it('GET /api/v1/customers rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/customers');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/customers creates a new hospital institutional customer profile', async () => {
    const payload = {
      type: 'HOSPITAL_CLINIC',
      name: 'Dr. Ananya Roy (Medical Superintendent)',
      companyName: 'Metro Multispeciality Hospital',
      phone: '+91 9988776655',
      email: 'procurement@metrohospital.org',
      taxNumber: '07AAACM4821N1Z5',
      drugLicenseNo: 'DL-20B-78912',
      defaultDiscountPct: 12.5,
      creditLimit: 250000,
      paymentTermsDays: 30,
      address: 'Plot 42, Healthcare Enclave, New Delhi',
      notes: 'Weekly consolidated institutional delivery'
    };

    const res = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('customerCode');
    expect(res.body.data.customerCode.startsWith('HOSP-')).toBe(true);
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.companyName).toBe(payload.companyName);
    expect(res.body.data.taxNumber).toBe(payload.taxNumber);
    expect(res.body.data.defaultDiscountPct).toBe(12.5);
    expect(res.body.data.creditLimit).toBe(250000);
    expect(res.body.data.currentBalance).toBe(0);

    createdCustomerId = res.body.data.id;
    createdCustomerCode = res.body.data.customerCode;
  });

  it('GET /api/v1/customers/lookup finds the customer via debounced query', async () => {
    const res = await request(app)
      .get('/api/v1/customers/lookup')
      .query({ q: 'Metro Multispeciality' })
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const match = res.body.data.find((c) => c.id === createdCustomerId);
    expect(match).toBeDefined();
    expect(match.name).toBe('Dr. Ananya Roy (Medical Superintendent)');
    expect(match.companyName).toBe('Metro Multispeciality Hospital');
  });

  it('GET /api/v1/customers/:id retrieves complete customer profile', async () => {
    const res = await request(app)
      .get(`/api/v1/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdCustomerId);
    expect(res.body.data.type).toBe('HOSPITAL_CLINIC');
  });

  it('PATCH /api/v1/customers/:id updates customer terms and notes', async () => {
    const res = await request(app)
      .patch(`/api/v1/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        defaultDiscountPct: 15,
        creditLimit: 300000,
        notes: 'Updated credit limit approved by pharmacy manager'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.defaultDiscountPct).toBe(15);
    expect(res.body.data.creditLimit).toBe(300000);
  });

  it('POST /api/v1/customers/:id/payments records ledger settlement', async () => {
    const res = await request(app)
      .post(`/api/v1/customers/${createdCustomerId}/payments`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        amount: 5000,
        paymentMethod: 'BANK_TRANSFER',
        notes: 'Advance deposit NEFT-9912048'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amountPaid).toBe(5000);
  });

  it('DELETE /api/v1/customers/:id soft-deletes customer profile', async () => {
    const res = await request(app)
      .delete(`/api/v1/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify subsequent lookup does not return the deleted customer
    const checkRes = await request(app)
      .get(`/api/v1/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(checkRes.status).toBe(404);
  });
});
