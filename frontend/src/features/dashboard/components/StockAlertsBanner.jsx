import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';

export function StockAlertsBanner({ expiredCount, nearExpiryCount, lowStockCount }) {
  if (expiredCount === 0 && nearExpiryCount === 0 && lowStockCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-text-primary shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">
            Inventory Alerts Requiring Immediate Attention
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {expiredCount > 0 && (
              <span className="text-rose-600 dark:text-rose-400 font-bold mr-2">
                {expiredCount} expired {expiredCount === 1 ? 'batch' : 'batches'} quarantined
              </span>
            )}
            {nearExpiryCount > 0 && (
              <span className="mr-2">
                • {nearExpiryCount} near-expiry lots (&lt; 60 days)
              </span>
            )}
            {lowStockCount > 0 && (
              <span>
                • {lowStockCount} medicines below minimum reorder level
              </span>
            )}
          </p>
        </div>
      </div>
      <Link
        to="/inventory"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
      >
        <span>Manage Batch Stock</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
