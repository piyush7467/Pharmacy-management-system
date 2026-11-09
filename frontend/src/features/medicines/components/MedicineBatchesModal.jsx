import React from 'react';
import { Boxes, Clock, CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function MedicineBatchesModal({ medicine, open, onOpenChange }) {
  if (!medicine) return null;

  const batches = medicine.batches || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface-card border-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-text-primary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-brand-primary" />
              <span>{medicine.name}</span>
            </div>
            <span className="font-mono text-xs font-bold text-text-muted">
              SKU: {medicine.sku}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Batch-wise inventory breakdown, expiry allocations, and active lot valuations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl border border-surface bg-surface-page grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-text-muted block font-bold">Total In-Stock:</span>
              <span className="font-black text-brand-primary text-base font-mono">
                {medicine.totalAvailableStock || 0} units
              </span>
            </div>
            <div>
              <span className="text-text-muted block font-bold">Category:</span>
              <span className="font-bold text-text-primary">{medicine.category?.name || 'General'}</span>
            </div>
            <div>
              <span className="text-text-muted block font-bold">Formulation:</span>
              <span className="font-bold text-text-primary">
                {medicine.dosageForm || 'Oral'} {medicine.strength ? `(${medicine.strength})` : ''}
              </span>
            </div>
          </div>

          {/* Batches List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Inventory Lots ({batches.length})
            </h4>

            {batches.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-xs">
                No active or depleted batches logged for this formulation.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {batches.map((batch) => {
                  const now = new Date();
                  const expDate = new Date(batch.expiryDate);
                  const isExpired = expDate <= now;

                  return (
                    <div
                      key={batch.id}
                      className="p-3.5 rounded-xl border border-surface bg-surface-card flex items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-text-primary text-sm">
                            {batch.batchNumber}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              batch.status === 'ACTIVE'
                                ? 'border-brand-primary/30 text-brand-primary bg-brand-primary/10'
                                : 'border-surface text-text-muted'
                            }`}
                          >
                            {batch.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1 font-mono flex-wrap">
                          <span className={isExpired ? 'text-rose-600 font-bold' : ''}>
                            Exp: {formatDate(batch.expiryDate)}
                          </span>
                          <span>•</span>
                          <span>Cost: {formatCurrency(batch.purchaseCost)}</span>
                          <span>•</span>
                          <span>MRP: {formatCurrency(batch.salePrice)}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-sm text-text-primary block">
                          {batch.currentQuantity} units
                        </span>
                        <span className="text-[10px] text-text-muted">
                          of {batch.initialQuantity} rcvd
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-surface font-bold cursor-pointer w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
