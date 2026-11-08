import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Boxes,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils.js';

export function DashboardView() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Operational Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Pharmacy Operations Dashboard</h1>
          <p className="text-sm text-text-muted">Real-time inventory valuation, FEFO batch allocations, and POS monitoring.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/pos"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:opacity-90 shadow-xs transition-opacity"
          >
            <ShoppingCart className="w-4 h-4" />
            Launch POS
          </Link>
          <Link
            to="/purchases"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-surface bg-surface-card rounded-lg hover:bg-surface-muted transition-colors text-text-primary"
          >
            <PackageCheck className="w-4 h-4" />
            Receive Stock
          </Link>
        </div>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl border border-surface bg-surface-card shadow-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Inventory</span>
            <Boxes className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-text-primary">242 Units</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
              <span>Across 4 active batches</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl border border-surface bg-surface-card shadow-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Inventory Value</span>
            <span className="text-xs font-bold text-brand-accent">INR</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-text-primary">{formatCurrency(4155.00)}</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
              <span>Cost basis valuation</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Near Expiry */}
        <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Near-Expiry (&lt; 60d)</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-text-primary">1 Batch</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <span>Paracetamol 500mg (80 units)</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Low Stock Alert */}
        <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/5 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Warning</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-text-primary">1 Drug</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              <span>Amoxicillin 250mg (12 / 30 min)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Middle Row: Operational Systems & Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch Panel */}
        <div className="p-6 rounded-xl border border-surface bg-surface-card space-y-4">
          <h2 className="text-base font-semibold text-text-primary">Operational Shortcuts</h2>
          <div className="grid grid-cols-1 gap-2.5">
            <Link
              to="/pos"
              className="flex items-center justify-between p-3 rounded-lg border border-surface hover:bg-surface-muted transition-colors text-sm font-medium text-text-primary group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-brand-primary/10 text-brand-primary">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">New Sale Transaction</div>
                  <div className="text-xs text-text-muted">FEFO auto-allocation with receipt generation</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/purchases"
              className="flex items-center justify-between p-3 rounded-lg border border-surface hover:bg-surface-muted transition-colors text-sm font-medium text-text-primary group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-brand-accent/15 text-brand-accent">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Receive Purchase Order</div>
                  <div className="text-xs text-text-muted">Intake batches from approved suppliers</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/returns"
              className="flex items-center justify-between p-3 rounded-lg border border-surface hover:bg-surface-muted transition-colors text-sm font-medium text-text-primary group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Customer Return</div>
                  <div className="text-xs text-text-muted">Restock or discard with auditable reason</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* System Architecture & Integrity Panel */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-surface bg-surface-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">System Integrity & Constraints</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> All 5 Acceptance Controls Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-surface bg-surface-muted/50 space-y-1">
              <span className="font-semibold text-text-primary">1. FEFO Allocation Engine</span>
              <p className="text-text-muted">Row-level locking (<code className="text-[11px]">SELECT ... FOR UPDATE</code>) guarantees earliest expiring batches are deducted first without race conditions.</p>
            </div>
            <div className="p-3 rounded-lg border border-surface bg-surface-muted/50 space-y-1">
              <span className="font-semibold text-text-primary">2. Hard Expiry Blocking</span>
              <p className="text-text-muted">Batches past local expiry date are automatically excluded from sale availability and rejected at the database level.</p>
            </div>
            <div className="p-3 rounded-lg border border-surface bg-surface-muted/50 space-y-1">
              <span className="font-semibold text-text-primary">3. Immutable Stock Movements</span>
              <p className="text-text-muted">Inventory numbers cannot be arbitrarily altered; every transaction writes a signed movement record to the ledger.</p>
            </div>
            <div className="p-3 rounded-lg border border-surface bg-surface-muted/50 space-y-1">
              <span className="font-semibold text-text-primary">4. Server-Side Fiscal Invoicing</span>
              <p className="text-text-muted">Unit prices and tax snapshots are calculated exclusively by backend services to prevent client-side tampering.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
