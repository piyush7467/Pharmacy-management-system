import { prisma } from '../../config/prisma.js';

/**
 * Service to aggregate operational pharmacy notifications:
 * 1. Low stock medicines (current stock <= minReorderLevel)
 * 2. Expired and near-expiry batches (expiring within 60 days)
 * 3. Pending Purchase Orders awaiting Goods Receipt (status = DRAFT)
 */
export async function getSystemNotifications() {
  const now = new Date();
  const sixtyDaysAhead = new Date();
  sixtyDaysAhead.setDate(sixtyDaysAhead.getDate() + 60);

  const [activeMedicines, expiringBatches, pendingPurchases] = await Promise.all([
    // 1. Fetch active medicines with their active inventory batches to calculate stock
    prisma.medicine.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        genericName: true,
        sku: true,
        minReorderLevel: true,
        dosageForm: true,
        batches: {
          where: {
            status: 'ACTIVE',
            currentQuantity: { gt: 0 },
            expiryDate: { gte: now }
          },
          select: {
            currentQuantity: true
          }
        }
      }
    }),

    // 2. Fetch batches that are expired or expiring within 60 days
    prisma.batch.findMany({
      where: {
        status: 'ACTIVE',
        currentQuantity: { gt: 0 },
        expiryDate: { lte: sixtyDaysAhead }
      },
      select: {
        id: true,
        batchNumber: true,
        expiryDate: true,
        currentQuantity: true,
        medicine: {
          select: {
            id: true,
            name: true,
            strength: true,
            dosageForm: true
          }
        }
      },
      orderBy: { expiryDate: 'asc' },
      take: 20
    }),

    // 3. Fetch pending purchase orders
    prisma.purchase.findMany({
      where: { status: 'DRAFT' },
      select: {
        id: true,
        purchaseNumber: true,
        grandTotal: true,
        createdAt: true,
        supplier: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  const notifications = [];

  // 1. Process Low Stock Alerts
  for (const med of activeMedicines) {
    const totalAvailable = med.batches.reduce((sum, b) => sum + b.currentQuantity, 0);
    const reorderLevel = med.minReorderLevel || 10;

    if (totalAvailable <= reorderLevel) {
      const isCritical = totalAvailable === 0;
      notifications.push({
        id: `low-stock-${med.id}`,
        category: 'INVENTORY',
        type: isCritical ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        severity: isCritical ? 'CRITICAL' : 'WARNING',
        title: isCritical ? `Out of Stock: ${med.name}` : `Low Stock: ${med.name}`,
        message: isCritical
          ? `${med.name} (${med.dosageForm}) has 0 units in stock. Reorder threshold is ${reorderLevel}.`
          : `Only ${totalAvailable} units remaining (Threshold: ${reorderLevel}). Reorder recommended.`,
        targetUrl: `/inventory?search=${encodeURIComponent(med.name)}`,
        timestamp: new Date().toISOString(),
        metadata: {
          medicineId: med.id,
          sku: med.sku,
          currentQuantity: totalAvailable,
          reorderLevel
        }
      });
    }
  }

  // 2. Process Expiry Alerts
  for (const batch of expiringBatches) {
    const expiryDate = new Date(batch.expiryDate);
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isExpired = diffDays <= 0;

    notifications.push({
      id: `batch-expiry-${batch.id}`,
      category: 'EXPIRY',
      type: isExpired ? 'EXPIRED' : 'NEAR_EXPIRY',
      severity: isExpired ? 'CRITICAL' : diffDays <= 30 ? 'WARNING' : 'INFO',
      title: isExpired
        ? `Expired Batch: ${batch.batchNumber}`
        : `Expiring Soon: ${batch.batchNumber}`,
      message: isExpired
        ? `${batch.medicine.name} (Lot #${batch.batchNumber}) expired on ${expiryDate.toLocaleDateString()}. Quarantine or adjust ${batch.currentQuantity} units immediately.`
        : `${batch.medicine.name} (Lot #${batch.batchNumber}) expires in ${diffDays} day${diffDays === 1 ? '' : 's'} (${batch.currentQuantity} units remaining).`,
      targetUrl: `/inventory?search=${encodeURIComponent(batch.batchNumber)}`,
      timestamp: batch.expiryDate,
      metadata: {
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        daysToExpiry: diffDays,
        quantity: batch.currentQuantity
      }
    });
  }

  // 3. Process Pending Purchase Orders (GRN required)
  for (const po of pendingPurchases) {
    notifications.push({
      id: `pending-po-${po.id}`,
      category: 'ORDERS',
      type: 'PENDING_DELIVERY',
      severity: 'INFO',
      title: `Pending GRN: ${po.purchaseNumber}`,
      message: `Purchase Order ${po.purchaseNumber} from ${po.supplier?.name || 'Distributor'} (${po.items.length} items) awaiting Goods Receipt inspection.`,
      targetUrl: `/purchases`,
      timestamp: po.createdAt,
      metadata: {
        purchaseId: po.id,
        purchaseNumber: po.purchaseNumber,
        supplierName: po.supplier?.name
      }
    });
  }

  // Sort by severity (CRITICAL > WARNING > INFO) then by date
  const severityRank = { CRITICAL: 3, WARNING: 2, INFO: 1 };
  notifications.sort((a, b) => {
    if (severityRank[b.severity] !== severityRank[a.severity]) {
      return severityRank[b.severity] - severityRank[a.severity];
    }
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const criticalCount = notifications.filter((n) => n.severity === 'CRITICAL').length;
  const warningCount = notifications.filter((n) => n.severity === 'WARNING').length;
  const infoCount = notifications.filter((n) => n.severity === 'INFO').length;

  return {
    notifications,
    summary: {
      total: notifications.length,
      criticalCount,
      warningCount,
      infoCount
    }
  };
}
