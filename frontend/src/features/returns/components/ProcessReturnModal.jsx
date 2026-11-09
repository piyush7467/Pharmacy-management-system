import React, { useState } from 'react';
import { Search, Loader2, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck, X } from 'lucide-react';
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
import { apiClient } from '../../../services/api/apiClient.js';
import { formatCurrency, formatDate } from '../../../lib/utils.js';
import { toast } from 'sonner';

export function ProcessReturnModal({ open, onOpenChange, onSubmitReturn, isSubmitting }) {
  const [invoiceLookup, setInvoiceLookup] = useState('');
  const [targetSale, setTargetSale] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [itemsState, setItemsState] = useState({});

  const resetForm = () => {
    setInvoiceLookup('');
    setTargetSale(null);
    setReturnReason('');
    setItemsState({});
  };

  const handleLookup = async (e) => {
    e?.preventDefault();
    const query = invoiceLookup.trim();
    if (!query) {
      toast.warning('Please enter an invoice number');
      return;
    }

    setIsSearching(true);
    try {
      const res = await apiClient.get('/sales', { params: { search: query } });
      const match = res.data?.data?.[0];
      if (!match) {
        toast.error(`No invoice found matching "${query}"`);
        setTargetSale(null);
        return;
      }

      // Fetch full sale details with all items and existing returns
      const fullRes = await apiClient.get(`/sales/${match.id}`);
      const saleData = fullRes.data.data;
      setTargetSale(saleData);

      // Pre-calculate prior returns per saleItem
      const priorReturnedMap = {};
      saleData.returns?.forEach((r) => {
        r.items?.forEach((ri) => {
          priorReturnedMap[ri.saleItemId] = (priorReturnedMap[ri.saleItemId] || 0) + ri.quantity;
        });
      });

      // Initialize item return state
      const initial = {};
      saleData.items?.forEach((item) => {
        const prior = priorReturnedMap[item.id] || 0;
        const available = Math.max(0, item.quantity - prior);
        initial[item.id] = {
          selected: false,
          quantity: available > 0 ? 1 : 0,
          maxReturnable: available,
          disposition: 'RESTOCKED',
          unitPrice: Number(item.unitPrice),
          name: item.medicine?.name || 'Medicine',
          batchNumber: item.batch?.batchNumber || 'N/A'
        };
      });
      setItemsState(initial);
    } catch (err) {
      toast.error('Failed to look up invoice');
    } finally {
      setIsSearching(false);
    }
  };

  // Estimated refund total based on selected items
  const estimatedRefund = Object.values(itemsState).reduce((sum, item) => {
    if (item.selected && item.quantity > 0) {
      return sum + item.quantity * item.unitPrice;
    }
    return sum;
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetSale) {
      toast.error('Please look up and select an invoice first');
      return;
    }

    if (!returnReason.trim() || returnReason.trim().length < 3) {
      toast.error('A mandatory return reason (minimum 3 characters) is required');
      return;
    }

    const selectedItems = Object.entries(itemsState)
      .filter(([_, item]) => item.selected && item.quantity > 0)
      .map(([saleItemId, item]) => ({
        saleItemId,
        quantity: parseInt(item.quantity, 10),
        disposition: item.disposition
      }));

    if (selectedItems.length === 0) {
      toast.error('Please select at least one item line to return');
      return;
    }

    onSubmitReturn(
      {
        saleId: targetSale.id,
        reason: returnReason.trim(),
        items: selectedItems
      },
      () => {
        resetForm();
        onOpenChange(false);
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-2xl bg-surface-card border-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-text-primary flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand-primary" />
            <span>Process Customer Return Note</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Lookup the original sale invoice, select returnable items, and specify inventory restitution condition.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          {/* Step 1: Invoice Lookup */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              1. Original Sale Invoice #
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Enter full invoice number (e.g. INV-20261109-1234)"
                  value={invoiceLookup}
                  onChange={(e) => setInvoiceLookup(e.target.value)}
                  className="pl-9 bg-surface-page border-surface font-mono text-sm rounded-xl"
                  disabled={isSearching || isSubmitting}
                />
              </div>
              <Button
                type="button"
                onClick={handleLookup}
                disabled={isSearching || isSubmitting || !invoiceLookup.trim()}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-4 rounded-xl cursor-pointer"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Invoice'}
              </Button>
            </div>
          </div>

          {/* Invoice Summary Banner */}
          {targetSale && (
            <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-brand-primary text-sm">
                    {targetSale.invoiceNumber}
                  </span>
                  <span className="text-xs text-text-muted ml-2">
                    ({formatDate(targetSale.createdAt)})
                  </span>
                </div>
                <Badge variant="outline" className="font-bold border-brand-primary/30 text-brand-primary">
                  {targetSale.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-text-muted block">Customer:</span>
                  <span className="font-bold text-text-primary">{targetSale.customerName}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Payment:</span>
                  <span className="font-bold text-text-primary">{targetSale.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Invoice Total:</span>
                  <span className="font-bold text-text-primary font-mono">{formatCurrency(targetSale.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Line Items to Return */}
          {targetSale && (
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                2. Select Items to Return
              </Label>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {targetSale.items?.map((item) => {
                  const state = itemsState[item.id] || {};
                  const isAvailable = state.maxReturnable > 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all ${
                        state.selected
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-surface bg-surface-card'
                      } ${!isAvailable ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={Boolean(state.selected)}
                            disabled={!isAvailable}
                            onChange={(e) => {
                              setItemsState((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], selected: e.target.checked }
                              }));
                            }}
                            className="h-4 w-4 rounded border-surface text-brand-primary focus:ring-brand-primary"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-text-primary block truncate">
                              {state.name}
                            </span>
                            <span className="text-[11px] text-text-muted font-mono">
                              Lot: {state.batchNumber} • Sold: {item.quantity} • Max Returnable: {state.maxReturnable}
                            </span>
                          </div>
                        </div>

                        {state.selected && (
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Qty Input */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-text-muted font-bold">Qty:</span>
                              <input
                                type="number"
                                min="1"
                                max={state.maxReturnable}
                                value={state.quantity}
                                onChange={(e) => {
                                  const val = Math.min(
                                    state.maxReturnable,
                                    Math.max(1, parseInt(e.target.value, 10) || 1)
                                  );
                                  setItemsState((prev) => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], quantity: val }
                                  }));
                                }}
                                className="w-16 h-8 text-center text-xs font-mono font-bold rounded-lg border border-surface bg-surface-page text-text-primary"
                              />
                            </div>

                            {/* Disposition Selector */}
                            <select
                              value={state.disposition}
                              onChange={(e) => {
                                setItemsState((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], disposition: e.target.value }
                                }));
                              }}
                              className="h-8 px-2 text-xs font-bold bg-surface-page border border-surface rounded-lg text-text-primary"
                            >
                              <option value="RESTOCKED">Restock Batch (Saleable)</option>
                              <option value="DAMAGED_DISCARDED">Damaged / Discarded</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Mandatory Reason */}
          {targetSale && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                3. Mandatory Return Reason (Min. 3 characters) *
              </Label>
              <Input
                placeholder="e.g., Doctor changed prescription; unopened blister packaging verified"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="bg-surface-page border-surface text-sm rounded-xl"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Estimated Refund Summary */}
          {targetSale && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-page border border-surface">
              <span className="text-xs font-bold text-text-muted uppercase">Estimated Refund to Customer:</span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(estimatedRefund)}
              </span>
            </div>
          )}

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
              disabled={!targetSale || isSubmitting}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Return...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Confirm & Issue Credit Note</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
