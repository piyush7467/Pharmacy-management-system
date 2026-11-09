import React from 'react';
import { useSelector } from 'react-redux';
import { RotateCcw, Plus, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';

export function ReturnsHeader({ onOpenProcessModal }) {
  const user = useSelector((state) => state.auth?.user);
  const canProcessReturns = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Customer Returns & Restocking
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Process auditable customer returns against prior invoices with condition disposition and stock restitution.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {canProcessReturns ? (
          <Button
            onClick={onOpenProcessModal}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Process Customer Return</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl">
            <ShieldAlert className="w-4 h-4" />
            <span>Pharmacist / Admin Approval Required for Returns</span>
          </div>
        )}
      </div>
    </div>
  );
}
