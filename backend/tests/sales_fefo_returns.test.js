import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { prisma } from '../src/config/prisma.js';

describe('POS, FEFO Engine, Invoicing & Returns Module', { timeout: 40000 }, () => {
  let adminAccessToken = '';
  let testMedicineId = '';
  let batchEarlyId = '';
  let batchLateId = '';
  let batchExpiredId = '';
  let completedSaleId = '';
  let completedSaleInvoiceNumber = '';
  let saleItemEarlyId = '';

  const now = new Date();

  beforeAll(async () => {
    // 1. Authenticate as Admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD
      });

    adminAccessToken = loginRes.body.data.accessToken;
    const adminUserId = loginRes.body.data.user.id;

    // 2. Setup a dedicated test medicine and specific test batches to guarantee 100% test isolation
    const category = await prisma.category.findFirst();
    const uniqueSuffix = Date.now().toString().slice(-6);

    const medicine = await prisma.medicine.create({
      data: {
        categoryId: category.id,
        name: `FEFO Test Amoxicillin ${uniqueSuffix}`,
        genericName: 'Amoxicillin Trihydrate',
        sku: `SKU-FEFO-${uniqueSuffix}`,
        dosageForm: 'Capsule',
        strength: '500mg',
        packageUnit: 'Strip of 10',
        minReorderLevel: 15,
        defaultTaxRate: 10.0
      }
    });

    testMedicineId = medicine.id;

    // Batch 1 (Early expiry): 50 units, expires in 2 months
    const earlyExpiry = new Date();
    earlyExpiry.setMonth(earlyExpiry.getMonth() + 2);

    const bEarly = await prisma.batch.create({
      data: {
        medicineId: testMedicineId,
        batchNumber: `BATCH-EARLY-${uniqueSuffix}`,
        expiryDate: earlyExpiry,
        initialQuantity: 50,
        currentQuantity: 50,
        purchaseCost: 8.0,
        salePrice: 12.0,
        status: 'ACTIVE'
      }
    });
    batchEarlyId = bEarly.id;

    await prisma.stockMovement.create({
      data: {
        batchId: bEarly.id,
        movementType: 'PURCHASE_RECEIPT',
        quantityDelta: 50,
        balanceAfter: 50,
        performedByUserId: adminUserId,
        reason: 'Initial intake for test lot'
      }
    });

    // Batch 2 (Late expiry): 50 units, expires in 12 months
    const lateExpiry = new Date();
    lateExpiry.setMonth(lateExpiry.getMonth() + 12);

    const bLate = await prisma.batch.create({
      data: {
        medicineId: testMedicineId,
        batchNumber: `BATCH-LATE-${uniqueSuffix}`,
        expiryDate: lateExpiry,
        initialQuantity: 50,
        currentQuantity: 50,
        purchaseCost: 9.0,
        salePrice: 14.0,
        status: 'ACTIVE'
      }
    });
    batchLateId = bLate.id;

    await prisma.stockMovement.create({
      data: {
        batchId: bLate.id,
        movementType: 'PURCHASE_RECEIPT',
        quantityDelta: 50,
        balanceAfter: 50,
        performedByUserId: adminUserId,
        reason: 'Initial intake for test lot'
      }
    });

    // Batch 3 (Expired): 30 units, expired 10 days ago
    const pastExpiry = new Date();
    pastExpiry.setDate(pastExpiry.getDate() - 10);

    const bExpired = await prisma.batch.create({
      data: {
        medicineId: testMedicineId,
        batchNumber: `BATCH-EXPIRED-${uniqueSuffix}`,
        expiryDate: pastExpiry,
        initialQuantity: 30,
        currentQuantity: 30,
        purchaseCost: 5.0,
        salePrice: 10.0,
        status: 'ACTIVE' // Even if status was ACTIVE, engine must refuse it!
      }
    });
    batchExpiredId = bExpired.id;

    await prisma.stockMovement.create({
      data: {
        batchId: bExpired.id,
        movementType: 'PURCHASE_RECEIPT',
        quantityDelta: 30,
        balanceAfter: 30,
        performedByUserId: adminUserId,
        reason: 'Initial intake for test expired lot'
      }
    });
  }, 40000);

  // Acceptance Test #1: FEFO Batch Deduction
  it('POST /api/v1/sales executes greedy FEFO deduction across earliest batches', async () => {
    // We request 60 units of testMedicineId.
    // Early batch has 50 units. Late batch has 50 units.
    // FEFO Engine MUST:
    // 1. Take all 50 units from Early Batch (balance -> 0, status -> DEPLETED)
    // 2. Take remaining 10 units from Late Batch (balance -> 40, status -> ACTIVE)
    // 3. Completely ignore Expired Batch (balance remains 30)

    const res = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        customerName: 'Jane Doe',
        customerPhone: '9876543210',
        paymentMethod: 'CASH',
        items: [
          {
            medicineId: testMedicineId,
            quantity: 60
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invoiceNumber).toBeDefined();
    expect(res.body.data.items.length).toBe(2); // Split into 2 batch allocations

    completedSaleId = res.body.data.id;
    completedSaleInvoiceNumber = res.body.data.invoiceNumber;

    // Verify first allocation was from Early Batch
    const earlyItem = res.body.data.items.find((i) => i.batchId === batchEarlyId);
    expect(earlyItem).toBeDefined();
    expect(earlyItem.quantity).toBe(50);
    expect(earlyItem.unitPrice).toBe(12.0);
    saleItemEarlyId = earlyItem.id;

    // Verify second allocation was from Late Batch
    const lateItem = res.body.data.items.find((i) => i.batchId === batchLateId);
    expect(lateItem).toBeDefined();
    expect(lateItem.quantity).toBe(10);
    expect(lateItem.unitPrice).toBe(14.0);

    // Verify database state of Early Batch (depleted to 0)
    const earlyDb = await prisma.batch.findUnique({ where: { id: batchEarlyId } });
    expect(earlyDb.currentQuantity).toBe(0);
    expect(earlyDb.status).toBe('DEPLETED');

    // Verify database state of Late Batch (decremented to 40)
    const lateDb = await prisma.batch.findUnique({ where: { id: batchLateId } });
    expect(lateDb.currentQuantity).toBe(40);
    expect(lateDb.status).toBe('ACTIVE');

    // Verify database state of Expired Batch (untouched at 30)
    const expiredDb = await prisma.batch.findUnique({ where: { id: batchExpiredId } });
    expect(expiredDb.currentQuantity).toBe(30);

    // Verify StockMovements created of type SALE_DEDUCTION
    const movements = await prisma.stockMovement.findMany({
      where: { referenceId: completedSaleId, movementType: 'SALE_DEDUCTION' }
    });
    expect(movements.length).toBe(2);
    expect(movements.some((m) => m.batchId === batchEarlyId && m.quantityDelta === -50)).toBe(true);
    expect(movements.some((m) => m.batchId === batchLateId && m.quantityDelta === -10)).toBe(true);
  });

  // Acceptance Test #2: Expired Batch Blocking
  it('POST /api/v1/sales rejects sale when requested quantity exceeds active non-expired stock', async () => {
    // At this point:
    // Early batch: 0
    // Late batch: 40
    // Expired batch: 30
    // Total physical units = 70, but total ACTIVE NON-EXPIRED units = only 40!
    // Requesting 45 units MUST FAIL because the 30 expired units must NEVER be touched!

    const res = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        customerName: 'Test Buyer',
        paymentMethod: 'UPI',
        items: [
          {
            medicineId: testMedicineId,
            quantity: 45
          }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  // Idempotency Support
  it('POST /api/v1/sales respects idempotency key to prevent double checkout', async () => {
    const key = `IDEMP-${Date.now()}`;

    // First request
    const res1 = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .set('Idempotency-Key', key)
      .send({
        customerName: 'Idempotent Buyer',
        items: [{ medicineId: testMedicineId, quantity: 5 }]
      });

    expect(res1.status).toBe(201);
    const invoice1 = res1.body.data.invoiceNumber;

    // Retry request with same key
    const res2 = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .set('Idempotency-Key', key)
      .send({
        customerName: 'Idempotent Buyer',
        items: [{ medicineId: testMedicineId, quantity: 5 }]
      });

    expect(res2.status).toBe(201);
    expect(res2.body.data.invoiceNumber).toBe(invoice1); // Same sale returned without double-deduction!
  });

  // Acceptance Test #4: Customer Returns with Restocking & Reasons
  it('POST /api/v1/returns processes return, restocks batch, and records movement', async () => {
    // We return 5 units from the earlyItem (which was 50 units sold from batchEarlyId)
    const res = await request(app)
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        saleId: completedSaleId,
        reason: 'Customer doctor altered dosage regimen to 250mg',
        items: [
          {
            saleItemId: saleItemEarlyId,
            quantity: 5,
            disposition: 'RESTOCKED'
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.returnNumber).toBeDefined();
    expect(res.body.data.items[0].quantity).toBe(5);

    // Verify early batch had its stock restored from 0 to 5, and status reactivated to ACTIVE!
    const restoredBatch = await prisma.batch.findUnique({ where: { id: batchEarlyId } });
    expect(restoredBatch.currentQuantity).toBe(5);
    expect(restoredBatch.status).toBe('ACTIVE');

    // Verify StockMovement of type CUSTOMER_RETURN
    const returnMovement = await prisma.stockMovement.findFirst({
      where: {
        batchId: batchEarlyId,
        referenceId: res.body.data.id,
        movementType: 'CUSTOMER_RETURN'
      }
    });

    expect(returnMovement).toBeDefined();
    expect(returnMovement.quantityDelta).toBe(5);
    expect(returnMovement.balanceAfter).toBe(5);
  });

  it('POST /api/v1/returns rejects return when quantity exceeds sold amount', async () => {
    // Early item was 50 units. We already returned 5. Max remaining returnable is 45.
    // Attempting to return 50 more units must fail:
    const res = await request(app)
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        saleId: completedSaleId,
        reason: 'Attempting excessive return',
        items: [
          {
            saleItemId: saleItemEarlyId,
            quantity: 50,
            disposition: 'RESTOCKED'
          }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EXCEEDS_SOLD_QUANTITY');
  });

  it('POST /api/v1/returns rejects return when reason is missing', async () => {
    const res = await request(app)
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        saleId: completedSaleId,
        reason: '',
        items: [
          {
            saleItemId: saleItemEarlyId,
            quantity: 1,
            disposition: 'RESTOCKED'
          }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('REASON_REQUIRED');
  });

  // Acceptance Test #5: Stock Adjustments with Audit Reasons
  it('POST /api/v1/inventory/adjustments records write-off with mandatory reason', async () => {
    const res = await request(app)
      .post('/api/v1/inventory/adjustments')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        batchId: batchLateId,
        adjustmentType: 'WRITE_OFF_DAMAGED',
        quantityDelta: -2,
        reason: 'Water leakage in storage bay shelf C'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.adjustmentNumber).toBeDefined();

    // Verify StockMovement of type ADJUSTMENT_WRITE_OFF
    const adjMovement = await prisma.stockMovement.findFirst({
      where: {
        batchId: batchLateId,
        movementType: 'ADJUSTMENT_WRITE_OFF'
      }
    });

    expect(adjMovement).toBeDefined();
    expect(adjMovement.quantityDelta).toBe(-2);
  });
});
