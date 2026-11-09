import React from 'react';
import { Banknote, CreditCard, QrCode, Layers } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils.js';

export function PaymentDistributionCard({ paymentMethods = [], totalPaymentValue = 0 }) {
  const getIcon = (name) => {
    switch (name) {
      case 'Cash':
        return Banknote;
      case 'Card':
        return CreditCard;
      case 'UPI':
        return QrCode;
      default:
        return Layers;
    }
  };

  return (
    <div className="rounded-2xl border border-surface bg-surface-card p-5 md:p-6 flex flex-col justify-between shadow-xs">
      <div>
        <h2 className="text-base font-bold text-text-primary">Payment Tender Distribution</h2>
        <p className="text-xs text-text-muted mt-0.5">Settlement modes for sales in period</p>
      </div>

      <div className="space-y-4 my-auto py-4">
        {paymentMethods.length > 0 ? (
          paymentMethods.map((pm) => {
            const pct = totalPaymentValue > 0 ? Math.round((pm.value / totalPaymentValue) * 100) : 0;
            const Icon = getIcon(pm.name);

            return (
              <div key={pm.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-brand-primary" />
                    <span className="font-bold text-text-primary">{pm.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-text-primary font-mono">{formatCurrency(pm.value)}</span>
                    <span className="text-text-muted font-mono font-bold">({pct}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-page overflow-hidden border border-surface/50">
                  <div
                    className="h-full rounded-full bg-brand-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-text-muted text-xs font-medium">
            No recorded sales in selected period.
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-surface flex items-center justify-between text-xs text-text-muted">
        <span className="font-bold uppercase tracking-wider">Gross Collection:</span>
        <span className="font-black text-text-primary text-sm font-mono">{formatCurrency(totalPaymentValue)}</span>
      </div>
    </div>
  );
}
