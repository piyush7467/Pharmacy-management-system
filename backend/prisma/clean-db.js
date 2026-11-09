import { PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function cleanDatabase() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'piyushshakya112@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@uhdf*#ji#768gh';

  console.log(`🧹 Starting full database cleanup (Preserving Admin: ${adminEmail})...\n`);

  try {
    // 1. Delete all transactional, movements, and audit records
    const delReset = await prisma.passwordResetToken.deleteMany({});
    console.log(`- Deleted ${delReset.count} password reset tokens`);

    const delAudit = await prisma.auditLog.deleteMany({});
    console.log(`- Deleted ${delAudit.count} audit logs`);

    const delMovements = await prisma.stockMovement.deleteMany({});
    console.log(`- Deleted ${delMovements.count} stock movements`);

    const delReturnItems = await prisma.returnItem.deleteMany({});
    console.log(`- Deleted ${delReturnItems.count} return items`);

    const delReturns = await prisma.customerReturn.deleteMany({});
    console.log(`- Deleted ${delReturns.count} customer returns`);

    const delSaleItems = await prisma.saleItem.deleteMany({});
    console.log(`- Deleted ${delSaleItems.count} sale items`);

    const delSales = await prisma.sale.deleteMany({});
    console.log(`- Deleted ${delSales.count} sales records`);

    const delAdjustments = await prisma.stockAdjustment.deleteMany({});
    console.log(`- Deleted ${delAdjustments.count} stock adjustments`);

    const delBatches = await prisma.batch.deleteMany({});
    console.log(`- Deleted ${delBatches.count} inventory batches`);

    const delPurchaseItems = await prisma.purchaseItem.deleteMany({});
    console.log(`- Deleted ${delPurchaseItems.count} purchase items`);

    const delPurchases = await prisma.purchase.deleteMany({});
    console.log(`- Deleted ${delPurchases.count} purchase orders`);

    // 2. Delete catalogue and suppliers
    const delMedicines = await prisma.medicine.deleteMany({});
    console.log(`- Deleted ${delMedicines.count} medicines`);

    const delCategories = await prisma.category.deleteMany({});
    console.log(`- Deleted ${delCategories.count} categories`);

    const delSuppliers = await prisma.supplier.deleteMany({});
    console.log(`- Deleted ${delSuppliers.count} suppliers`);

    // 3. Clear session tokens
    const delTokens = await prisma.refreshToken.deleteMany({});
    console.log(`- Deleted ${delTokens.count} active refresh sessions`);

    // 4. Delete all staff/users EXCEPT the designated admin
    const delUsers = await prisma.user.deleteMany({
      where: {
        email: { not: adminEmail }
      }
    });
    console.log(`- Deleted ${delUsers.count} non-admin staff users`);

    // 5. Ensure the Admin user is intact and has active credentials
    const passwordHash = await argon2.hash(adminPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4
    });

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash,
        role: Role.ADMIN,
        isActive: true,
        deletedAt: null
      },
      create: {
        email: adminEmail,
        passwordHash,
        fullName: 'System Administrator',
        role: Role.ADMIN,
        isActive: true
      }
    });

    console.log(`\n✅ Database cleaned successfully!`);
    console.log(`👤 Active Admin Account preserved: ${admin.email} (Role: ${admin.role})`);
    console.log(`🎉 All medicines, suppliers, categories, batches, purchases, and sales have been completely cleared.\n`);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
