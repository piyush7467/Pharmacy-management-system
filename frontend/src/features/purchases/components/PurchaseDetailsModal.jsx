import React from 'react';
import { Truck, CheckCircle2, Clock, XCircle, Building2, Printer } from 'lucide-react';
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

export function PurchaseDetailsModal({ purchase, open, onOpenChange }) {
  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface-card border-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-text-primary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-primary" />
              <span>Purchase Order #{purchase.purchaseNumber}</span>
            </div>
            <Badge
              variant="outline"
              className={`font-bold ${
                purchase.status === 'RECEIVED'
                  ? 'border-brand-primary/30 text-brand-primary bg-brand-primary/10'
                  : purchase.status === 'DRAFT'
                  ? 'border-amber-500/30 text-amber-600 bg-amber-500/10'
                  : 'border-surface text-text-muted line-through'
              }`}
            >
              {purchase.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Supplier procurement details, itemized batch allocations, and intake ledger records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Supplier & Order Meta */}
          <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-text-muted block font-bold">Supplier / Distributor:</span>
                <span className="font-bold text-text-primary text-sm flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                  {purchase.supplier?.name}
                </span>
                {(purchase.supplier?.taxNumber || purchase.supplier?.gstin) && (
                  <span className="text-[11px] text-text-muted font-mono block">
                    GSTIN / Tax ID: {purchase.supplier?.taxNumber || purchase.supplier?.gstin}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-text-muted block font-bold">Date Created:</span>
                <span className="font-medium text-text-primary">{formatDate(purchase.createdAt)}</span>
                {purchase.notes && (
                  <span className="text-[11px] text-text-muted block italic mt-1">
                    Notes: {purchase.notes}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Procured Medicines & Batches
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {purchase.items?.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-surface bg-surface-card flex items-center justify-between text-xs gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-text-primary block truncate text-sm">
                      {item.medicine?.name || 'Medicine'}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5 font-mono flex-wrap">
                      <span>Batch: <strong className="text-text-primary">{item.batchNumber}</strong></span>
                      <span>•</span>
                      <span>Exp: {formatDate(item.expiryDate)}</span>
                      <span>•</span>
                      <span>Cost: {formatCurrency(item.unitCost)}</span>
                      <span>•</span>
                      <span>Sale MRP: {formatCurrency(item.unitSalePrice)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs">
                      <span className="text-text-muted">Ordered: </span>
                      <strong className="text-text-primary">{item.orderedQuantity}</strong>
                      {purchase.status === 'RECEIVED' && (
                        <span className="text-brand-primary font-bold ml-1.5">
                          (Rcvd: {item.receivedQuantity})
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-black text-sm text-text-primary block mt-0.5">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Subtotal (Items):</span>
              <span className="font-mono font-bold text-text-primary">{formatCurrency(purchase.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Input Tax (GST 12%):</span>
              <span className="font-mono font-bold text-text-primary">{formatCurrency(purchase.taxTotal)}</span>
            </div>
            <div className="flex justify-between text-base font-black pt-1.5 border-t border-surface text-brand-primary">
              <span>Total PO Value:</span>
              <span className="font-mono">{formatCurrency(purchase.grandTotal)}</span>
            </div>
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
