import { PrismaClient, Role, BatchStatus } from '@prisma/client';
import argon2 from 'argon2';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting deterministic seed for PharmaPulse...');

  // 1. Clean existing records in reverse dependency order
  await prisma.passwordResetToken.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.returnItem.deleteMany({});
  await prisma.customerReturn.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.stockAdjustment.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.purchaseItem.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.medicine.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Initial Admin only (from backend .env variables)
  const adminEmail = env.ADMIN_EMAIL || 'admin@pharmapulse.demo';
  const adminPassword = env.ADMIN_PASSWORD || 'Admin@SecurePassword123';

  const passwordHash = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      fullName: 'System Administrator',
      role: Role.ADMIN
    }
  });

  console.log(`✅ Initial Admin seeded from environment: ${admin.email}`);

  // 3. Seed Categories
  const analgesics = await prisma.category.create({
    data: {
      name: 'Analgesics & Antipyretics',
      description: 'Pain relief and fever reducing medications'
    }
  });

  const antibiotics = await prisma.category.create({
    data: {
      name: 'Antibiotics & Antimicrobials',
      description: 'Bacterial and microbial infection treatments'
    }
  });

  const vitamins = await prisma.category.create({
    data: {
      name: 'Vitamins & Dietary Supplements',
      description: 'Essential micronutrients and health supplements'
    }
  });

  // 4. Seed Suppliers
  const supplierA = await prisma.supplier.create({
    data: {
      name: 'Apex Pharma Distributors',
      contactPerson: 'Sanjay Mehra',
      phone: '+91 98200 11223',
      email: 'orders@apexpharma.demo',
      address: 'Plot 45, MIDC Industrial Area, Mumbai, Maharashtra 400093',
      taxNumber: '27AABCU9603R1ZM'
    }
  });

  const supplierB = await prisma.supplier.create({
    data: {
      name: 'Zenith Healthcare Logistics',
      contactPerson: 'Pooja Nair',
      phone: '+91 98450 33445',
      email: 'supply@zenithmed.demo',
      address: '22 Electronic City Phase 1, Bengaluru, Karnataka 560100',
      taxNumber: '29AABCP1234D1ZK'
    }
  });

  // 5. Seed Medicines
  const paracetamol = await prisma.medicine.create({
    data: {
      categoryId: analgesics.id,
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      sku: 'MED-PCM-500',
      dosageForm: 'Tablet',
      strength: '500mg',
      packageUnit: 'Strip of 10',
      minReorderLevel: 50,
      defaultTaxRate: 12.0
    }
  });

  const amoxicillin = await prisma.medicine.create({
    data: {
      categoryId: antibiotics.id,
      name: 'Amoxicillin 250mg Capsules',
      genericName: 'Amoxicillin Trihydrate',
      sku: 'MED-AMX-250',
      dosageForm: 'Capsule',
      strength: '250mg',
      packageUnit: 'Strip of 10',
      minReorderLevel: 30,
      defaultTaxRate: 12.0
    }
  });

  const vitaminC = await prisma.medicine.create({
    data: {
      categoryId: vitamins.id,
      name: 'Ascorbic Acid (Vitamin C) 500mg Chewable',
      genericName: 'Ascorbic Acid',
      sku: 'MED-VTC-500',
      dosageForm: 'Chewable Tablet',
      strength: '500mg',
      packageUnit: 'Bottle of 30',
      minReorderLevel: 25,
      defaultTaxRate: 18.0
    }
  });

  // 6. Seed Batches (for FEFO testing)
  // Batch 1 (Early expiry: expires in 45 days)
  const batchEarly = await prisma.batch.create({
    data: {
      medicineId: paracetamol.id,
      batchNumber: 'BATCH-PCM-2026A',
      manufacturingDate: new Date('2026-01-10'),
      expiryDate: new Date('2026-12-20'), // ~45 days from Nov 2026
      initialQuantity: 100,
      currentQuantity: 80,
      purchaseCost: 15.0,
      salePrice: 25.0,
      mrp: 30.0,
      status: BatchStatus.ACTIVE
    }
  });

  // Batch 2 (Later expiry: expires in 180 days)
  const batchLate = await prisma.batch.create({
    data: {
      medicineId: paracetamol.id,
      batchNumber: 'BATCH-PCM-2026B',
      manufacturingDate: new Date('2026-03-15'),
      expiryDate: new Date('2027-05-15'),
      initialQuantity: 150,
      currentQuantity: 150,
      purchaseCost: 14.5,
      salePrice: 25.0,
      mrp: 30.0,
      status: BatchStatus.ACTIVE
    }
  });

  // Batch 3 (Expired batch - for testing block)
  const batchExpired = await prisma.batch.create({
    data: {
      medicineId: paracetamol.id,
      batchNumber: 'BATCH-PCM-EXPIRED',
      manufacturingDate: new Date('2025-01-01'),
      expiryDate: new Date('2026-10-01'), // Past expiry!
      initialQuantity: 50,
      currentQuantity: 20,
      purchaseCost: 12.0,
      salePrice: 25.0,
      mrp: 30.0,
      status: BatchStatus.EXPIRED
    }
  });

  // Batch 4 (Low stock drug)
  const batchAmx = await prisma.batch.create({
    data: {
      medicineId: amoxicillin.id,
      batchNumber: 'BATCH-AMX-2026-01',
      manufacturingDate: new Date('2026-02-01'),
      expiryDate: new Date('2027-02-01'),
      initialQuantity: 50,
      currentQuantity: 12, // Below minReorderLevel (30) to test alert!
      purchaseCost: 65.0,
      salePrice: 95.0,
      mrp: 110.0,
      status: BatchStatus.ACTIVE
    }
  });

  // 7. Seed Initial StockMovements to establish reconciliation baseline
  await prisma.stockMovement.create({
    data: {
      batchId: batchEarly.id,
      movementType: 'PURCHASE_RECEIPT',
      quantityDelta: 100,
      balanceAfter: 100,
      performedByUserId: admin.id,
      reason: 'Initial opening stock intake'
    }
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batchEarly.id,
      movementType: 'SALE_DEDUCTION',
      quantityDelta: -20,
      balanceAfter: 80,
      performedByUserId: admin.id,
      reason: 'Opening sample sale test deduction'
    }
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batchLate.id,
      movementType: 'PURCHASE_RECEIPT',
      quantityDelta: 150,
      balanceAfter: 150,
      performedByUserId: admin.id,
      reason: 'Initial opening stock intake'
    }
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batchExpired.id,
      movementType: 'PURCHASE_RECEIPT',
      quantityDelta: 20,
      balanceAfter: 20,
      performedByUserId: admin.id,
      reason: 'Opening expired stock verification lot'
    }
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batchAmx.id,
      movementType: 'PURCHASE_RECEIPT',
      quantityDelta: 12,
      balanceAfter: 12,
      performedByUserId: admin.id,
      reason: 'Opening low stock intake'
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: 'SEED_INITIALIZATION',
      entityName: 'SYSTEM',
      entityId: admin.id,
      diff: { note: 'Initial seed baseline generated' }
    }
  });

  console.log('✅ Deterministic seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
