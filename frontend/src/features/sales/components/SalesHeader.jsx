import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function SalesHeader({ totalCount, totalRevenue, totalTax, avgBasket }) {
  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-surface">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Sales Ledger
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/pos">
            <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold gap-2 shadow-sm cursor-pointer rounded-lg text-sm">
              <Plus className="w-4 h-4" />
              <span>New POS Sale</span>
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-text-muted">
          <span className="font-semibold text-text-primary">{totalCount}</span> invoices
        </span>
        {totalRevenue > 0 && (
          <span className="text-text-muted">
            <span className="font-semibold text-text-primary">{formatCurrency(totalRevenue)}</span> revenue
          </span>
        )}
        {totalTax > 0 && (
          <span className="text-text-muted">
            <span className="font-semibold text-text-primary">{formatCurrency(totalTax)}</span> GST
          </span>
        )}
        {avgBasket > 0 && (
          <span className="text-text-muted">
            avg <span className="font-semibold text-text-primary">{formatCurrency(avgBasket)}</span> basket
          </span>
        )}
      </div>
    </div>
  );
}
