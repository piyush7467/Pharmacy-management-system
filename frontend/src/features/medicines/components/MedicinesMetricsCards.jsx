import React from 'react';
import { Pill, Boxes, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card.jsx';

export function MedicinesMetricsCards({ medicines = [] }) {
  const totalCount = medicines.length;
  const inStockCount = medicines.filter((m) => (m.totalAvailableStock || 0) > (m.minReorderLevel || 20)).length;
  const lowStockCount = medicines.filter(
    (m) => (m.totalAvailableStock || 0) <= (m.minReorderLevel || 20) && (m.totalAvailableStock || 0) > 0
  ).length;
  const outOfStockCount = medicines.filter((m) => (m.totalAvailableStock || 0) === 0).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Medicines */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Formulations</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 font-mono">{totalCount}</h3>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <Pill className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. In Stock Adequate */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Adequate Stock</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {inStockCount}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Low Stock Warning */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Low Stock Alerts</p>
            <h3 className={`text-2xl font-black mt-1 font-mono ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-text-primary'}`}>
              {lowStockCount}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Out of Stock */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Out of Stock</p>
            <h3 className={`text-2xl font-black mt-1 font-mono ${outOfStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-text-primary'}`}>
              {outOfStockCount}
            </h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
            <Boxes className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
