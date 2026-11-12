import React from 'react';
import { Check, Keyboard, RotateCcw, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';

export function PosHeader({ onReset, onNewBill, onOpenShortcuts, cartCount }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-surface shrink-0">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Point of Sale
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <Check className="w-3.5 h-3.5" /> FEFO Active
          </span>
        </div>
        <p className="text-sm text-text-muted mt-0.5">
          Quick billing, medicine catalog search, and automated FEFO lot allocation.
        </p>
      </div>

      {/* Header Action Buttons */}
      <div className="flex items-center gap-2 self-start md:self-auto">
        <Button
          variant="outline"
          size="default"
          onClick={onOpenShortcuts}
          className="text-sm font-semibold border-surface gap-1.5 hover:bg-surface-muted h-9 px-3 rounded-lg cursor-pointer"
        >
          <Keyboard className="w-4 h-4 text-text-muted" />
          <span>Shortcuts (F1)</span>
        </Button>

        <Button
          variant="outline"
          size="default"
          onClick={onReset}
          disabled={cartCount === 0}
          className="text-sm font-semibold border-surface gap-1.5 hover:bg-surface-muted h-9 px-3 rounded-lg cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-text-muted" />
          <span>Reset</span>
        </Button>

        <Button
          size="default"
          onClick={onNewBill}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-sm gap-1.5 shadow-xs h-9 px-3.5 rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Bill</span>
        </Button>
      </div>
    </div>
  );
}
