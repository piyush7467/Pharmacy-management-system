import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
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
import { formatDate } from '../../../lib/utils.js';
import { toast } from 'sonner';

export function StockAdjustmentModal({
  batch,
  open,
  onOpenChange,
  onSubmitAdjustment,
  isSubmitting
}) {
  const [adjType, setAdjType] = useState('WRITE_OFF_DAMAGED');
  const [delta, setDelta] = useState(-1);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (batch) {
      setAdjType('WRITE_OFF_DAMAGED');
      setDelta(-1);
      setReason('');
    }
  }, [batch]);

  if (!batch) return null;

  const currentQty = batch.currentQuantity;
  const numericDelta = parseInt(delta, 10) || 0;
  const resultingQty = currentQty + numericDelta;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason.trim() || reason.trim().length < 3) {
      toast.error('A mandatory audit reason (minimum 3 characters) is required for stock adjustments');
      return;
    }

    if (isNaN(numericDelta) || numericDelta === 0) {
      toast.error('Quantity delta must be non-zero (negative for deductions, positive for restocking)');
      return;
    }

    if (resultingQty < 0) {
      toast.error(`Adjustment would cause negative stock balance (${resultingQty})`);
      return;
    }

    onSubmitAdjustment(
      {
        batchId: batch.id,
        adjustmentType: adjType,
        quantityDelta: numericDelta,
        reason: reason.trim()
      },
      () => {
        onOpenChange(false);
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-surface-card border-surface shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-text-primary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-brand-primary" />
              <span>Stock Adjustment & Write-Off</span>
            </div>
            <span className="font-mono text-sm font-bold text-brand-primary">
              {batch.batchNumber}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Record auditable inventory corrections, write-offs of expired/damaged stock, or regulatory quarantine.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Batch Summary */}
          <div className="p-3.5 rounded-xl border border-surface bg-surface-page space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted font-bold">Medicine:</span>
              <span className="font-bold text-text-primary">{batch.medicine?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-bold">Expiry Date:</span>
              <span className="font-mono text-text-primary">{formatDate(batch.expiryDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-bold">Current In-Stock Quantity:</span>
              <span className="font-mono font-black text-sm text-text-primary">{currentQty} units</span>
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Adjustment Type / Classification *
            </Label>
            <select
              value={adjType}
              onChange={(e) => {
                const val = e.target.value;
                setAdjType(val);
                if (val === 'WRITE_OFF_DAMAGED' || val === 'WRITE_OFF_EXPIRED') {
                  setDelta(-1);
                } else if (val === 'AUDIT_SURPLUS') {
                  setDelta(1);
                }
              }}
              className="w-full h-10 px-3 text-sm bg-surface-page border border-surface rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="WRITE_OFF_DAMAGED">Write-Off Damaged / Broken Ampoules (-)</option>
              <option value="WRITE_OFF_EXPIRED">Disposal of Expired Medicines (-)</option>
              <option value="AUDIT_DISCREPANCY">Audit Deficit Correction (-)</option>
              <option value="AUDIT_SURPLUS">Audit Surplus Restock (+)</option>
            </select>
          </div>

          {/* Quantity Delta */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Quantity Delta (Negative for deduction, Positive for addition) *
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                className="w-32 h-10 font-mono font-black text-sm text-center bg-surface-page border-surface rounded-xl"
                required
              />
              <div className="text-xs text-text-muted">
                Resulting Balance: <strong className={`font-mono text-sm ${resultingQty < 0 ? 'text-rose-600' : 'text-text-primary font-black'}`}>{resultingQty} units</strong>
              </div>
            </div>
          </div>

          {/* Mandatory Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Mandatory Reason for Audit Trail (Min. 3 characters) *
            </Label>
            <Input
              placeholder="e.g., Cold-chain sensor failure during transit; regulatory destruction batch logged"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-surface-page border-surface text-sm rounded-xl"
              required
              disabled={isSubmitting}
            />
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
              disabled={isSubmitting || resultingQty < 0}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Ledger Entry...</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Commit Stock Adjustment</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
