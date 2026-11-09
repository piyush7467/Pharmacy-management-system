import React from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';

export function SalesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Sales Ledger & Invoices
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Audit completed transactions, inspect FEFO batch distributions, and reprint tax invoices.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/pos">
          <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold gap-2 shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>New POS Sale</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
