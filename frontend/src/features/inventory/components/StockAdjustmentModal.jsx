import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Loader2, AlertTriangle, ShieldCheck, Box, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import {
  FormField,
  FormInput,
  FormSelect
} from '../../../components/ui/form-system.jsx';
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
  const isDeduction = adjType === 'WRITE_OFF_DAMAGED' || adjType === 'WRITE_OFF_EXPIRED' || adjType === 'INVENTORY_COUNT_LOSS';
  const finalDelta = isDeduction ? -Math.abs(numericDelta) : Math.abs(numericDelta);
  const resultingQty = currentQty + finalDelta;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason.trim() || reason.trim().length < 3) {
      toast.error('A mandatory audit reason (minimum 3 characters) is required for stock adjustments');
      return;
    }

    if (isNaN(numericDelta) || numericDelta === 0) {
      toast.error('Quantity delta must be non-zero');
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
        quantityDelta: finalDelta,
        reason: reason.trim()
      },
      () => {
        onOpenChange(false);
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[95vw] max-h-[92vh] p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                  Stock Adjustment & Disposal
                </h2>
                <Badge
                  variant="outline"
                  className="font-mono font-bold bg-secondary text-primary border-primary/20 px-2.5 py-0.5 text-xs rounded-md"
                >
                  {batch.batchNumber}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Record auditable inventory corrections, write-offs of expired stock, or count adjustments.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Batch Lot Summary Card */}
          <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-medium">Medicine Formulation:</span>
              <span className="font-bold text-text-primary text-sm">{batch.medicine?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-medium">Lot Expiry Date:</span>
              <span className="font-mono font-semibold text-text-primary">{formatDate(batch.expiryDate)}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-surface">
              <span className="text-text-muted font-medium">Current In-Stock Quantity:</span>
              <span className="font-mono font-black text-sm text-primary">{currentQty} units</span>
            </div>
          </div>

          <FormField label="Adjustment Type / Classification" required helperText="Categorizes the reason in statutory audit records">
            <FormSelect
              value={adjType}
              onChange={(e) => {
                const val = e.target.value;
                setAdjType(val);
                if (val === 'WRITE_OFF_DAMAGED' || val === 'WRITE_OFF_EXPIRED' || val === 'INVENTORY_COUNT_LOSS') {
                  setDelta(-1);
                } else if (val === 'INVENTORY_COUNT_GAIN') {
                  setDelta(1);
                }
              }}
            >
              <option value="WRITE_OFF_DAMAGED">Write-Off Damaged / Broken Ampoules (-)</option>
              <option value="WRITE_OFF_EXPIRED">Disposal of Expired Medicines (-)</option>
              <option value="INVENTORY_COUNT_LOSS">Inventory Count Audit Deficit / Loss (-)</option>
              <option value="INVENTORY_COUNT_GAIN">Inventory Count Audit Surplus / Restock (+)</option>
            </FormSelect>
          </FormField>

          <FormField label="Units to Adjust" required helperText="Amount to deduct or add to inventory">
            <div className="flex items-center gap-4">
              <FormInput
                type="number"
                min="1"
                value={Math.abs(numericDelta)}
                onChange={(e) => setDelta(e.target.value)}
                className="w-32 font-mono font-bold text-center"
                required
              />
              <div className="text-xs text-text-muted">
                Resulting Balance:{' '}
                <strong className={`font-mono text-sm ${resultingQty < 0 ? 'text-red-600' : 'text-text-primary font-black'}`}>
                  {resultingQty} units
                </strong>
                <span className="text-[11px] block text-text-muted mt-0.5">
                  ({isDeduction ? `Deducting ${Math.abs(numericDelta)}` : `Adding ${Math.abs(numericDelta)}`} units)
                </span>
              </div>
            </div>
          </FormField>

          <FormField label="Mandatory Reason for Audit Trail" required helperText="Detailed clinical or physical audit explanation (min. 3 characters)">
            <FormInput
              placeholder="e.g. Broken vial during shelf rearrangement; verified by Pharmacist."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </FormField>

          {/* Sticky Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 text-sm font-medium rounded-xl cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || resultingQty < 0}
              className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Ledger...</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Commit Stock Adjustment</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
