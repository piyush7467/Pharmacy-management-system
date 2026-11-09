import React from 'react';
import { Check, Keyboard, RotateCcw, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';

export function PosHeader({ onReset, onNewBill, onOpenShortcuts, cartCount }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-surface shrink-0">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-text-primary">
            Point of Sale (POS)
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-primary/15 text-brand-primary border border-brand-primary/30 tracking-wide uppercase">
            <Check className="w-4 h-4" /> FEFO Active
          </span>
        </div>
        <p className="text-sm text-text-muted mt-1 font-medium">
          Quick billing, medicine search and automated batch allocation
        </p>
      </div>

      {/* Header Action Buttons */}
      <div className="flex items-center gap-2.5 self-start md:self-auto">
        <Button
          variant="outline"
          size="default"
          onClick={onOpenShortcuts}
          className="text-sm font-bold border-surface gap-2 hover:bg-surface-muted h-9 px-3.5 cursor-pointer"
        >
          <Keyboard className="w-4 h-4 text-text-muted" />
          <span>Shortcuts (F1)</span>
        </Button>

        <Button
          variant="outline"
          size="default"
          onClick={onReset}
          disabled={cartCount === 0}
          className="text-sm font-bold border-surface gap-2 hover:bg-surface-muted h-9 px-3.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-text-muted" />
          <span>Reset Bill</span>
        </Button>

        <Button
          size="default"
          onClick={onNewBill}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm gap-2 shadow-xs h-9 px-4 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Bill</span>
        </Button>
      </div>
    </div>
  );
}
