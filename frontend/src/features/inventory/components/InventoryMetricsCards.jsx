import React from 'react';
import { Boxes, DollarSign, Clock, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function InventoryMetricsCards({ overview }) {
  const totalUnits = overview?.totalActiveUnits || 0;
  const costValuation = Number(overview?.totalActiveCostValuation) || 0;
  const nearExpiryCount = overview?.nearExpiryLotsCount || 0;
  const quarantinedCount = overview?.quarantinedLotsCount || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Active Units */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Active Units</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 font-mono">{totalUnits}</h3>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <Boxes className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Stock Valuation at Cost */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Stock Valuation (Cost)</p>
            <h3 className="text-2xl font-black text-brand-primary mt-1 font-mono">
              {formatCurrency(costValuation)}
            </h3>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Near Expiry Batches (<60d) */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Near Expiry (&lt; 60 Days)</p>
            <h3 className={`text-2xl font-black mt-1 font-mono ${nearExpiryCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-text-primary'}`}>
              {nearExpiryCount}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Quarantined / Expired */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Quarantined / Expired</p>
            <h3 className={`text-2xl font-black mt-1 font-mono ${quarantinedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-text-primary'}`}>
              {quarantinedCount}
            </h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
