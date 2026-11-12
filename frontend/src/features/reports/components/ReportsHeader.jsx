import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function ReportsHeader({ onRefresh, isLoading, grossSales, ordersCount, totalTax, marginPercentage }) {
  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-surface">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Financial Reports
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-9 gap-1.5 border-surface hover:bg-surface-page text-text-primary font-semibold rounded-lg cursor-pointer text-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {grossSales > 0 && (
          <span className="text-text-muted">
            <span className="font-semibold text-text-primary">{formatCurrency(grossSales)}</span> gross sales
          </span>
        )}
        {ordersCount > 0 && (
          <span className="text-text-muted">
            <span className="font-semibold text-text-primary">{ordersCount}</span> orders
          </span>
        )}
        {totalTax > 0 && (
          <span className="text-text-muted">
            <span className="font-semibold text-text-primary">{formatCurrency(totalTax)}</span> GST
          </span>
        )}
        {marginPercentage > 0 && (
          <span className="text-text-muted">
            <span className="font-semibold text-brand-primary">{marginPercentage}%</span> margin
          </span>
        )}
      </div>
    </div>
  );
}
