import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createReturn(data, userId, context = {}) {
  const { saleId, reason, items } = data;

  if (!saleId) {
    throw new AppError('Sale ID is required to process a return', 400, 'INVALID_SALE_ID');
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
    throw new AppError('A valid mandatory reason (at least 3 characters) is required for returns', 400, 'REASON_REQUIRED');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('At least one item must be returned', 400, 'EMPTY_RETURN_ITEMS');
  }

  return await prisma.$transaction(
    async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: {
          items: true,
          returns: {
            include: { items: true }
          }
        }
      });

      if (!sale) {
        throw new AppError('Original sale invoice not found', 404, 'SALE_NOT_FOUND');
      }

      if (sale.status === 'CANCELLED') {
        throw new AppError('Cannot process returns against a cancelled invoice', 400, 'SALE_CANCELLED');
      }

      // Map prior returns by saleItemId to calculate already refunded quantity
      const priorReturnedMap = new Map();
      let priorRefundsTotal = 0;
      sale.returns.forEach((r) => {
        priorRefundsTotal += Number(r.refundAmount) || 0;
        r.items.forEach((ri) => {
          const current = priorReturnedMap.get(ri.saleItemId) || 0;
          priorReturnedMap.set(ri.saleItemId, current + ri.quantity);
        });
      });

      // Strict Financial Protection: Account for invoice-level discounts so returns cannot refund more than collected
      const netSaleTotal = Number(sale.totalAmount);
      const grossSaleTotal = Math.round((Number(sale.subtotal) + Number(sale.taxAmount)) * 100) / 100;
      const discountRatio = grossSaleTotal > 0 ? Math.min(1, Math.max(0, netSaleTotal / grossSaleTotal)) : 1;
      const remainingRefundableAmount = Math.max(0, Math.round((netSaleTotal - priorRefundsTotal) * 100) / 100);

      if (remainingRefundableAmount <= 0) {
        throw new AppError('The total payable balance for this invoice has already been fully refunded', 400, 'INVOICE_ALREADY_REFUNDED');
      }

      const saleItemMap = new Map(sale.items.map((si) => [si.id, si]));
      const returnItemsToCreate = [];
      const stockMovementsToCreate = [];
      let totalRefund = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const returnQty = parseInt(item.quantity, 10);
        const disposition = item.disposition || 'RESTOCKED';

        if (!['RESTOCKED', 'DAMAGED_DISCARDED'].includes(disposition)) {
          throw new AppError(`Invalid disposition ${disposition} at line ${i + 1}`, 400, 'INVALID_DISPOSITION');
        }

        const saleItem = saleItemMap.get(item.saleItemId);
        if (!saleItem) {
          throw new AppError(`Sale line item ${item.saleItemId} does not belong to this invoice`, 400, 'INVALID_SALE_ITEM');
        }

        const priorReturned = priorReturnedMap.get(saleItem.id) || 0;
        const maxReturnable = saleItem.quantity - priorReturned;

        if (isNaN(returnQty) || returnQty <= 0) {
          throw new AppError(`Return quantity must be positive at line ${i + 1}`, 400, 'INVALID_QUANTITY');
        }

        if (returnQty > maxReturnable) {
          throw new AppError(
            `Return quantity (${returnQty}) exceeds remaining sold quantity (${maxReturnable}) for item`,
            400,
            'EXCEEDS_SOLD_QUANTITY'
          );
        }

        // Proportional refund calculation accounting for trade discounts
        const unitGrossPrice = Number(saleItem.totalAmount) / saleItem.quantity;
        const effectiveUnitPrice = unitGrossPrice * discountRatio;
        const lineRefund = Math.min(
          Math.round(effectiveUnitPrice * returnQty * 100) / 100,
          remainingRefundableAmount
        );
        totalRefund += lineRefund;

        // If restocked, batch stock increases and status returns to ACTIVE
        if (disposition === 'RESTOCKED') {
          const currentBatch = await tx.batch.findUnique({
            where: { id: saleItem.batchId }
          });

          if (!currentBatch) {
            throw new AppError('Associated batch not found', 404, 'BATCH_NOT_FOUND');
          }

          const balanceAfter = currentBatch.currentQuantity + returnQty;

          await tx.batch.update({
            where: { id: saleItem.batchId },
            data: {
              currentQuantity: balanceAfter,
              status: 'ACTIVE'
            }
          });

          stockMovementsToCreate.push({
            batchId: saleItem.batchId,
            movementType: 'CUSTOMER_RETURN',
            quantityDelta: returnQty,
            balanceAfter,
            performedByUserId: userId,
            reason: `Restocked return from Invoice #${sale.invoiceNumber}: ${reason.trim()}`
          });
        }

        returnItemsToCreate.push({
          saleItemId: saleItem.id,
          batchId: saleItem.batchId,
          quantity: returnQty,
          refundAmount: lineRefund,
          disposition
        });
      }

      const returnNumber = `RET-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Create Customer Return record with strict cap against net collected cash
      const finalRefundAmount = Math.min(Math.round(totalRefund * 100) / 100, remainingRefundableAmount);

      const returnRecord = await tx.customerReturn.create({
        data: {
          returnNumber,
          saleId: sale.id,
          processedByUserId: userId,
          reason: reason.trim(),
          refundAmount: finalRefundAmount,
          items: {
            create: returnItemsToCreate
          }
        },
        include: {
          processedByUser: { select: { id: true, fullName: true, role: true } },
          items: {
            include: {
              saleItem: {
                include: {
                  medicine: { select: { id: true, name: true, sku: true } },
                  batch: { select: { id: true, batchNumber: true } }
                }
              }
            }
          }
        }
      });

      // Record Stock Movements
      for (const sm of stockMovementsToCreate) {
        await tx.stockMovement.create({
          data: {
            ...sm,
            referenceId: returnRecord.id
          }
        });
      }

      // Check if entire original sale has been refunded
      const totalOriginalQuantity = sale.items.reduce((sum, si) => sum + si.quantity, 0);
      let cumulativeReturned = 0;
      priorReturnedMap.forEach((qty) => { cumulativeReturned += qty; });
      returnItemsToCreate.forEach((ri) => { cumulativeReturned += ri.quantity; });

      const newSaleStatus = cumulativeReturned >= totalOriginalQuantity ? 'REFUNDED_FULL' : 'REFUNDED_PARTIAL';

      await tx.sale.update({
        where: { id: sale.id },
        data: { status: newSaleStatus }
      });

      // Record Immutable Audit Log
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'PROCESS_RETURN',
          entityName: 'CustomerReturn',
          entityId: returnRecord.id,
          ipAddress: context.ipAddress || null,
          userAgent: context.userAgent || null,
          diff: {
            returnNumber,
            invoiceNumber: sale.invoiceNumber,
            refundAmount: returnRecord.refundAmount,
            reason: reason.trim()
          }
        }
      });

      return {
        ...returnRecord,
        refundAmount: Number(returnRecord.refundAmount),
        items: returnRecord.items.map((ri) => ({
          ...ri,
          refundAmount: Number(ri.refundAmount)
        }))
      };
    },
    { maxWait: 15000, timeout: 30000 }
  );
}

export async function listReturns({ search, saleId, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const where = {
    ...(saleId ? { saleId } : {}),
    ...(search
      ? {
          OR: [
            { returnNumber: { contains: search, mode: 'insensitive' } },
            { reason: { contains: search, mode: 'insensitive' } },
            { sale: { invoiceNumber: { contains: search, mode: 'insensitive' } } }
          ]
        }
      : {})
  };

  const [total, returns] = await Promise.all([
    prisma.customerReturn.count({ where }),
    prisma.customerReturn.findMany({
      where,
      include: {
        processedByUser: { select: { id: true, fullName: true, role: true } },
        sale: { select: { id: true, invoiceNumber: true, customerName: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  return {
    returns: returns.map((r) => ({
      id: r.id,
      returnNumber: r.returnNumber,
      sale: r.sale,
      processedByUser: r.processedByUser,
      reason: r.reason,
      refundAmount: Number(r.refundAmount),
      itemsCount: r._count.items,
      createdAt: r.createdAt
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getReturnById(id) {
  const returnRecord = await prisma.customerReturn.findUnique({
    where: { id },
    include: {
      processedByUser: { select: { id: true, fullName: true, role: true } },
      sale: {
        include: {
          cashier: { select: { id: true, fullName: true } }
        }
      },
      items: {
        include: {
          saleItem: {
            include: {
              medicine: true,
              batch: true
            }
          }
        }
      }
    }
  });

  if (!returnRecord) {
    throw new AppError('Customer return record not found', 404, 'RETURN_NOT_FOUND');
  }

  return {
    ...returnRecord,
    refundAmount: Number(returnRecord.refundAmount),
    items: returnRecord.items.map((ri) => ({
      ...ri,
      refundAmount: Number(ri.refundAmount)
    }))
  };
}
