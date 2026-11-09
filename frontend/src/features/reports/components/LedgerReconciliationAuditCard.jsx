import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card.jsx';

export function LedgerReconciliationAuditCard({ reconciliation = {} }) {
  const breakdown = reconciliation.movementTypeBreakdown || {};
  const isBalanced = reconciliation.isBalanced;

  return (
    <Card className="bg-surface-card border-surface shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-surface">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Mathematical Inventory Ledger Audit</span>
            </CardTitle>
            <p className="text-xs text-text-muted mt-0.5">
              Double-entry inventory equation verifying zero ghost stock against immutable audit logs.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-text-muted font-bold">Formula Status: </span>
            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
              {reconciliation.status || 'VERIFIED'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
          {/* Purchases Inward */}
          <div className="p-3 rounded-xl border border-surface bg-surface-page shadow-2xs">
            <p className="text-text-muted text-[11px] font-bold uppercase">Purchases Inward</p>
            <p className="text-base font-black text-brand-primary mt-1 font-mono">
              +{breakdown.purchasesInward || 0}
            </p>
          </div>

          {/* Sales Deductions */}
          <div className="p-3 rounded-xl border border-surface bg-surface-page shadow-2xs">
            <p className="text-text-muted text-[11px] font-bold uppercase">Sales Deductions</p>
            <p className="text-base font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
              -{breakdown.salesDeductions || 0}
            </p>
          </div>

          {/* Customer Returns */}
          <div className="p-3 rounded-xl border border-surface bg-surface-page shadow-2xs">
            <p className="text-text-muted text-[11px] font-bold uppercase">Customer Returns</p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              +{breakdown.customerRestocks || 0}
            </p>
          </div>

          {/* Write-Offs */}
          <div className="p-3 rounded-xl border border-surface bg-surface-page shadow-2xs">
            <p className="text-text-muted text-[11px] font-bold uppercase">Write-Offs / Loss</p>
            <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
              -{breakdown.adjustmentsWriteOff || 0}
            </p>
          </div>

          {/* Audit Surplus */}
          <div className="p-3 rounded-xl border border-surface bg-surface-page shadow-2xs">
            <p className="text-text-muted text-[11px] font-bold uppercase">Audit Surplus</p>
            <p className="text-base font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">
              +{breakdown.adjustmentsRestock || 0}
            </p>
          </div>

          {/* Current Physical Units */}
          <div className="p-3 rounded-xl border border-brand-primary/30 bg-brand-primary/10 shadow-2xs">
            <p className="text-brand-primary font-bold text-[11px] uppercase">Current Shelf Stock</p>
            <p className="text-base font-black text-brand-primary mt-1 font-mono">
              {reconciliation.currentTotalUnits || 0}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-surface bg-surface-page text-xs text-text-muted flex flex-col sm:flex-row items-center justify-between font-mono gap-2">
          <span>Equation: CurrentStock = InwardReceipts - SalesDeductions + Returns - WriteOffs + Surplus</span>
          <span className={`font-black text-xs ${isBalanced ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {isBalanced ? 'Δ = 0 (Mathematically Balanced)' : `Δ = ${reconciliation.discrepancy} (Discrepancy)`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
