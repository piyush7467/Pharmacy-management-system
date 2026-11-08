import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listBatches({
  search,
  medicineId,
  status,
  expiringWithinDays,
  page = 1,
  limit = 25
}) {
  const skip = (page - 1) * limit;
  const now = new Date();

  let expiryFilter = undefined;
  if (expiringWithinDays) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + parseInt(expiringWithinDays, 10));
    expiryFilter = {
      gte: now,
      lte: targetDate
    };
  }

  const where = {
    ...(medicineId ? { medicineId } : {}),
    ...(status ? { status } : {}),
    ...(expiryFilter ? { expiryDate: expiryFilter } : {}),
    ...(search
      ? {
          OR: [
            { batchNumber: { contains: search, mode: 'insensitive' } },
            { medicine: { name: { contains: search, mode: 'insensitive' } } },
            { medicine: { sku: { contains: search, mode: 'insensitive' } } }
          ]
        }
      : {})
  };

  const [total, batches] = await Promise.all([
    prisma.batch.count({ where }),
    prisma.batch.findMany({
      where,
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            genericName: true,
            sku: true,
            dosageForm: true,
            strength: true,
            minReorderLevel: true
          }
        },
        purchaseItem: {
          select: {
            purchase: {
              select: {
                id: true,
                purchaseNumber: true,
                supplier: { select: { id: true, name: true } }
              }
            }
          }
        }
      },
      orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit
    })
  ]);

  const formattedBatches = batches.map((b) => {
    const expiry = new Date(b.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let expiryStatus = 'NORMAL';
    if (diffDays < 0) {
      expiryStatus = 'EXPIRED';
    } else if (diffDays <= 60) {
      expiryStatus = 'NEAR_EXPIRY';
    }

    return {
      id: b.id,
      batchNumber: b.batchNumber,
      manufacturingDate: b.manufacturingDate,
      expiryDate: b.expiryDate,
      daysToExpiry: diffDays,
      expiryStatus,
      initialQuantity: b.initialQuantity,
      currentQuantity: b.currentQuantity,
      purchaseCost: Number(b.purchaseCost),
      salePrice: Number(b.salePrice),
      mrp: b.mrp ? Number(b.mrp) : null,
      status: b.status,
      stockValueAtCost: Math.round(b.currentQuantity * Number(b.purchaseCost) * 100) / 100,
      stockValueAtRetail: Math.round(b.currentQuantity * Number(b.salePrice) * 100) / 100,
      medicine: b.medicine,
      purchase: b.purchaseItem?.purchase || null,
      createdAt: b.createdAt
    };
  });

  return {
    batches: formattedBatches,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getStockOverview() {
  const now = new Date();
  const sixtyDaysAhead = new Date();
  sixtyDaysAhead.setDate(sixtyDaysAhead.getDate() + 60);

  const [allBatches, lowStockMedicines] = await Promise.all([
    prisma.batch.findMany({
      select: {
        currentQuantity: true,
        purchaseCost: true,
        salePrice: true,
        expiryDate: true,
        status: true
      }
    }),
    prisma.medicine.findMany({
      where: { isActive: true },
      include: {
        batches: {
          where: {
            status: 'ACTIVE',
            currentQuantity: { gt: 0 },
            expiryDate: { gte: now }
          },
          select: { currentQuantity: true }
        }
      }
    })
  ]);

  let totalActiveCostValuation = 0;
  let totalActiveRetailValuation = 0;
  let totalActiveUnits = 0;
  let expiredBatchesCount = 0;
  let nearExpiryBatchesCount = 0;
  let depletedBatchesCount = 0;

  for (const b of allBatches) {
    const isExpired = new Date(b.expiryDate) < now;
    const isNearExpiry = !isExpired && new Date(b.expiryDate) <= sixtyDaysAhead;

    if (b.status === 'DEPLETED') {
      depletedBatchesCount++;
    }

    if (isExpired) {
      expiredBatchesCount++;
    } else if (isNearExpiry) {
      nearExpiryBatchesCount++;
    }

    if (b.status === 'ACTIVE' && !isExpired && b.currentQuantity > 0) {
      totalActiveUnits += b.currentQuantity;
      totalActiveCostValuation += b.currentQuantity * Number(b.purchaseCost);
      totalActiveRetailValuation += b.currentQuantity * Number(b.salePrice);
    }
  }

  const lowStockCount = lowStockMedicines.filter((m) => {
    const available = m.batches.reduce((sum, b) => sum + b.currentQuantity, 0);
    return available <= m.minReorderLevel;
  }).length;

  return {
    totalActiveUnits,
    totalActiveCostValuation: Math.round(totalActiveCostValuation * 100) / 100,
    totalActiveRetailValuation: Math.round(totalActiveRetailValuation * 100) / 100,
    nearExpiryBatchesCount,
    expiredBatchesCount,
    depletedBatchesCount,
    lowStockCount
  };
}

export async function createStockAdjustment(data, userId, context = {}) {
  const { batchId, adjustmentType, quantityDelta, reason } = data;

  if (!batchId) {
    throw new AppError('Batch ID is required for adjustment', 400, 'INVALID_BATCH');
  }

  const validTypes = [
    'WRITE_OFF_DAMAGED',
    'WRITE_OFF_EXPIRED',
    'INVENTORY_COUNT_GAIN',
    'INVENTORY_COUNT_LOSS'
  ];

  if (!validTypes.includes(adjustmentType)) {
    throw new AppError(`Invalid adjustment type: ${adjustmentType}`, 400, 'INVALID_ADJUSTMENT_TYPE');
  }

  const delta = parseInt(quantityDelta, 10);
  if (isNaN(delta) || delta === 0) {
    throw new AppError('Quantity delta must be a non-zero integer', 400, 'INVALID_QUANTITY_DELTA');
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
    throw new AppError('A valid mandatory reason (min 3 characters) is required', 400, 'REASON_REQUIRED');
  }

  return await prisma.$transaction(
    async (tx) => {
      const batch = await tx.batch.findUnique({
        where: { id: batchId },
        include: { medicine: true }
      });

      if (!batch) {
        throw new AppError('Batch not found', 404, 'BATCH_NOT_FOUND');
      }

      const balanceAfter = batch.currentQuantity + delta;
      if (balanceAfter < 0) {
        throw new AppError(
          `Adjustment of ${delta} would result in negative stock. Current: ${batch.currentQuantity}`,
          400,
          'NEGATIVE_STOCK'
        );
      }

      const newStatus = balanceAfter === 0 ? 'DEPLETED' : 'ACTIVE';

      // Update Batch stock and status
      const updatedBatch = await tx.batch.update({
        where: { id: batchId },
        data: {
          currentQuantity: balanceAfter,
          status: newStatus
        }
      });

      // Generate Adjustment Number
      const adjustmentNumber = `ADJ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Create Stock Adjustment Record
      const adjustment = await tx.stockAdjustment.create({
        data: {
          adjustmentNumber,
          batchId,
          adjustmentType,
          quantityDelta: delta,
          reason: reason.trim(),
          approvedByUserId: userId
        },
        include: {
          approvedByUser: { select: { id: true, fullName: true, role: true } },
          batch: {
            include: {
              medicine: { select: { id: true, name: true, sku: true } }
            }
          }
        }
      });

      // Map Movement Type
      let movementType = 'ADJUSTMENT_WRITE_OFF';
      if (delta > 0) {
        movementType = 'ADJUSTMENT_RESTOCK';
      } else if (adjustmentType === 'WRITE_OFF_EXPIRED') {
        movementType = 'EXPIRED_DISPOSAL';
      }

      // Record Stock Movement
      await tx.stockMovement.create({
        data: {
          batchId,
          movementType,
          quantityDelta: delta,
          balanceAfter,
          referenceId: adjustment.id,
          performedByUserId: userId,
          reason: `Stock Adjustment #${adjustmentNumber}: ${reason.trim()}`
        }
      });

      // Record Immutable Audit Log
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'STOCK_ADJUSTMENT',
          entityName: 'StockAdjustment',
          entityId: adjustment.id,
          ipAddress: context.ipAddress || null,
          userAgent: context.userAgent || null,
          diff: {
            adjustmentNumber,
            batchNumber: batch.batchNumber,
            medicineName: batch.medicine.name,
            adjustmentType,
            quantityDelta: delta,
            balanceBefore: batch.currentQuantity,
            balanceAfter,
            reason: reason.trim()
          }
        }
      });

      return {
        ...adjustment,
        balanceAfter: updatedBatch.currentQuantity
      };
    },
    { maxWait: 15000, timeout: 30000 }
  );
}

export async function listStockAdjustments({ search, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { adjustmentNumber: { contains: search, mode: 'insensitive' } },
          { reason: { contains: search, mode: 'insensitive' } },
          { batch: { batchNumber: { contains: search, mode: 'insensitive' } } },
          { batch: { medicine: { name: { contains: search, mode: 'insensitive' } } } }
        ]
      }
    : {};

  const [total, adjustments] = await Promise.all([
    prisma.stockAdjustment.count({ where }),
    prisma.stockAdjustment.findMany({
      where,
      include: {
        approvedByUser: { select: { id: true, fullName: true, role: true } },
        batch: {
          include: {
            medicine: { select: { id: true, name: true, sku: true, dosageForm: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  return {
    adjustments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
