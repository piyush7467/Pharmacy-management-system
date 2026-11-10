import React, { useState } from 'react';
import { Search, Loader2, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck, X, FileText, User, Receipt } from 'lucide-react';
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
      const salesList = Array.isArray(res.data) ? res.data : (res.data?.sales || res.data?.data || res || []);
      const match = salesList[0];
      if (!match) {
        toast.error(`No invoice found matching "${query}"`);
        setTargetSale(null);
        return;
      }

      // Fetch full sale details with all items and existing returns
      const fullRes = await apiClient.get(`/sales/${match.id}`);
      const saleData = fullRes.data?.data || fullRes.data || fullRes;
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
      toast.success(`Loaded invoice ${saleData.invoiceNumber}`);
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
      <DialogContent className="max-w-2xl w-[95vw] max-h-[92vh] p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                  Process Customer Return
                </h2>
                <Badge
                  variant="outline"
                  className="font-medium bg-secondary text-primary border-primary/20 px-2 py-0.5 text-xs rounded-md"
                >
                  Credit Note
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Lookup the original sale invoice, select returnable lines, and restitution condition.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Step 1: Search Invoice */}
          <FormField label="Original Fiscal Tax Invoice Number" required helperText="Enter or scan the customer invoice number">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FormInput
                  leadingIcon={Search}
                  placeholder="e.g. INV-20261109-1234"
                  value={invoiceLookup}
                  onChange={(e) => setInvoiceLookup(e.target.value)}
                  disabled={isSearching || isSubmitting}
                  className="font-mono text-sm"
                  autoFocus
                />
              </div>
              <Button
                type="button"
                onClick={handleLookup}
                disabled={isSearching || isSubmitting || !invoiceLookup.trim()}
                className="h-[46px] px-5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shrink-0 cursor-pointer"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search Invoice'}
              </Button>
            </div>
          </FormField>

          {/* Invoice Summary Banner */}
          {targetSale && (
            <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  <span className="font-mono font-bold text-text-primary text-sm">
                    {targetSale.invoiceNumber}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({formatDate(targetSale.createdAt)})
                  </span>
                </div>
                <Badge variant="outline" className="font-semibold bg-secondary text-primary border-primary/30">
                  {targetSale.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-surface">
                <div>
                  <span className="text-text-muted block font-medium">Customer</span>
                  <span className="font-bold text-text-primary">{targetSale.customerName || 'Walk-in'}</span>
                </div>
                <div>
                  <span className="text-text-muted block font-medium">Payment Method</span>
                  <span className="font-bold text-text-primary">{targetSale.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-text-muted block font-medium">Invoice Value</span>
                  <span className="font-bold text-text-primary font-mono">{formatCurrency(targetSale.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Line Items to Return */}
          {targetSale && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">
                  Select Line Items to Return
                </span>
                <span className="text-xs text-text-muted">
                  Check items and select quantity
                </span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {targetSale.items?.map((item) => {
                  const state = itemsState[item.id] || {};
                  const isAvailable = state.maxReturnable > 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        state.selected
                          ? 'border-primary bg-secondary/20 shadow-2xs'
                          : 'border-surface bg-surface-card'
                      } ${!isAvailable ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
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
                            className="h-4 w-4 rounded border-surface text-primary focus:ring-primary cursor-pointer"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-sm text-text-primary block truncate">
                              {state.name}
                            </span>
                            <span className="text-xs text-text-muted font-mono">
                              Lot: {state.batchNumber} • Sold: {item.quantity} • Max Returnable: {state.maxReturnable}
                            </span>
                          </div>
                        </div>

                        {state.selected && (
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-text-muted font-medium">Qty:</span>
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

                            <select
                              value={state.disposition}
                              onChange={(e) => {
                                setItemsState((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], disposition: e.target.value }
                                }));
                              }}
                              className="h-8 px-2 text-xs font-semibold bg-surface-page border border-surface rounded-lg text-text-primary"
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

          {/* Mandatory Reason */}
          {targetSale && (
            <FormField label="Mandatory Reason for Credit Note" required helperText="Statutory audit requirement for medicines return">
              <FormInput
                placeholder="e.g. Unopened blister pack, doctor modified prescription dosage"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </FormField>
          )}

          {/* Estimated Refund Summary Pill */}
          {targetSale && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-primary/20">
              <span className="text-xs font-bold text-primary uppercase">Estimated Customer Refund:</span>
              <span className="text-lg font-black text-primary font-mono">
                {formatCurrency(estimatedRefund)}
              </span>
            </div>
          )}

          {/* Footer Actions */}
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
              disabled={!targetSale || isSubmitting}
              className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Issuing Note...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Confirm & Issue Credit Note</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
