import React from 'react';

export function MedicinesMetricsCards({ medicines = [] }) {
  const totalCount = medicines.length;
  const inStockCount = medicines.filter((m) => (m.totalAvailableStock || 0) > (m.minReorderLevel || 20)).length;
  const lowStockCount = medicines.filter(
    (m) => (m.totalAvailableStock || 0) <= (m.minReorderLevel || 20) && (m.totalAvailableStock || 0) > 0
  ).length;
  const outOfStockCount = medicines.filter((m) => (m.totalAvailableStock || 0) === 0).length;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
      <span className="text-text-muted">
        <span className="font-semibold text-text-primary">{totalCount}</span> formulations
      </span>
      {inStockCount > 0 && (
        <span className="text-text-muted">
          <span className="font-semibold text-text-primary">{inStockCount}</span> adequate stock
        </span>
      )}
      {lowStockCount > 0 && (
        <span className="text-text-muted">
          <span className="font-semibold text-amber-600 dark:text-amber-400">{lowStockCount}</span> low stock
        </span>
      )}
      {outOfStockCount > 0 && (
        <span className="text-text-muted">
          <span className="font-semibold text-rose-600 dark:text-rose-400">{outOfStockCount}</span> out of stock
        </span>
      )}
    </div>
  );
}
