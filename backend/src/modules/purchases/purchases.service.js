import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listPurchases({
  search,
  supplierId,
  status,
  page = 1,
  limit = 20
}) {
  const skip = (page - 1) * limit;

  const where = {
    ...(supplierId ? { supplierId } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { purchaseNumber: { contains: search, mode: 'insensitive' } },
            { supplier: { name: { contains: search, mode: 'insensitive' } } }
          ]
        }
      : {})
  };

  const [total, purchases] = await Promise.all([
    prisma.purchase.count({ where }),
    prisma.purchase.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, name: true, phone: true }
        },
        receivedByUser: {
          select: { id: true, fullName: true, role: true }
        },
        items: {
          include: {
            medicine: {
              select: { id: true, name: true, genericName: true, sku: true, dosageForm: true, strength: true }
            }
          }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  return {
    purchases: purchases.map((p) => ({
      id: p.id,
      purchaseNumber: p.purchaseNumber,
      supplier: p.supplier,
      status: p.status,
      orderedDate: p.orderedDate,
      receivedDate: p.receivedDate,
      subtotal: Number(p.subtotal),
      taxTotal: Number(p.taxTotal),
      grandTotal: Number(p.grandTotal),
      receivedByUser: p.receivedByUser,
      itemsCount: p._count?.items ?? p.items?.length ?? 0,
      items: (p.items || []).map((item) => ({
        id: item.id,
        purchaseId: item.purchaseId,
        medicineId: item.medicineId,
        medicine: item.medicine,
        batchNumber: item.batchNumber,
        manufacturingDate: item.manufacturingDate,
        expiryDate: item.expiryDate,
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: item.receivedQuantity,
        unitCost: Number(item.unitCost),
        unitSalePrice: Number(item.unitSalePrice),
        lineTotal: Number(item.lineTotal)
      })),
      notes: p.notes,
      createdAt: p.createdAt
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getPurchaseById(id) {
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      receivedByUser: {
        select: { id: true, fullName: true, email: true, role: true }
      },
      items: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              genericName: true,
              sku: true,
              dosageForm: true,
              strength: true,
              packageUnit: true
            }
          },
          batches: {
            select: {
              id: true,
              batchNumber: true,
              currentQuantity: true,
              status: true
            }
          }
        }
      }
    }
  });

  if (!purchase) {
    throw new AppError('Purchase order not found', 404, 'PURCHASE_NOT_FOUND');
  }

  return {
    ...purchase,
    subtotal: Number(purchase.subtotal),
    taxTotal: Number(purchase.taxTotal),
    grandTotal: Number(purchase.grandTotal),
    items: purchase.items.map((item) => ({
      ...item,
      unitCost: Number(item.unitCost),
      unitSalePrice: Number(item.unitSalePrice),
      lineTotal: Number(item.lineTotal)
    }))
  };
}

export async function createPurchase(data, actorId) {
  const { supplierId, notes, items, status = 'DRAFT' } = data;

  if (!['DRAFT', 'RECEIVED'].includes(status)) {
    throw new AppError('Invalid purchase status', 400, 'INVALID_STATUS');
  }

  if (!supplierId) {
    throw new AppError('Supplier is required', 400, 'INVALID_SUPPLIER');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Purchase must contain at least one line item', 400, 'EMPTY_ITEMS');
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId }
  });

  if (!supplier || !supplier.isActive) {
    throw new AppError('Supplier is invalid or inactive', 400, 'INACTIVE_SUPPLIER');
  }

  // Pre-fetch medicines to validate and read tax rate
  const medicineIds = items.map((i) => i.medicineId);
  const medicines = await prisma.medicine.findMany({
    where: { id: { in: medicineIds } }
  });

  const medicineMap = new Map(medicines.map((m) => [m.id, m]));

  const now = new Date();
  let calculatedSubtotal = 0;
  let calculatedTaxTotal = 0;

  const validatedItems = items.map((item, idx) => {
    const medicine = medicineMap.get(item.medicineId);
    if (!medicine || !medicine.isActive) {
      throw new AppError(
        `Medicine at line ${idx + 1} is invalid or inactive`,
        400,
        'INVALID_MEDICINE'
      );
    }

    if (!item.batchNumber || typeof item.batchNumber !== 'string') {
      throw new AppError(`Valid batch number required at line ${idx + 1}`, 400, 'INVALID_BATCH');
    }

    const expiryDate = new Date(item.expiryDate);
    if (isNaN(expiryDate.getTime()) || expiryDate <= now) {
      throw new AppError(
        `Expiry date for batch ${item.batchNumber} must be in the future`,
        400,
        'INVALID_EXPIRY'
      );
    }

    const orderedQty = parseInt(item.orderedQuantity, 10);
    if (isNaN(orderedQty) || orderedQty <= 0) {
      throw new AppError(`Ordered quantity must be positive at line ${idx + 1}`, 400, 'INVALID_QUANTITY');
    }

    const unitCost = parseFloat(item.unitCost);
    if (isNaN(unitCost) || unitCost < 0) {
      throw new AppError(`Unit cost cannot be negative at line ${idx + 1}`, 400, 'INVALID_COST');
    }

    const unitSalePrice = parseFloat(item.unitSalePrice);
    if (isNaN(unitSalePrice) || unitSalePrice < unitCost) {
      throw new AppError(
        `Unit sale price must be >= unit purchase cost at line ${idx + 1}`,
        400,
        'INVALID_SALE_PRICE'
      );
    }

    const lineTotal = Math.round(orderedQty * unitCost * 100) / 100;
    const taxRate = Number(medicine.defaultTaxRate) || 0;
    const lineTax = Math.round(lineTotal * (taxRate / 100) * 100) / 100;

    calculatedSubtotal += lineTotal;
    calculatedTaxTotal += lineTax;

    return {
      medicineId: medicine.id,
      batchNumber: item.batchNumber.trim().toUpperCase(),
      manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate) : null,
      expiryDate,
      orderedQuantity: orderedQty,
      receivedQuantity: status === 'RECEIVED' ? orderedQty : 0,
      unitCost,
      unitSalePrice,
      lineTotal
    };
  });

  const grandTotal = Math.round((calculatedSubtotal + calculatedTaxTotal) * 100) / 100;
  const purchaseNumber = `PO-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (status === 'RECEIVED') {
    // Immediate Direct Receipt: Create Purchase, items, Batches, and StockMovements inside a single transaction
    const purchase = await prisma.$transaction(
      async (tx) => {
        const createdPurchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          supplierId,
          status: 'RECEIVED',
          orderedDate: now,
          receivedDate: now,
          receivedByUserId: actorId,
          subtotal: calculatedSubtotal,
          taxTotal: calculatedTaxTotal,
          grandTotal,
          notes,
          items: {
            create: validatedItems
          }
        },
        include: {
          supplier: true,
          receivedByUser: { select: { id: true, fullName: true, role: true } },
          items: {
            include: { medicine: true }
          }
        }
      });

      // Stock each item into active inventory
      for (const item of createdPurchase.items) {
        let batch = await tx.batch.findUnique({
          where: {
            medicineId_batchNumber: {
              medicineId: item.medicineId,
              batchNumber: item.batchNumber
            }
          }
        });

        let balanceAfter = 0;
        if (batch) {
          balanceAfter = batch.currentQuantity + item.orderedQuantity;
          batch = await tx.batch.update({
            where: { id: batch.id },
            data: {
              currentQuantity: balanceAfter,
              purchaseCost: item.unitCost,
              salePrice: item.unitSalePrice,
              status: 'ACTIVE'
            }
          });
        } else {
          balanceAfter = item.orderedQuantity;
          batch = await tx.batch.create({
            data: {
              medicineId: item.medicineId,
              batchNumber: item.batchNumber,
              purchaseItemId: item.id,
              manufacturingDate: item.manufacturingDate,
              expiryDate: item.expiryDate,
              initialQuantity: item.orderedQuantity,
              currentQuantity: item.orderedQuantity,
              purchaseCost: item.unitCost,
              salePrice: item.unitSalePrice,
              status: 'ACTIVE'
            }
          });
        }

        // Create immutable StockMovement
        await tx.stockMovement.create({
          data: {
            batchId: batch.id,
            movementType: 'PURCHASE_RECEIPT',
            quantityDelta: item.orderedQuantity,
            balanceAfter,
            performedByUserId: actorId,
            referenceId: createdPurchase.id,
            reason: `Direct purchase intake receipt ${createdPurchase.purchaseNumber}`
          }
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          actorId,
          action: 'PURCHASE_CREATED_AND_RECEIVED',
          entityName: 'PURCHASE',
          entityId: createdPurchase.id,
          diff: {
            purchaseNumber: createdPurchase.purchaseNumber,
            grandTotal,
            itemCount: createdPurchase.items.length
          }
        }
      });

        return createdPurchase;
      },
      { maxWait: 15000, timeout: 30000 }
    );

    return {
      ...purchase,
      subtotal: Number(purchase.subtotal),
      taxTotal: Number(purchase.taxTotal),
      grandTotal: Number(purchase.grandTotal),
      items: purchase.items.map((item) => ({
        ...item,
        unitCost: Number(item.unitCost),
        unitSalePrice: Number(item.unitSalePrice),
        lineTotal: Number(item.lineTotal)
      }))
    };
  }

  const purchase = await prisma.purchase.create({
    data: {
      purchaseNumber,
      supplierId,
      status,
      subtotal: calculatedSubtotal,
      taxTotal: calculatedTaxTotal,
      grandTotal,
      notes,
      items: {
        create: validatedItems
      }
    },
    include: {
      supplier: true,
      items: {
        include: {
          medicine: true
        }
      }
    }
  });

  return {
    ...purchase,
    subtotal: Number(purchase.subtotal),
    taxTotal: Number(purchase.taxTotal),
    grandTotal: Number(purchase.grandTotal),
    items: purchase.items.map((item) => ({
      ...item,
      unitCost: Number(item.unitCost),
      unitSalePrice: Number(item.unitSalePrice),
      lineTotal: Number(item.lineTotal)
    }))
  };
}

export async function receivePurchase(id, receiveData = {}, actorId, context = {}) {
  return await prisma.$transaction(
    async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { id },
      include: {
        items: true,
        supplier: true
      }
    });

    if (!purchase) {
      throw new AppError('Purchase order not found', 404, 'PURCHASE_NOT_FOUND');
    }

    if (purchase.status === 'RECEIVED') {
      throw new AppError('Purchase order has already been received', 400, 'ALREADY_RECEIVED');
    }

    if (purchase.status === 'CANCELLED') {
      throw new AppError('Cannot receive a cancelled purchase order', 400, 'PURCHASE_CANCELLED');
    }

    const receivedItemsInput = receiveData.items || [];
    const receivedItemMap = new Map(
      receivedItemsInput.map((i) => [i.purchaseItemId || i.id, i.receivedQuantity])
    );

    const now = new Date();
    const batchResults = [];

    for (const item of purchase.items) {
      // Determine quantity to receive (defaults to orderedQuantity if not specified)
      const inputQty = receivedItemMap.get(item.id);
      const receivedQty = inputQty !== undefined ? parseInt(inputQty, 10) : item.orderedQuantity;

      if (receivedQty < 0) {
        throw new AppError(`Received quantity cannot be negative for item ${item.batchNumber}`, 400, 'INVALID_QUANTITY');
      }

      if (receivedQty === 0) {
        // Nothing received for this line
        await tx.purchaseItem.update({
          where: { id: item.id },
          data: { receivedQuantity: 0 }
        });
        continue;
      }

      // Security & Regulatory Compliance: Reject receiving already-expired batches into active inventory
      if (new Date(item.expiryDate) <= now) {
        throw new AppError(
          `Cannot receive batch ${item.batchNumber} as it has already expired (${new Date(item.expiryDate).toISOString().slice(0, 10)})`,
          400,
          'EXPIRED_BATCH_BLOCKED'
        );
      }

      // Check if batch already exists for medicine + batchNumber
      let batch = await tx.batch.findUnique({
        where: {
          medicineId_batchNumber: {
            medicineId: item.medicineId,
            batchNumber: item.batchNumber
          }
        }
      });

      let balanceAfter = 0;

      if (batch) {
        balanceAfter = batch.currentQuantity + receivedQty;
        batch = await tx.batch.update({
          where: { id: batch.id },
          data: {
            currentQuantity: balanceAfter,
            purchaseCost: item.unitCost,
            salePrice: item.unitSalePrice,
            status: 'ACTIVE'
          }
        });
      } else {
        balanceAfter = receivedQty;
        batch = await tx.batch.create({
          data: {
            medicineId: item.medicineId,
            batchNumber: item.batchNumber,
            purchaseItemId: item.id,
            manufacturingDate: item.manufacturingDate,
            expiryDate: item.expiryDate,
            initialQuantity: receivedQty,
            currentQuantity: receivedQty,
            purchaseCost: item.unitCost,
            salePrice: item.unitSalePrice,
            status: 'ACTIVE'
          }
        });
      }

      // Log Stock Movement
      await tx.stockMovement.create({
        data: {
          batchId: batch.id,
          movementType: 'PURCHASE_RECEIPT',
          quantityDelta: receivedQty,
          balanceAfter,
          referenceId: purchase.id,
          performedByUserId: actorId,
          reason: `Goods receipt for Purchase PO #${purchase.purchaseNumber}`
        }
      });

      // Update purchase item received quantity
      await tx.purchaseItem.update({
        where: { id: item.id },
        data: { receivedQuantity: receivedQty }
      });

      batchResults.push({
        batchId: batch.id,
        batchNumber: item.batchNumber,
        receivedQuantity: receivedQty,
        balanceAfter
      });
    }

    // Update purchase record
    const updatedPurchase = await tx.purchase.update({
      where: { id },
      data: {
        status: 'RECEIVED',
        receivedDate: now,
        receivedByUserId: actorId
      },
      include: {
        supplier: true,
        receivedByUser: {
          select: { id: true, fullName: true, role: true }
        },
        items: {
          include: {
            medicine: true
          }
        }
      }
    });

    // Record Immutable Audit Log
    await tx.auditLog.create({
      data: {
        actorId,
        action: 'RECEIVE_PURCHASE',
        entityName: 'Purchase',
        entityId: purchase.id,
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
        diff: {
          purchaseNumber: purchase.purchaseNumber,
          batchesCreatedOrUpdated: batchResults
        }
      }
    });

    return {
      ...updatedPurchase,
      subtotal: Number(updatedPurchase.subtotal),
      taxTotal: Number(updatedPurchase.taxTotal),
      grandTotal: Number(updatedPurchase.grandTotal),
      items: updatedPurchase.items.map((item) => ({
        ...item,
        unitCost: Number(item.unitCost),
        unitSalePrice: Number(item.unitSalePrice),
        lineTotal: Number(item.lineTotal)
      }))
    };
  },
  { maxWait: 15000, timeout: 30000 });
}

export async function cancelPurchase(id, actorId, context = {}) {
  return await prisma.$transaction(
    async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { id }
      });

      if (!purchase) {
        throw new AppError('Purchase order not found', 404, 'PURCHASE_NOT_FOUND');
      }

      if (purchase.status === 'RECEIVED') {
        throw new AppError('Cannot cancel a received purchase order with allocated batches', 400, 'CANNOT_CANCEL_RECEIVED');
      }

      if (purchase.status === 'CANCELLED') {
        throw new AppError('Purchase order is already cancelled', 400, 'ALREADY_CANCELLED');
      }

      const updated = await tx.purchase.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'CANCEL_PURCHASE',
          entityName: 'Purchase',
          entityId: purchase.id,
          ipAddress: context.ipAddress || null,
          userAgent: context.userAgent || null,
          diff: {
            purchaseNumber: purchase.purchaseNumber,
            previousStatus: purchase.status,
            newStatus: 'CANCELLED'
          }
        }
      });

      return updated;
    },
    { maxWait: 15000, timeout: 30000 }
  );
}
