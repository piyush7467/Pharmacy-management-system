import React from 'react';
import { useSelector } from 'react-redux';
import { Plus, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function ReturnsHeader({ onOpenProcessModal, totalReturnsCount, totalRefundAmount }) {
  const user = useSelector((state) => state.auth?.user);
  const canProcessReturns = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-surface">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Customer Returns
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {canProcessReturns ? (
            <Button
              onClick={onOpenProcessModal}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold gap-2 shadow-sm cursor-pointer rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Process Return</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
              <span>Pharmacist / Admin access required</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-text-muted">
          <span className="font-semibold text-text-primary">{totalReturnsCount}</span> return notes
        </span>
        {totalRefundAmount > 0 && (
          <span className="text-text-muted">
            <span className="font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(totalRefundAmount)}</span> refunded
          </span>
        )}
        <span className="text-text-muted text-xs">· FEFO reintegration on approval</span>
      </div>
    </div>
  );
}
