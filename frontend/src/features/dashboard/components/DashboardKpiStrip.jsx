import React from 'react';
import { TrendingUp, Receipt, Boxes, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils.js';

export function DashboardKpiStrip({
  netRevenue,
  ordersCount,
  stockValuationCost,
  totalActiveUnits,
  nearExpiryCount,
  expiredCount,
  lowStockCount,
  isCashier
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-surface bg-surface-card divide-y sm:divide-y-0 sm:divide-x divide-surface overflow-hidden shadow-xs">
      {/* Metric 1: Net Revenue */}
      <div className="p-5 md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Net Sales Revenue</span>
          <div className="h-8 w-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-brand-primary tracking-tight font-mono">
            {formatCurrency(netRevenue)}
          </div>
          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
            <span className="font-semibold text-text-primary">{ordersCount}</span> sales in period
          </p>
        </div>
      </div>

      {/* Metric 2: Completed Transactions */}
      <div className="p-5 md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Invoices Issued</span>
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-text-primary tracking-tight font-mono">
            {ordersCount}
          </div>
          <p className="text-xs text-text-muted mt-1">
            FEFO batch auto-allocation
          </p>
        </div>
      </div>

      {/* Metric 3: Active Stock Valuation */}
      <div className="p-5 md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Stock Valuation (Cost)</span>
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-text-primary tracking-tight font-mono">
            {isCashier ? 'Protected' : formatCurrency(stockValuationCost)}
          </div>
          <p className="text-xs text-text-muted mt-1">
            <span className="font-semibold text-text-primary">{totalActiveUnits}</span> units in shelf
          </p>
        </div>
      </div>

      {/* Metric 4: Stock Integrity Status */}
      <div className="p-5 md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Stock Health</span>
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl md:text-3xl font-black tracking-tight font-mono">
            {expiredCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400">{expiredCount} Expired</span>
            ) : nearExpiryCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400">{nearExpiryCount} Near Expiry</span>
            ) : (
              <span className="text-brand-primary">Optimal</span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1 font-medium">
            {lowStockCount > 0 ? `${lowStockCount} items need restock` : 'All items above reorder level'}
          </p>
        </div>
      </div>
    </div>
  );
}
