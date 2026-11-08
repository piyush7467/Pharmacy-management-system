import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { prisma } from '../src/config/prisma.js';

describe('Financial Reports & Mathematical Ledger Reconciliation', { timeout: 30000 }, () => {
  let adminAccessToken = '';
  let cashierAccessToken = '';

  beforeAll(async () => {
    // Authenticate Admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD
      });

    adminAccessToken = adminLogin.body.data.accessToken;

    // Create or find a test cashier user for RBAC verification
    const cashierEmail = `test.cashier.${Date.now()}@pharmapulse.demo`;
    const createCashierRes = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Test Auditor Cashier',
        email: cashierEmail,
        password: 'CashierPassword123!',
        role: 'CASHIER'
      });

    if (createCashierRes.status === 201) {
      const cashierLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: cashierEmail,
          password: 'CashierPassword123!'
        });
      cashierAccessToken = cashierLogin.body.data.accessToken;
    }
  }, 30000);

  it('GET /api/v1/reports/sales-summary returns sales metrics & trend', async () => {
    const res = await request(app)
      .get('/api/v1/reports/sales-summary')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.grossSales).toBeGreaterThanOrEqual(0);
    expect(res.body.data.totalTax).toBeGreaterThanOrEqual(0);
    expect(res.body.data.netRevenue).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.body.data.paymentMethodDistribution)).toBe(true);
    expect(Array.isArray(res.body.data.dailyTrend)).toBe(true);
  });

  it('GET /api/v1/reports/stock-valuation calculates cost & retail valuations', async () => {
    const res = await request(app)
      .get('/api/v1/reports/stock-valuation')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUnits).toBeGreaterThan(0);
    expect(res.body.data.totalCostValuation).toBeGreaterThan(0);
    expect(res.body.data.totalRetailValuation).toBeGreaterThan(0);
    expect(res.body.data.potentialGrossMargin).toBeDefined();
    expect(Array.isArray(res.body.data.categoryBreakdown)).toBe(true);
  });

  // Acceptance Test #5: Mathematical Ledger Reconciliation
  it('GET /api/v1/reports/reconciliation verifies stock balance matches immutable movements', async () => {
    const res = await request(app)
      .get('/api/v1/reports/reconciliation')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('BALANCED');
    expect(res.body.data.isBalanced).toBe(true);
    expect(res.body.data.discrepancy).toBe(0);
    expect(res.body.data.currentTotalUnits).toBe(res.body.data.netMovementsDelta);
    expect(res.body.data.movementTypeBreakdown).toBeDefined();
  });

  it('GET /api/v1/audit-logs retrieves immutable audit trail for ADMIN', async () => {
    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].action).toBeDefined();
    expect(res.body.data[0].entityName).toBeDefined();
  });

  it('GET /api/v1/audit-logs denies access to CASHIER', async () => {
    if (!cashierAccessToken) return;

    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${cashierAccessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
