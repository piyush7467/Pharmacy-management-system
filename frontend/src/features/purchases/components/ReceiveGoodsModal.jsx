import React, { useState, useEffect } from 'react';
import { PackageCheck, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Label } from '../../../components/ui/label.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';
import { toast } from 'sonner';

export function ReceiveGoodsModal({
  purchase,
  open,
  onOpenChange,
  onConfirmReceive,
  isSubmitting
}) {
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (purchase?.items) {
      const initial = {};
      purchase.items.forEach((item) => {
        initial[item.id] = item.orderedQuantity;
      });
      setQuantities(initial);
    }
  }, [purchase]);

  if (!purchase) return null;

  const handleQtyChange = (itemId, val, max) => {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    setQuantities((prev) => ({ ...prev, [itemId]: parsed }));
  };

  const handleReceiveAll = () => {
    const full = {};
    purchase.items.forEach((item) => {
      full[item.id] = item.orderedQuantity;
    });
    setQuantities(full);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payloadItems = purchase.items.map((item) => ({
      purchaseItemId: item.id,
      receivedQuantity: quantities[item.id] !== undefined ? quantities[item.id] : item.orderedQuantity
    }));

    const totalReceived = payloadItems.reduce((sum, it) => sum + it.receivedQuantity, 0);
    if (totalReceived === 0) {
      toast.warning('At least one item line must have a received quantity > 0');
      return;
    }

    onConfirmReceive(purchase.id, { items: payloadItems }, () => {
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface-card border-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-text-primary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-brand-primary" />
              <span>Goods Received Note (GRN)</span>
            </div>
            <span className="font-mono text-sm font-bold text-brand-primary">
              {purchase.purchaseNumber}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Inspect delivered physical stock, verify batch lot integrity, and record quantities into the active inventory ledger.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Supplier Info */}
          <div className="p-3.5 rounded-xl border border-surface bg-surface-page flex items-center justify-between text-xs">
            <div>
              <span className="text-text-muted block font-bold">Distributor / Supplier:</span>
              <span className="font-bold text-text-primary text-sm">{purchase.supplier?.name}</span>
            </div>
            <div className="text-right">
              <span className="text-text-muted block font-bold">PO Date:</span>
              <span>{formatDate(purchase.createdAt)}</span>
            </div>
          </div>

          {/* Items Intake Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Line Items Intake Verification
              </Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleReceiveAll}
                className="h-7 text-xs font-bold text-brand-primary hover:bg-brand-primary/10 cursor-pointer"
              >
                Set All to Ordered Qty
              </Button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {purchase.items?.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-surface bg-surface-card flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm text-text-primary block truncate">
                      {item.medicine?.name}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5 flex-wrap font-mono">
                      <span>Lot: <strong className="text-text-primary">{item.batchNumber}</strong></span>
                      <span>•</span>
                      <span>Exp: {formatDate(item.expiryDate)}</span>
                      <span>•</span>
                      <span>Cost: {formatCurrency(item.unitCost)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted block font-bold uppercase">Ordered</span>
                      <span className="font-mono font-bold text-xs text-text-primary">{item.orderedQuantity}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-brand-primary block font-black uppercase text-right">Received</span>
                      <Input
                        type="number"
                        min="0"
                        value={quantities[item.id] !== undefined ? quantities[item.id] : item.orderedQuantity}
                        onChange={(e) => handleQtyChange(item.id, e.target.value, item.orderedQuantity)}
                        className="w-20 h-9 text-center font-mono font-black text-sm rounded-lg border-surface bg-surface-page"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-surface font-bold cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Stocking Batches...</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-4 h-4" />
                  <span>Confirm Goods Received (GRN)</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
