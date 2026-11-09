import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';

describe('Catalogue, Categories & Suppliers Module', { timeout: 20000 }, () => {
  let adminAccessToken = '';
  let testCategoryId = '';
  let testSupplierId = '';
  let testMedicineId = '';

  beforeAll(async () => {
    // Authenticate as Admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD
      });

    adminAccessToken = loginRes.body.data.accessToken;
  });

  // 1. Categories
  it('GET /api/v1/categories returns list of categories', async () => {
    const res = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/categories creates a new category', async () => {
    const uniqueCategoryName = `Dermatology & Skin Care ${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: uniqueCategoryName,
        description: 'Topical skin treatments and ointments'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category.name).toBe(uniqueCategoryName);

    testCategoryId = res.body.data.category.id;
  });

  it('POST /api/v1/categories rejects duplicate category name', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'Analgesics & Antipyretics' // Already seeded
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CATEGORY_EXISTS');
  });

  // 2. Suppliers
  it('POST /api/v1/suppliers creates a new supplier', async () => {
    const res = await request(app)
      .post('/api/v1/suppliers')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: `MedLife Logistics ${Date.now()}`,
        contactPerson: 'Karan Malhotra',
        phone: '+91 98111 22334',
        email: 'supply@medlifelogistics.demo',
        address: 'B-12 Industrial Park, Gurgaon, Haryana',
        taxNumber: '07AAAAA0000A1Z5'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.supplier.contactPerson).toBe('Karan Malhotra');

    testSupplierId = res.body.data.supplier.id;
  });

  it('GET /api/v1/suppliers returns paginated supplier directory', async () => {
    const res = await request(app)
      .get('/api/v1/suppliers')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((s) => s.id === testSupplierId)).toBe(true);
  });

  // 3. Medicines
  it('POST /api/v1/medicines creates a new medicine record', async () => {
    const uniqueSku = `SKU-TEST-${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/medicines')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'Hydrocortisone 1% Cream',
        genericName: 'Hydrocortisone',
        categoryId: testCategoryId,
        sku: uniqueSku,
        dosageForm: 'Cream',
        strength: '1% w/w',
        packageUnit: 'Tube of 15g',
        minReorderLevel: 15,
        defaultTaxRate: 12.0
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.medicine.sku).toBe(uniqueSku);
    expect(res.body.data.medicine.minReorderLevel).toBe(15);

    testMedicineId = res.body.data.medicine.id;
  });

  it('POST /api/v1/medicines rejects duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/v1/medicines')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'Duplicate SKU Drug',
        genericName: 'Some Generic',
        categoryId: testCategoryId,
        sku: 'MED-PCM-500', // Already seeded
        dosageForm: 'Tablet',
        strength: '500mg',
        packageUnit: 'Box',
        minReorderLevel: 20
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SKU_EXISTS');
  });

  it('GET /api/v1/medicines computes live available stock across active batches', async () => {
    const res = await request(app)
      .get('/api/v1/medicines?search=Paracetamol')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const pcm = res.body.data.find((m) => m.sku === 'MED-PCM-500');
    expect(pcm).toBeDefined();
    // In seed: Batch 1 has 80 units, Batch 2 has 150 units. Expired batch (20 units) is excluded!
    // Total active non-expired stock must be at least 230 units:
    expect(pcm.totalAvailableStock).toBeGreaterThanOrEqual(230);
  });

  it('DELETE /api/v1/categories rejects deletion of category containing medicines', async () => {
    const res = await request(app)
      .delete(`/api/v1/categories/${testCategoryId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CATEGORY_NOT_EMPTY');
  });

  // 4. CSV Import, Export & Template
  it('GET /api/v1/medicines/template returns downloadable CSV template with active categories', async () => {
    const res = await request(app)
      .get('/api/v1/medicines/template')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('Medicine Name,Generic Composition,Primary Category');
    expect(res.text).toContain('Secondary Indications');
  });

  it('POST /api/v1/medicines/import imports bulk medicines and auto-creates missing categories', async () => {
    const uniqueCategoryName = `Auto Import Category ${Date.now()}`;
    const testSku = `IMPORT-SKU-${Date.now()}`;

    const res = await request(app)
      .post('/api/v1/medicines/import')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        rows: [
          {
            name: 'Test Bulk Medicine A',
            genericName: 'Sample Molecule 500mg',
            categoryName: uniqueCategoryName,
            sku: testSku,
            dosageForm: 'Tablet',
            strength: '500mg',
            packageUnit: 'Strip of 10',
            minReorderLevel: 15,
            defaultTaxRate: 12.0,
            therapeuticClasses: ['Fever Relief', 'Headache'],
            manufacturer: 'Auto Pharma Ltd'
          }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.created).toBe(1);
    expect(res.body.data.createdCategories).toBe(1);

    // Verify category was auto-created and matches 'needs_description' filter
    const catCheck = await request(app)
      .get(`/api/v1/categories?status=needs_description&search=${encodeURIComponent(uniqueCategoryName)}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(catCheck.status).toBe(200);
    expect(catCheck.body.data.length).toBeGreaterThanOrEqual(1);
    expect(catCheck.body.data[0].name).toBe(uniqueCategoryName);
    expect(catCheck.body.data[0].description).toBeNull();
  });

  it('GET /api/v1/medicines/export exports entire catalog as CSV', async () => {
    const res = await request(app)
      .get('/api/v1/medicines/export')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('Medicine Name,Generic Composition');
  });
});
