import React from 'react';
import { DollarSign, Scale, ArrowUpRight, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function ReportsMetricsCards({
  grossSales = 0,
  ordersCount = 0,
  totalTax = 0,
  marginPercentage = 0,
  potentialGrossMargin = 0,
  isBalanced = true,
  discrepancy = 0,
  totalAuditRecords = 0
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Gross Sales Revenue */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Gross Sales Revenue</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 font-mono">
              {formatCurrency(grossSales)}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">{ordersCount} order transactions</p>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Tax Remittance */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Tax Remittance (GST)</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 font-mono">
              {formatCurrency(totalTax)}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Statutory 12% GST collected</p>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <Scale className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Potential Gross Margin */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Potential Gross Margin</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {marginPercentage}%
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              {formatCurrency(potentialGrossMargin)} on stock
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Ledger Reconciliation */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Ledger Reconciliation</p>
            <div className="mt-1">
              {isBalanced ? (
                <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Balanced (Δ = 0)
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs py-1">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Discrepancy ({discrepancy})
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-text-muted mt-1.5">{totalAuditRecords} movement audits</p>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
