import React from 'react';

export function InventoryHeader({ overview }) {
  const totalUnits = overview?.totalActiveUnits || 0;
  const nearExpiryCount = overview?.nearExpiryLotsCount || 0;
  const quarantinedCount = overview?.quarantinedLotsCount || 0;
  const costValuation = Number(overview?.totalActiveCostValuation) || 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-surface">
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          Batch Inventory
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-text-muted">
            <span className="font-semibold text-text-primary">{totalUnits.toLocaleString()}</span> active units
          </span>
          {costValuation > 0 && (
            <span className="text-text-muted">
              <span className="font-semibold text-text-primary">
                ₹{(costValuation / 1000).toFixed(1)}k
              </span> stock value
            </span>
          )}
          {nearExpiryCount > 0 && (
            <span className="text-text-muted">
              <span className="font-semibold text-amber-600 dark:text-amber-400">{nearExpiryCount}</span> near expiry
            </span>
          )}
          {quarantinedCount > 0 && (
            <span className="text-text-muted">
              <span className="font-semibold text-rose-600 dark:text-rose-400">{quarantinedCount}</span> quarantined
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
