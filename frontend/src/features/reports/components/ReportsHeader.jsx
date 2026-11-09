import React from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';

export function ReportsHeader({ onRefresh, isLoading }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Financial Reports & Ledger Reconciliation
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Executive revenue analytics, statutory tax compliance, stock margins, and mathematical inventory reconciliation.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-9 gap-1.5 border-surface hover:bg-surface-page text-text-primary font-bold rounded-xl cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </Button>
      </div>
    </div>
  );
}
