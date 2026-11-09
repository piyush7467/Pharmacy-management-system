import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listMedicines({
  search,
  categoryId,
  isActive,
  lowStockOnly,
  page = 1,
  limit = 20
}) {
  const skip = (page - 1) * limit;
  const now = new Date();

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(isActive !== undefined && isActive !== '' ? { isActive: isActive === 'true' || isActive === true } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { genericName: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [total, medicines] = await Promise.all([
    prisma.medicine.count({ where }),
    prisma.medicine.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        },
        batches: {
          where: {
            status: 'ACTIVE',
            currentQuantity: { gt: 0 },
            expiryDate: { gte: now }
          },
          select: {
            id: true,
            batchNumber: true,
            expiryDate: true,
            currentQuantity: true,
            salePrice: true
          },
          orderBy: { expiryDate: 'asc' }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    })
  ]);

  // Compute live available stock and low stock indicators
  const formattedMedicines = medicines.map((m) => {
    const totalAvailableStock = m.batches.reduce(
      (sum, b) => sum + b.currentQuantity,
      0
    );
    const isLowStock = totalAvailableStock <= m.minReorderLevel;
    const earliestExpiry = m.batches[0]?.expiryDate || null;

    const activeBatches = m.batches.map((b) => ({
      id: b.id,
      batchNumber: b.batchNumber,
      expiryDate: b.expiryDate,
      currentQuantity: b.currentQuantity,
      salePrice: Number(b.salePrice),
      mrp: b.mrp ? Number(b.mrp) : Math.round(Number(b.salePrice) * 1.15 * 100) / 100,
      status: b.status
    }));

    const earliestBatch = activeBatches[0] || null;
    const salePrice = earliestBatch ? earliestBatch.salePrice : 0;

    return {
      id: m.id,
      name: m.name,
      genericName: m.genericName,
      sku: m.sku,
      dosageForm: m.dosageForm,
      strength: m.strength,
      packageUnit: m.packageUnit,
      minReorderLevel: m.minReorderLevel,
      defaultTaxRate: Number(m.defaultTaxRate),
      isActive: m.isActive,
      category: m.category,
      totalAvailableStock,
      activeBatchCount: m.batches.length,
      earliestExpiry,
      salePrice,
      earliestBatch: earliestBatch ? earliestBatch.batchNumber : null,
      batches: activeBatches,
      isLowStock,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    };
  });

  const finalResults = lowStockOnly === 'true' || lowStockOnly === true
    ? formattedMedicines.filter((m) => m.isLowStock)
    : formattedMedicines;

  return {
    medicines: finalResults,
    pagination: {
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

export async function getMedicineById(id) {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: {
      category: true,
      batches: {
        orderBy: { expiryDate: 'asc' }
      }
    }
  });

  if (!medicine) {
    throw new AppError('Medicine not found', 404, 'NOT_FOUND');
  }

  const now = new Date();
  const eligibleBatches = medicine.batches.filter(
    (b) => b.status === 'ACTIVE' && b.currentQuantity > 0 && new Date(b.expiryDate) >= now
  );

  const totalAvailableStock = eligibleBatches.reduce(
    (sum, b) => sum + b.currentQuantity,
    0
  );

  return {
    ...medicine,
    defaultTaxRate: Number(medicine.defaultTaxRate),
    totalAvailableStock,
    isLowStock: totalAvailableStock <= medicine.minReorderLevel,
    batches: medicine.batches.map((b) => ({
      ...b,
      purchaseCost: Number(b.purchaseCost),
      salePrice: Number(b.salePrice),
      mrp: b.mrp ? Number(b.mrp) : null
    }))
  };
}

export async function createMedicine(data) {
  // Validate category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId }
  });
  if (!category) {
    throw new AppError('Selected category does not exist', 400, 'INVALID_CATEGORY');
  }

  // Enforce unique SKU
  const existingSku = await prisma.medicine.findUnique({
    where: { sku: data.sku.trim().toUpperCase() }
  });
  if (existingSku) {
    throw new AppError(`A medicine with SKU "${data.sku}" already exists`, 409, 'SKU_EXISTS');
  }

  return prisma.medicine.create({
    data: {
      categoryId: data.categoryId,
      name: data.name.trim(),
      genericName: data.genericName.trim(),
      sku: data.sku.trim().toUpperCase(),
      dosageForm: data.dosageForm.trim(),
      strength: data.strength.trim(),
      packageUnit: data.packageUnit.trim(),
      minReorderLevel: parseInt(data.minReorderLevel, 10) || 20,
      defaultTaxRate: data.defaultTaxRate !== undefined ? Number(data.defaultTaxRate) : 12.0,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    },
    include: {
      category: {
        select: { id: true, name: true }
      }
    }
  });
}

export async function updateMedicine(id, data) {
  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) {
    throw new AppError('Medicine not found', 404, 'NOT_FOUND');
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    if (!category) {
      throw new AppError('Selected category does not exist', 400, 'INVALID_CATEGORY');
    }
  }

  if (data.sku && data.sku.trim().toUpperCase() !== medicine.sku) {
    const existing = await prisma.medicine.findUnique({
      where: { sku: data.sku.trim().toUpperCase() }
    });
    if (existing) {
      throw new AppError(`Another medicine already uses SKU "${data.sku}"`, 409, 'SKU_EXISTS');
    }
  }

  return prisma.medicine.update({
    where: { id },
    data: {
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.genericName ? { genericName: data.genericName.trim() } : {}),
      ...(data.sku ? { sku: data.sku.trim().toUpperCase() } : {}),
      ...(data.dosageForm ? { dosageForm: data.dosageForm.trim() } : {}),
      ...(data.strength ? { strength: data.strength.trim() } : {}),
      ...(data.packageUnit ? { packageUnit: data.packageUnit.trim() } : {}),
      ...(data.minReorderLevel !== undefined ? { minReorderLevel: parseInt(data.minReorderLevel, 10) } : {}),
      ...(data.defaultTaxRate !== undefined ? { defaultTaxRate: Number(data.defaultTaxRate) } : {}),
      ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {})
    },
    include: {
      category: {
        select: { id: true, name: true }
      }
    }
  });
}

export async function deleteMedicine(id) {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: {
      _count: {
        select: { batches: true, saleItems: true, purchaseItems: true }
      }
    }
  });

  if (!medicine) {
    throw new AppError('Medicine not found', 404, 'NOT_FOUND');
  }

  if (medicine._count.batches > 0 || medicine._count.saleItems > 0 || medicine._count.purchaseItems > 0) {
    throw new AppError(
      `Cannot delete medicine "${medicine.name}" because historical batches, purchases, or sales depend on it. Deactivate the medicine instead.`,
      400,
      'MEDICINE_HAS_HISTORY'
    );
  }

  await prisma.medicine.delete({ where: { id } });
  return { message: 'Medicine deleted successfully' };
}
