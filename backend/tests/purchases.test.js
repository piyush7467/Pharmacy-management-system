import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { prisma } from '../src/config/prisma.js';

describe('Purchases & Goods Receiving Module', { timeout: 30000 }, () => {
  let adminAccessToken = '';
  let supplierId = '';
  let medicineId = '';
  let testPurchaseId = '';
  const testBatchNumber = `TEST-LOT-${Date.now().toString().slice(-6)}`;

  beforeAll(async () => {
    // Authenticate as Admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD
      });

    adminAccessToken = loginRes.body.data.accessToken;

    // Fetch existing supplier and medicine from database seed
    const supplier = await prisma.supplier.findFirst({ where: { isActive: true } });
    supplierId = supplier.id;

    const medicine = await prisma.medicine.findFirst({ where: { isActive: true } });
    medicineId = medicine.id;
  });

  it('GET /api/v1/purchases returns purchase orders list', async () => {
    const res = await request(app)
      .get('/api/v1/purchases')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/purchases creates a purchase order with validated items', async () => {
    const futureExpiry = new Date();
    futureExpiry.setFullYear(futureExpiry.getFullYear() + 2);

    const res = await request(app)
      .post('/api/v1/purchases')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        supplierId,
        notes: 'Urgent stock intake order for testing',
        status: 'DRAFT',
        items: [
          {
            medicineId,
            batchNumber: testBatchNumber,
            expiryDate: futureExpiry.toISOString().split('T')[0],
            orderedQuantity: 50,
            unitCost: 10.0,
            unitSalePrice: 15.0
          }
        ]
      });

    expect(res.status).toBe(201);
    testPurchaseId = res.body.data.id;
    expect(res.body.success).toBe(true);
    expect(res.body.data.purchaseNumber).toBeDefined();
    expect(res.body.data.subtotal).toBe(500); // 50 * 10
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.items.length).toBe(1);
  });

  it('POST /api/v1/purchases rejects expired batch dates', async () => {
    const pastExpiry = new Date();
    pastExpiry.setMonth(pastExpiry.getMonth() - 2);

    const res = await request(app)
      .post('/api/v1/purchases')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        supplierId,
        items: [
          {
            medicineId,
            batchNumber: 'EXPIRED-BATCH',
            expiryDate: pastExpiry.toISOString().split('T')[0],
            orderedQuantity: 10,
            unitCost: 5.0,
            unitSalePrice: 10.0
          }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/purchases/:id retrieves purchase details', async () => {
    const res = await request(app)
      .get(`/api/v1/purchases/${testPurchaseId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testPurchaseId);
    expect(res.body.data.supplier).toBeDefined();
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].batchNumber).toBe(testBatchNumber);
  });

  it('POST /api/v1/purchases/:id/receive receives shipment and creates batch + movement', async () => {
    const res = await request(app)
      .post(`/api/v1/purchases/${testPurchaseId}/receive`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({}); // Full receipt default

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('RECEIVED');
    expect(res.body.data.receivedDate).toBeDefined();

    // Verify batch was created in database
    const batch = await prisma.batch.findUnique({
      where: {
        medicineId_batchNumber: {
          medicineId,
          batchNumber: testBatchNumber
        }
      }
    });

    expect(batch).toBeDefined();
    expect(batch.currentQuantity).toBe(50);
    expect(batch.status).toBe('ACTIVE');

    // Verify StockMovement entry
    const movement = await prisma.stockMovement.findFirst({
      where: {
        batchId: batch.id,
        referenceId: testPurchaseId,
        movementType: 'PURCHASE_RECEIPT'
      }
    });

    expect(movement).toBeDefined();
    expect(movement.quantityDelta).toBe(50);
    expect(movement.balanceAfter).toBe(50);

    // Verify AuditLog was recorded
    const audit = await prisma.auditLog.findFirst({
      where: {
        entityId: testPurchaseId,
        action: 'RECEIVE_PURCHASE'
      }
    });

    expect(audit).toBeDefined();
  });

  it('POST /api/v1/purchases/:id/receive rejects receiving already received purchase', async () => {
    const res = await request(app)
      .post(`/api/v1/purchases/${testPurchaseId}/receive`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/purchases/:id/cancel rejects cancelling a received purchase', async () => {
    const res = await request(app)
      .patch(`/api/v1/purchases/${testPurchaseId}/cancel`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
