import React, { useState, useEffect } from 'react';
import { PackageCheck, Loader2, AlertCircle, Building2, Calendar, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
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

  const handleQtyChange = (itemId, val) => {
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

  const totalOrdered = purchase.items?.reduce((sum, it) => sum + (it.orderedQuantity || 0), 0) || 0;
  const totalReceived = purchase.items?.reduce(
    (sum, it) => sum + (quantities[it.id] !== undefined ? quantities[it.id] : it.orderedQuantity),
    0
  ) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payloadItems = purchase.items.map((item) => ({
      purchaseItemId: item.id,
      receivedQuantity: quantities[item.id] !== undefined ? quantities[item.id] : item.orderedQuantity
    }));

    const receivedSum = payloadItems.reduce((sum, it) => sum + it.receivedQuantity, 0);
    if (receivedSum === 0) {
      toast.warning('At least one item line must have a received quantity > 0');
      return;
    }

    onConfirmReceive(purchase.id, { items: payloadItems }, () => {
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[92vh] p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                  Goods Received Note (GRN)
                </h2>
                <Badge
                  variant="outline"
                  className="font-mono font-bold bg-secondary text-primary border-primary/20 px-2.5 py-0.5 text-xs rounded-md"
                >
                  {purchase.purchaseNumber}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Verify physical stock delivery, validate batch lot numbers and intake into active ledger.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Supplier & Order Meta Card */}
            <div className="p-4 rounded-xl border border-surface bg-surface-page grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-text-muted block font-medium">Distributor / Supplier</span>
                <span className="font-semibold text-text-primary text-sm flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  {purchase.supplier?.name}
                </span>
              </div>
              <div>
                <span className="text-text-muted block font-medium">Order Placed On</span>
                <span className="font-semibold text-text-primary text-sm flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-text-muted shrink-0" />
                  {formatDate(purchase.createdAt)}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-text-muted block font-medium">Intake Progress</span>
                <span className="font-mono font-bold text-sm text-primary mt-0.5 block">
                  {totalReceived} / {totalOrdered} Units
                </span>
              </div>
            </div>

            {/* Line Items Intake Verification Table */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">
                  Line Items Intake Verification
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleReceiveAll}
                  className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-secondary cursor-pointer"
                >
                  Set All to Ordered Qty
                </Button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {purchase.items?.map((item) => {
                  const currentRecv = quantities[item.id] !== undefined ? quantities[item.id] : item.orderedQuantity;
                  const isFull = currentRecv === item.orderedQuantity;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-surface bg-surface-card flex items-center justify-between gap-3 shadow-2xs hover:border-surface/80 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-sm text-text-primary block truncate">
                          {item.medicine?.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-text-muted mt-1 flex-wrap font-mono">
                          <span>Lot: <strong className="text-text-primary">{item.batchNumber}</strong></span>
                          <span>•</span>
                          <span>Exp: {formatDate(item.expiryDate)}</span>
                          <span>•</span>
                          <span>Unit Cost: {formatCurrency(item.unitCost)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[11px] text-text-muted block font-medium">Ordered</span>
                          <span className="font-mono font-bold text-xs text-text-primary">{item.orderedQuantity}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] text-primary block font-semibold text-right">Received Qty</span>
                          <input
                            type="number"
                            min="0"
                            value={currentRecv}
                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                            className="w-24 h-10 text-center font-mono font-black text-sm rounded-xl border border-surface bg-surface-page focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-surface bg-surface-card shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-10 px-5 text-sm font-medium rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Stocking Batches...' : 'Confirm Goods Received (GRN)'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
