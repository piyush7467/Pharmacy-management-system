import React from 'react';
import { RotateCcw, DollarSign, PackageCheck } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function ReturnsMetricsCards({ totalReturnsCount, totalRefundAmount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Total Return Notes */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Return Notes</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 font-mono">{totalReturnsCount}</h3>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <RotateCcw className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Refunded Amount */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Refunded Capital</p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
              {formatCurrency(totalRefundAmount)}
            </h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Restocked Batches Policy */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Inventory Restock Policy</p>
            <h3 className="text-sm font-bold text-text-primary mt-1">Automatic FEFO Reintegration</h3>
            <p className="text-xs text-text-muted mt-0.5">Auditable movements recorded</p>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <PackageCheck className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
