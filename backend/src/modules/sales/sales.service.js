import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createSale(data, cashierId, context = {}) {
  const {
    customerId = null,
    customerName = 'Walk-in Customer',
    customerPhone = null,
    paymentMethod = 'CASH',
    discountAmount = 0,
    idempotencyKey = null,
    items
  } = data;

  // 1. Idempotency Check
  if (idempotencyKey) {
    const existing = await prisma.sale.findUnique({
      where: { idempotencyKey },
      include: {
        cashier: { select: { id: true, fullName: true, role: true } },
        customer: {
          select: { id: true, customerCode: true, type: true, name: true, phone: true, companyName: true, taxNumber: true }
        },
        items: {
          include: {
            medicine: { select: { id: true, name: true, sku: true, dosageForm: true } },
            batch: { select: { id: true, batchNumber: true, expiryDate: true } }
          }
        }
      }
    });

    if (existing) {
      return formatSaleResponse(existing);
    }
  }

  // 2. Validate Items Array
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Sale must contain at least one item', 400, 'EMPTY_SALE_ITEMS');
  }

  const validPaymentMethods = ['CASH', 'CARD', 'UPI', 'SPLIT', 'CREDIT_LEDGER', 'CREDIT'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    throw new AppError(`Invalid payment method: ${paymentMethod}`, 400, 'INVALID_PAYMENT_METHOD');
  }
  const resolvedPaymentMethod = paymentMethod === 'CREDIT' ? 'CREDIT_LEDGER' : paymentMethod;

  // Strict Financial Discount Validation
  if (discountAmount !== undefined && discountAmount !== null && discountAmount !== '') {
    const rawDiscount = Number(discountAmount);
    if (isNaN(rawDiscount) || !isFinite(rawDiscount)) {
      throw new AppError('Discount amount must be a valid number', 400, 'INVALID_DISCOUNT');
    }
    if (rawDiscount < 0) {
      throw new AppError('Discount amount cannot be negative', 400, 'NEGATIVE_DISCOUNT');
    }
  }

  const numericDiscount = Math.round((Math.max(0, Number(discountAmount) || 0)) * 100) / 100;

  // 3. Execute Checkout with FEFO Allocation inside Interactive Transaction
  return await prisma.$transaction(
    async (tx) => {
      const now = new Date();
      let calculatedSubtotal = 0;
      let calculatedTaxTotal = 0;
      const saleItemsToCreate = [];
      const stockMovementsToCreate = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const medicineId = item.medicineId;
        const requestedQty = parseInt(item.quantity, 10);

        if (!medicineId) {
          throw new AppError(`Medicine ID is required at line ${i + 1}`, 400, 'INVALID_MEDICINE');
        }

        if (isNaN(requestedQty) || requestedQty <= 0) {
          throw new AppError(`Quantity must be a positive integer at line ${i + 1}`, 400, 'INVALID_QUANTITY');
        }

        const medicine = await tx.medicine.findUnique({
          where: { id: medicineId }
        });

        if (!medicine || !medicine.isActive) {
          throw new AppError(`Medicine at line ${i + 1} is invalid or inactive`, 400, 'MEDICINE_INACTIVE');
        }

        // Fetch ACTIVE, NON-EXPIRED batches with stock > 0, ordered by expiry date ASC (First-Expiry-First-Out)
        const availableBatches = await tx.batch.findMany({
          where: {
            medicineId,
            status: 'ACTIVE',
            currentQuantity: { gt: 0 },
            expiryDate: { gte: now } // Strictly exclude expired batches!
          },
          orderBy: { expiryDate: 'asc' }
        });

        const totalAvailableStock = availableBatches.reduce((sum, b) => sum + b.currentQuantity, 0);

        if (totalAvailableStock < requestedQty) {
          throw new AppError(
            `Insufficient active non-expired stock for ${medicine.name}. Requested: ${requestedQty}, Available: ${totalAvailableStock}`,
            400,
            'INSUFFICIENT_STOCK'
          );
        }

        // Greedy FEFO Deduction
        let remainingQty = requestedQty;

        for (const batch of availableBatches) {
          if (remainingQty <= 0) break;

          const deductQty = Math.min(batch.currentQuantity, remainingQty);
          const balanceAfter = batch.currentQuantity - deductQty;
          const newStatus = balanceAfter === 0 ? 'DEPLETED' : 'ACTIVE';

          // Update batch stock & status
          await tx.batch.update({
            where: { id: batch.id },
            data: {
              currentQuantity: balanceAfter,
              status: newStatus
            }
          });

          // Compute Financials for this batch allocation
          const unitPrice = Number(batch.salePrice);
          const costPrice = Number(batch.purchaseCost);
          const taxRate = Number(medicine.defaultTaxRate) || 0;
          const lineSubtotal = Math.round(deductQty * unitPrice * 100) / 100;
          const lineTax = Math.round(lineSubtotal * (taxRate / 100) * 100) / 100;
          const lineTotal = Math.round((lineSubtotal + lineTax) * 100) / 100;

          calculatedSubtotal += lineSubtotal;
          calculatedTaxTotal += lineTax;

          saleItemsToCreate.push({
            medicineId: medicine.id,
            batchId: batch.id,
            quantity: deductQty,
            unitPrice,
            costPrice,
            taxRate,
            taxAmount: lineTax,
            totalAmount: lineTotal
          });

          // Prepare stock movement
          stockMovementsToCreate.push({
            batchId: batch.id,
            movementType: 'SALE_DEDUCTION',
            quantityDelta: -deductQty,
            balanceAfter,
            performedByUserId: cashierId,
            reason: `Sale deduction for ${medicine.name} (Batch: ${batch.batchNumber})`
          });

          remainingQty -= deductQty;
        }
      }

      // 4. Calculate Final Bill Totals with Strict Financial Guardrails
      const subtotal = Math.round(calculatedSubtotal * 100) / 100;
      const taxAmount = Math.round(calculatedTaxTotal * 100) / 100;
      const maxEligibleDiscount = Math.round((subtotal + taxAmount) * 100) / 100;

      if (numericDiscount > maxEligibleDiscount) {
        throw new AppError(
          `Discount amount (${numericDiscount}) cannot exceed payable bill total (${maxEligibleDiscount})`,
          400,
          'DISCOUNT_EXCEEDS_TOTAL'
        );
      }

      const finalDiscount = numericDiscount;
      const totalAmount = Math.max(0, Math.round((subtotal + taxAmount - finalDiscount) * 100) / 100);

      // Customer verification and Credit Ledger validation
      let linkedCustomer = null;
      if (customerId) {
        linkedCustomer = await tx.customer.findUnique({
          where: { id: customerId }
        });
        if (!linkedCustomer || !linkedCustomer.isActive) {
          throw new AppError('Customer profile not found or is currently inactive', 404, 'CUSTOMER_NOT_FOUND');
        }
      }

      if (resolvedPaymentMethod === 'CREDIT_LEDGER') {
        if (!linkedCustomer) {
          throw new AppError('A registered customer account is required for Credit Ledger settlement', 400, 'CUSTOMER_REQUIRED_FOR_CREDIT');
        }
        const creditLimit = Number(linkedCustomer.creditLimit) || 0;
        const currentBalance = Number(linkedCustomer.currentBalance) || 0;
        if (creditLimit > 0 && (currentBalance + totalAmount) > creditLimit) {
          throw new AppError(
            `Credit limit exceeded. Outstanding balance: ₹${currentBalance.toFixed(2)}, Available limit: ₹${creditLimit.toFixed(2)}, Order total: ₹${totalAmount.toFixed(2)}`,
            400,
            'CREDIT_LIMIT_EXCEEDED'
          );
        }
      }

      // Generate Unique Fiscal Invoice Number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 5. Create Sale and Line Items
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          cashierId,
          customerId: linkedCustomer ? linkedCustomer.id : null,
          customerName: linkedCustomer ? linkedCustomer.name : customerName.trim(),
          customerPhone: linkedCustomer ? (linkedCustomer.phone || customerPhone) : (customerPhone ? customerPhone.trim() : null),
          subtotal,
          discountAmount: finalDiscount,
          taxAmount,
          totalAmount,
          paymentMethod: resolvedPaymentMethod,
          status: 'COMPLETED',
          idempotencyKey,
          items: {
            create: saleItemsToCreate
          }
        },
        include: {
          cashier: { select: { id: true, fullName: true, role: true } },
          customer: {
            select: { id: true, customerCode: true, type: true, name: true, phone: true, companyName: true, taxNumber: true }
          },
          items: {
            include: {
              medicine: {
                select: { id: true, name: true, genericName: true, sku: true, dosageForm: true, strength: true }
              },
              batch: {
                select: { id: true, batchNumber: true, expiryDate: true }
              }
            }
          }
        }
      });

      // Update Customer Ledger Balance if settled on credit
      if (resolvedPaymentMethod === 'CREDIT_LEDGER' && linkedCustomer) {
        await tx.customer.update({
          where: { id: linkedCustomer.id },
          data: {
            currentBalance: { increment: totalAmount }
          }
        });
      }

      // 6. Record Stock Movements linked to Sale
      for (const sm of stockMovementsToCreate) {
        await tx.stockMovement.create({
          data: {
            ...sm,
            referenceId: sale.id,
            reason: `Sale Invoice #${invoiceNumber}`
          }
        });
      }

      // 7. Record Immutable Audit Log
      await tx.auditLog.create({
        data: {
          actorId: cashierId,
          action: 'PROCESS_SALE',
          entityName: 'Sale',
          entityId: sale.id,
          ipAddress: context.ipAddress || null,
          userAgent: context.userAgent || null,
          diff: {
            invoiceNumber,
            totalAmount,
            itemsCount: saleItemsToCreate.length,
            paymentMethod
          }
        }
      });

      return formatSaleResponse(sale);
    },
    { maxWait: 15000, timeout: 30000 }
  );
}

export async function listSales({
  search,
  paymentMethod,
  status,
  cashierId,
  startDate,
  endDate,
  page = 1,
  limit = 20
}) {
  const skip = (page - 1) * limit;

  const where = {
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(status ? { status } : {}),
    ...(cashierId ? { cashierId } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {})
          }
        }
      : {}),
    ...(search
      ? {
          OR: [
            { invoiceNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerPhone: { contains: search, mode: 'insensitive' } },
            { customer: { name: { contains: search, mode: 'insensitive' } } },
            { customer: { customerCode: { contains: search, mode: 'insensitive' } } }
          ]
        }
      : {})
  };

  const [total, sales] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      include: {
        cashier: { select: { id: true, fullName: true, role: true } },
        customer: { select: { id: true, customerCode: true, type: true, name: true, phone: true } },
        _count: { select: { items: true, returns: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  return {
    sales: sales.map((s) => ({
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      customerId: s.customerId,
      customer: s.customer,
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      subtotal: Number(s.subtotal),
      discountAmount: Number(s.discountAmount),
      taxAmount: Number(s.taxAmount),
      totalAmount: Number(s.totalAmount),
      paymentMethod: s.paymentMethod,
      status: s.status,
      cashier: s.cashier,
      itemsCount: s._count.items,
      returnsCount: s._count.returns,
      createdAt: s.createdAt
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getSaleById(id) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      cashier: { select: { id: true, fullName: true, email: true, role: true } },
      customer: {
        select: {
          id: true,
          customerCode: true,
          type: true,
          name: true,
          phone: true,
          email: true,
          companyName: true,
          taxNumber: true,
          drugLicenseNo: true,
          address: true,
          creditLimit: true,
          currentBalance: true
        }
      },
      items: {
        include: {
          medicine: {
            select: { id: true, name: true, genericName: true, sku: true, dosageForm: true, strength: true }
          },
          batch: {
            select: { id: true, batchNumber: true, expiryDate: true, purchaseCost: true, salePrice: true }
          }
        }
      },
      returns: {
        include: {
          processedByUser: { select: { id: true, fullName: true } },
          items: true
        }
      }
    }
  });

  if (!sale) {
    throw new AppError('Sale invoice not found', 404, 'SALE_NOT_FOUND');
  }

  return formatSaleResponse(sale);
}

export async function previewFefoAllocation({ medicineId, quantity }) {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    throw new AppError('Quantity must be a positive integer', 400, 'INVALID_QUANTITY');
  }

  const now = new Date();
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId }
  });

  if (!medicine) {
    throw new AppError('Medicine not found', 404, 'MEDICINE_NOT_FOUND');
  }

  const batches = await prisma.batch.findMany({
    where: {
      medicineId,
      status: 'ACTIVE',
      currentQuantity: { gt: 0 },
      expiryDate: { gte: now }
    },
    orderBy: { expiryDate: 'asc' }
  });

  let remaining = qty;
  const allocations = [];

  for (const batch of batches) {
    if (remaining <= 0) break;
    const allocateQty = Math.min(batch.currentQuantity, remaining);
    allocations.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      currentQuantity: batch.currentQuantity,
      allocatedQuantity: allocateQty,
      salePrice: Number(batch.salePrice)
    });
    remaining -= allocateQty;
  }

  return {
    medicine: { id: medicine.id, name: medicine.name, sku: medicine.sku },
    requestedQuantity: qty,
    canFulfill: remaining === 0,
    unfulfilledQuantity: Math.max(0, remaining),
    allocations
  };
}

function formatSaleResponse(sale) {
  return {
    ...sale,
    subtotal: Number(sale.subtotal),
    discountAmount: Number(sale.discountAmount),
    taxAmount: Number(sale.taxAmount),
    totalAmount: Number(sale.totalAmount),
    customer: sale.customer
      ? {
          ...sale.customer,
          creditLimit: sale.customer.creditLimit !== undefined ? Number(sale.customer.creditLimit) : undefined,
          currentBalance: sale.customer.currentBalance !== undefined ? Number(sale.customer.currentBalance) : undefined
        }
      : null,
    items: sale.items?.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      costPrice: Number(item.costPrice),
      taxRate: Number(item.taxRate),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount)
    })),
    returns: sale.returns?.map((ret) => ({
      ...ret,
      refundAmount: Number(ret.refundAmount),
      items: ret.items?.map((ri) => ({
        ...ri,
        refundAmount: Number(ri.refundAmount)
      }))
    }))
  };
}
