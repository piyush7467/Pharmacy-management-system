import React, { useState } from 'react';
import { Plus, Trash2, Loader2, Building2, Layers, AlertCircle, Calendar } from 'lucide-react';
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
import { formatCurrency } from '../../../lib/utils.js';
import { toast } from 'sonner';

export function CreatePurchaseModal({
  open,
  onOpenChange,
  suppliers,
  medicines,
  onSubmit,
  isSubmitting
}) {
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [items, setItems] = useState([
    {
      medicineId: '',
      batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
      manufacturingDate: '',
      expiryDate: '',
      orderedQuantity: 50,
      unitCost: 10,
      unitSalePrice: 15
    }
  ]);

  const resetForm = () => {
    setSupplierId('');
    setNotes('');
    setStatus('DRAFT');
    setItems([
      {
        medicineId: '',
        batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
        manufacturingDate: '',
        expiryDate: '',
        orderedQuantity: 50,
        unitCost: 10,
        unitSalePrice: 15
      }
    ]);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        medicineId: '',
        batchNumber: `BATCH-${Date.now().toString().slice(-4)}-${prev.length + 1}`,
        manufacturingDate: '',
        expiryDate: '',
        orderedQuantity: 50,
        unitCost: 10,
        unitSalePrice: 15
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      toast.warning('A purchase order must contain at least 1 item');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.orderedQuantity) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  const estimatedTax = subtotal * 0.12;
  const grandTotal = subtotal + estimatedTax;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.medicineId) {
        toast.error(`Please select a medicine for line item #${i + 1}`);
        return;
      }
      if (!it.batchNumber.trim()) {
        toast.error(`Please enter a batch lot number for line item #${i + 1}`);
        return;
      }
      if (!it.expiryDate) {
        toast.error(`Please set an expiry date for line item #${i + 1}`);
        return;
      }
      if (it.expiryDate <= todayStr) {
        toast.error(`Expiry date for line #${i + 1} must be in the future`);
        return;
      }
      if (parseFloat(it.orderedQuantity) <= 0) {
        toast.error(`Ordered quantity must be positive at line #${i + 1}`);
        return;
      }
      if (parseFloat(it.unitCost) < 0) {
        toast.error(`Unit cost cannot be negative at line #${i + 1}`);
        return;
      }
      if (parseFloat(it.unitSalePrice) < parseFloat(it.unitCost)) {
        toast.error(`Sale price must be >= unit purchase cost at line #${i + 1}`);
        return;
      }
    }

    const payload = {
      supplierId,
      notes: notes.trim(),
      status,
      items: items.map((it) => ({
        medicineId: it.medicineId,
        batchNumber: it.batchNumber.trim().toUpperCase(),
        manufacturingDate: it.manufacturingDate || null,
        expiryDate: it.expiryDate,
        orderedQuantity: parseInt(it.orderedQuantity, 10),
        unitCost: parseFloat(it.unitCost),
        unitSalePrice: parseFloat(it.unitSalePrice)
      }))
    };

    onSubmit(payload, () => {
      resetForm();
      onOpenChange(false);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-4xl bg-surface-card border-surface shadow-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-text-primary flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-primary" />
            <span>Create Purchase Order (PO)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Draft a procurement order with pharmaceutical distributors. Batch lots will be generated upon arrival.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-3">
          {/* Supplier & Status Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-surface bg-surface-page">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Supplier / Pharmaceutical Distributor *
              </Label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-surface-card border border-surface rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              >
                <option value="">Select an active supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.contactPerson ? `${s.contactPerson} • ` : ''}GSTIN: {s.gstin || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Initial Status
              </Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-surface-card border border-surface rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="DRAFT">Pending (Draft PO)</option>
                <option value="RECEIVED">Received & Stock Immediately</option>
              </select>
            </div>
          </div>

          {/* Line Items Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Order Line Items ({items.length})
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddItem}
                className="h-8 px-2.5 text-xs font-bold text-brand-primary border-brand-primary/30 hover:bg-brand-primary/10 gap-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </Button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-surface bg-surface-card space-y-3 shadow-2xs relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-muted">Line Item #{index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-text-muted hover:text-rose-500 p-1 cursor-pointer"
                        title="Remove Line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Medicine */}
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-[11px] font-bold text-text-muted uppercase">Medicine</Label>
                      <select
                        value={item.medicineId}
                        onChange={(e) => handleItemChange(index, 'medicineId', e.target.value)}
                        className="w-full h-9 px-2.5 text-xs bg-surface-page border border-surface rounded-lg text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        required
                      >
                        <option value="">Select medicine...</option>
                        {medicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.dosageForm || 'Oral'} • {m.packageUnit || 'Pack'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Batch Number */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-text-muted uppercase">Batch Lot #</Label>
                      <Input
                        value={item.batchNumber}
                        onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                        className="h-9 px-2.5 text-xs font-mono bg-surface-page border-surface uppercase"
                        placeholder="LOT-2026-01"
                        required
                      />
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-text-muted uppercase">Expiry Date *</Label>
                      <Input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                        className="h-9 px-2.5 text-xs bg-surface-page border-surface"
                        min={new Date().toISOString().slice(0, 10)}
                        required
                      />
                    </div>

                    {/* Ordered Quantity */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-text-muted uppercase">Ordered Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.orderedQuantity}
                        onChange={(e) => handleItemChange(index, 'orderedQuantity', e.target.value)}
                        className="h-9 px-2.5 text-xs font-mono font-bold bg-surface-page border-surface"
                        required
                      />
                    </div>

                    {/* Unit Purchase Cost */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-text-muted uppercase">Cost Price (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                        className="h-9 px-2.5 text-xs font-mono font-bold bg-surface-page border-surface"
                        required
                      />
                    </div>

                    {/* Unit Sale Price */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-text-muted uppercase">Sale MRP (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={item.unitCost || '0'}
                        value={item.unitSalePrice}
                        onChange={(e) => handleItemChange(index, 'unitSalePrice', e.target.value)}
                        className="h-9 px-2.5 text-xs font-mono font-bold bg-surface-page border-surface"
                        required
                      />
                    </div>

                    {/* Line Total */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-text-muted uppercase">Line Cost Total</Label>
                      <div className="h-9 px-2.5 flex items-center justify-end text-xs font-mono font-bold bg-surface-page rounded-lg border border-surface text-text-primary">
                        {formatCurrency((parseFloat(item.orderedQuantity) || 0) * (parseFloat(item.unitCost) || 0))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Financial Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Order Notes / Shipment Terms (Optional)
              </Label>
              <Input
                placeholder="e.g. Standard cold-chain transit required for biologicals"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-surface-page border-surface text-sm rounded-xl"
              />
            </div>

            <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Subtotal (Gross PO):</span>
                <span className="font-bold font-mono text-text-primary">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Est. Input GST (12%):</span>
                <span className="font-bold font-mono text-text-primary">{formatCurrency(estimatedTax)}</span>
              </div>
              <div className="flex justify-between text-base font-black pt-1.5 border-t border-surface text-brand-primary">
                <span>Total PO Valuation:</span>
                <span className="font-mono">{formatCurrency(grandTotal)}</span>
              </div>
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
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Purchase Order</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
