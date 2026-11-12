import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';

export function PurchasesHeader({ onOpenCreateModal, canCreatePurchase, totalPurchases, receivedPurchases, draftPurchases, totalSpend }) {
  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-surface">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Purchases & Goods Receiving
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {canCreatePurchase && (
            <Button
              onClick={onOpenCreateModal}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold gap-2 shadow-sm cursor-pointer rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-text-muted">
          <span className="font-semibold text-text-primary">{totalPurchases}</span> orders
        </span>
        {receivedPurchases > 0 && (
          <span className="text-text-muted">
            <span className="font-semibold text-text-primary">{receivedPurchases}</span> received
          </span>
        )}
        {draftPurchases > 0 && (
          <span className="text-text-muted">
            <span className="font-semibold text-amber-600 dark:text-amber-400">{draftPurchases}</span> pending
          </span>
        )}
        {totalSpend > 0 && (
          <span className="text-text-muted">
            <span className="font-semibold text-text-primary">₹{(totalSpend / 1000).toFixed(1)}k</span> total spend
          </span>
        )}
      </div>
    </div>
  );
}
