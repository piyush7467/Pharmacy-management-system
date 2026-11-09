import React from 'react';
import { Receipt, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function SalesMetricsCards({ totalCount, totalRevenue, totalTax, avgBasket }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Invoices */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Invoices</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 font-mono">{totalCount}</h3>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <Receipt className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Gross Sales Revenue */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Gross Sales Revenue</p>
            <h3 className="text-2xl font-black text-brand-primary mt-1 font-mono">
              {formatCurrency(totalRevenue)}
            </h3>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Tax Remittance */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Tax Remittance (GST)</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 font-mono">
              {formatCurrency(totalTax)}
            </h3>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Average Basket */}
      <Card className="bg-surface-card border-surface shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Average Basket</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 font-mono">
              {formatCurrency(avgBasket)}
            </h3>
          </div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20">
            <CreditCard className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
