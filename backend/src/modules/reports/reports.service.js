import { prisma } from '../../config/prisma.js';

export async function getSalesSummary({ startDate, endDate }) {
  const where = {
    status: { in: ['COMPLETED', 'REFUNDED_PARTIAL', 'REFUNDED_FULL'] },
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {})
          }
        }
      : {})
  };

  const [sales, returns] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        items: true
      },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.customerReturn.findMany({
      where: startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {})
            }
          }
        : {}
    })
  ]);

  const grossSales = sales.reduce((sum, s) => sum + Number(s.subtotal), 0);
  const totalTax = sales.reduce((sum, s) => sum + Number(s.taxAmount), 0);
  const totalDiscounts = sales.reduce((sum, s) => sum + Number(s.discountAmount), 0);
  const totalRefunds = returns.reduce((sum, r) => sum + Number(r.refundAmount), 0);
  const netRevenue = Math.max(0, grossSales + totalTax - totalDiscounts - totalRefunds);

  // Group by Payment Method
  const paymentMethodMap = { CASH: 0, CARD: 0, UPI: 0, SPLIT: 0 };
  sales.forEach((s) => {
    paymentMethodMap[s.paymentMethod] =
      (paymentMethodMap[s.paymentMethod] || 0) + Number(s.totalAmount);
  });

  // Daily Trend Aggregation
  const dailyMap = new Map();
  sales.forEach((s) => {
    const dayKey = s.createdAt.toISOString().split('T')[0];
    const existing = dailyMap.get(dayKey) || { date: dayKey, sales: 0, orders: 0, tax: 0 };
    existing.sales += Number(s.totalAmount);
    existing.orders += 1;
    existing.tax += Number(s.taxAmount);
    dailyMap.set(dayKey, existing);
  });

  const dailyTrend = Array.from(dailyMap.values()).map((d) => ({
    ...d,
    sales: Math.round(d.sales * 100) / 100,
    tax: Math.round(d.tax * 100) / 100
  }));

  return {
    grossSales: Math.round(grossSales * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    totalDiscounts: Math.round(totalDiscounts * 100) / 100,
    totalRefunds: Math.round(totalRefunds * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
    ordersCount: sales.length,
    returnsCount: returns.length,
    paymentMethodDistribution: [
      { name: 'Cash', value: Math.round((paymentMethodMap.CASH || 0) * 100) / 100 },
      { name: 'Card', value: Math.round((paymentMethodMap.CARD || 0) * 100) / 100 },
      { name: 'UPI', value: Math.round((paymentMethodMap.UPI || 0) * 100) / 100 }
    ],
    dailyTrend
  };
}

export async function getStockValuation() {
  const now = new Date();

  const batches = await prisma.batch.findMany({
    where: {
      status: 'ACTIVE',
      currentQuantity: { gt: 0 }
    },
    include: {
      medicine: {
        include: { category: true }
      }
    }
  });

  let totalCostValuation = 0;
  let totalRetailValuation = 0;
  let totalUnits = 0;

  const categoryMap = new Map();

  for (const b of batches) {
    const isExpired = new Date(b.expiryDate) < now;
    const qty = b.currentQuantity;
    const cost = Number(b.purchaseCost);
    const sale = Number(b.salePrice);

    if (!isExpired) {
      totalUnits += qty;
      totalCostValuation += qty * cost;
      totalRetailValuation += qty * sale;

      const catName = b.medicine?.category?.name || 'Uncategorized';
      const catCurrent = categoryMap.get(catName) || { category: catName, stockValue: 0, units: 0 };
      catCurrent.stockValue += qty * sale;
      catCurrent.units += qty;
      categoryMap.set(catName, catCurrent);
    }
  }

  const potentialGrossMargin = totalRetailValuation - totalCostValuation;
  const marginPercentage =
    totalRetailValuation > 0 ? (potentialGrossMargin / totalRetailValuation) * 100 : 0;

  return {
    totalUnits,
    totalCostValuation: Math.round(totalCostValuation * 100) / 100,
    totalRetailValuation: Math.round(totalRetailValuation * 100) / 100,
    potentialGrossMargin: Math.round(potentialGrossMargin * 100) / 100,
    marginPercentage: Math.round(marginPercentage * 10) / 10,
    categoryBreakdown: Array.from(categoryMap.values()).map((c) => ({
      ...c,
      stockValue: Math.round(c.stockValue * 100) / 100
    }))
  };
}

/**
 * Mathematical Inventory Ledger Reconciliation Engine
 * Acceptance Blocker Test #5:
 * Asserts that:
 * Current Batch Stock == Sum(All Positive & Negative Stock Movements)
 */
export async function getReconciliationAudit() {
  const [batches, movementsGrouped, medicines] = await Promise.all([
    // 1. Current physical batch snapshot
    prisma.batch.findMany({
      select: {
        id: true,
        batchNumber: true,
        currentQuantity: true,
        medicine: { select: { id: true, name: true, sku: true } }
      }
    }),
    // 2. Sum of all immutable stock movements grouped by movementType
    prisma.stockMovement.groupBy({
      by: ['movementType'],
      _sum: {
        quantityDelta: true
      },
      _count: {
        id: true
      }
    }),
    // 3. Active medicines list
    prisma.medicine.count({ where: { isActive: true } })
  ]);

  const currentTotalStock = batches.reduce((sum, b) => sum + b.currentQuantity, 0);

  const breakdown = {
    PURCHASE_RECEIPT: 0,
    SALE_DEDUCTION: 0,
    CUSTOMER_RETURN: 0,
    ADJUSTMENT_WRITE_OFF: 0,
    ADJUSTMENT_RESTOCK: 0,
    EXPIRED_DISPOSAL: 0
  };

  let netMovementsDelta = 0;
  let totalAuditRecords = 0;

  movementsGrouped.forEach((group) => {
    const sumDelta = group._sum.quantityDelta || 0;
    breakdown[group.movementType] = sumDelta;
    netMovementsDelta += sumDelta;
    totalAuditRecords += group._count.id;
  });

  // Calculate discrepancy if any
  const discrepancy = currentTotalStock - netMovementsDelta;
  const isBalanced = discrepancy === 0;

  return {
    status: isBalanced ? 'BALANCED' : 'DISCREPANCY',
    isBalanced,
    currentTotalUnits: currentTotalStock,
    netMovementsDelta,
    discrepancy,
    totalAuditRecords,
    activeMedicinesCount: medicines,
    totalBatchesCount: batches.length,
    movementTypeBreakdown: {
      purchasesInward: breakdown.PURCHASE_RECEIPT || 0,
      salesDeductions: Math.abs(breakdown.SALE_DEDUCTION || 0),
      customerRestocks: breakdown.CUSTOMER_RETURN || 0,
      adjustmentsWriteOff: Math.abs(breakdown.ADJUSTMENT_WRITE_OFF || 0),
      adjustmentsRestock: breakdown.ADJUSTMENT_RESTOCK || 0,
      expiredDisposals: Math.abs(breakdown.EXPIRED_DISPOSAL || 0)
    },
    auditFormula: 'CurrentStock = InwardReceipts - SalesDeductions + CustomerRestocks - WriteOffs + Restocks - ExpiredDisposals'
  };
}
