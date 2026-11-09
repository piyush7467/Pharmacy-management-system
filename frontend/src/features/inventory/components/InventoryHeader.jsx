import React from 'react';
import { Boxes } from 'lucide-react';

export function InventoryHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Batch-Wise Inventory & Expiry Reconciliation
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Monitor granular pharmaceutical lots, expiry horizons, stock valuations, and audit write-offs.
          </p>
        </div>
      </div>
    </div>
  );
}
