import React from 'react';
import { Truck, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function PurchasesMetricsCards({
  totalPurchases,
  receivedPurchases,
  draftPurchases,
  totalSpend
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total POs */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 font-mono">{totalPurchases}</h3>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <Truck className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Received Goods */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Received & Stocked</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {receivedPurchases}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Pending Deliveries */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Pending Drafts</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {draftPurchases}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Total Invoiced Spend */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Capital Outlay</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 font-mono">
              {formatCurrency(totalSpend)}
            </h3>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
