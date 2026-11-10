import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Package,
  Layers,
  FileText,
  Calculator,
  Search,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Edit2
} from 'lucide-react';
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
import {
  FormField,
  FormInput,
  FormSelect,
  VerticalSectionNav,
  FormSectionHeader
} from '../../../components/ui/form-system.jsx';
import { formatCurrency } from '../../../lib/utils.js';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'details', label: 'Order Details', icon: Layers },
  { id: 'items', label: 'Medicines & Items', icon: Package },
  { id: 'commercials', label: 'Commercials', icon: Calculator },
  { id: 'shipping', label: 'Notes & Shipping', icon: FileText }
];

export function CreatePurchaseModal({
  open,
  onOpenChange,
  suppliers = [],
  medicines = [],
  onSubmit,
  isSubmitting
}) {
  const [activeSection, setActiveSection] = useState('details');
  const [supplierId, setSupplierId] = useState('');
  const [procurementMode, setProcurementMode] = useState('DRAFT'); // 'DRAFT' | 'RECEIVED'
  const [poDate, setPoDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expectedDelivery, setExpectedDelivery] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  });
  const [referenceNo, setReferenceNo] = useState(() => `PO-REF-${Math.floor(100 + Math.random() * 900)}`);
  const [notes, setNotes] = useState('');
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');

  // Line items state
  const [items, setItems] = useState([
    {
      medicineId: medicines[0]?.id || '',
      batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
      manufacturingDate: '',
      expiryDate: (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 2);
        return d.toISOString().slice(0, 10);
      })(),
      orderedQuantity: 50,
      unitCost: 10,
      unitSalePrice: 15
    }
  ]);

  const resetForm = () => {
    setActiveSection('details');
    setSupplierId('');
    setProcurementMode('DRAFT');
    setNotes('');
    setReferenceNo(`PO-REF-${Math.floor(100 + Math.random() * 900)}`);
    setItems([
      {
        medicineId: medicines[0]?.id || '',
        batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
        manufacturingDate: '',
        expiryDate: (() => {
          const d = new Date();
          d.setFullYear(d.getFullYear() + 2);
          return d.toISOString().slice(0, 10);
        })(),
        orderedQuantity: 50,
        unitCost: 10,
        unitSalePrice: 15
      }
    ]);
  };

  const handleAddItem = (medId = '') => {
    const selectedMed = medicines.find((m) => m.id === medId) || medicines[0];
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);

    setItems((prev) => [
      ...prev,
      {
        medicineId: selectedMed?.id || '',
        batchNumber: `BATCH-${Date.now().toString().slice(-4)}-${prev.length + 1}`,
        manufacturingDate: '',
        expiryDate: d.toISOString().slice(0, 10),
        orderedQuantity: 50,
        unitCost: 10,
        unitSalePrice: selectedMed?.salePrice || 15
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      toast.warning('A purchase order must contain at least 1 medicine item');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // If user selected a new medicine, auto-fill standard pricing if available
      if (field === 'medicineId') {
        const found = medicines.find((m) => m.id === value);
        if (found && found.salePrice) {
          updated[index].unitSalePrice = found.salePrice;
          updated[index].unitCost = Math.round(found.salePrice * 0.7 * 100) / 100;
        }
      }
      return updated;
    });
  };

  // Calculations
  const totalItemsCount = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + (parseInt(item.orderedQuantity, 10) || 0), 0);
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.orderedQuantity) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);
  const estimatedTax = subtotal * 0.12; // 12% GST standard
  const grandTotal = subtotal + estimatedTax;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!supplierId) {
      setActiveSection('details');
      toast.error('Please select a supplier / distributor');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.medicineId) {
        setActiveSection('items');
        toast.error(`Please select a medicine for line item #${i + 1}`);
        return;
      }
      if (!it.batchNumber.trim()) {
        setActiveSection('items');
        toast.error(`Please enter a batch lot number for line item #${i + 1}`);
        return;
      }
      if (!it.expiryDate) {
        setActiveSection('items');
        toast.error(`Please set an expiry date for line item #${i + 1}`);
        return;
      }
      if (it.expiryDate <= todayStr) {
        setActiveSection('items');
        toast.error(`Expiry date for line #${i + 1} must be in the future`);
        return;
      }
      if (parseFloat(it.orderedQuantity) <= 0) {
        setActiveSection('items');
        toast.error(`Ordered quantity must be positive at line #${i + 1}`);
        return;
      }
      if (parseFloat(it.unitCost) < 0) {
        setActiveSection('items');
        toast.error(`Unit cost cannot be negative at line #${i + 1}`);
        return;
      }
      if (parseFloat(it.unitSalePrice) < parseFloat(it.unitCost)) {
        setActiveSection('items');
        toast.error(`Sale MRP must be >= purchase cost at line #${i + 1}`);
        return;
      }
    }

    const fullNotes = [
      notes.trim(),
      referenceNo ? `Ref: ${referenceNo.trim()}` : '',
      expectedDelivery ? `Expected: ${expectedDelivery}` : ''
    ].filter(Boolean).join(' • ');

    const payload = {
      supplierId,
      notes: fullNotes,
      status: procurementMode, // 'DRAFT' or 'RECEIVED'
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
      <DialogContent className="max-w-5xl w-[96vw] max-h-[92vh] p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl flex flex-col">
        {/* Form Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                  Create Purchase Order (PO)
                </h2>
                <Badge
                  variant="outline"
                  className="font-medium bg-amber-100/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 px-2.5 py-0.5 text-xs rounded-md"
                >
                  {procurementMode === 'DRAFT' ? 'Draft' : 'Direct Inward'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Send a procurement order to your supplier for medicines and healthcare products.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Workspace Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Left Vertical Navigation */}
            <div className="p-4 border-r border-surface/70 bg-surface-page/50 shrink-0 hidden md:block">
              <VerticalSectionNav
                sections={SECTIONS}
                activeSection={activeSection}
                onSelectSection={setActiveSection}
              />
            </div>

            {/* Central Form Canvas & Right Summary Grid */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content Area (8 Cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* SECTION 1: Order Details */}
                  {(activeSection === 'details' || activeSection === 'commercials') && (
                    <div className="p-5 rounded-2xl border border-surface bg-surface-card shadow-2xs space-y-4">
                      <FormSectionHeader
                        icon={Layers}
                        title="Order Details"
                        subtitle="Specify distributor relationship and order dispatch dates."
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Supplier / Distributor" required>
                          <FormSelect
                            leadingIcon={Building2}
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            required
                          >
                            <option value="">Select an active supplier...</option>
                            {suppliers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </FormSelect>
                        </FormField>

                        <FormField label="Procurement Mode" required>
                          <FormSelect
                            leadingIcon={Package}
                            value={procurementMode}
                            onChange={(e) => setProcurementMode(e.target.value)}
                          >
                            <option value="DRAFT">Pending Delivery (Draft PO)</option>
                            <option value="RECEIVED">Direct Inward Receipt (Stock Immediately)</option>
                          </FormSelect>
                        </FormField>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                        <FormField label="PO Date" required>
                          <FormInput
                            type="date"
                            value={poDate}
                            onChange={(e) => setPoDate(e.target.value)}
                            required
                          />
                        </FormField>

                        <FormField label="Expected Delivery">
                          <FormInput
                            type="date"
                            value={expectedDelivery}
                            onChange={(e) => setExpectedDelivery(e.target.value)}
                          />
                        </FormField>

                        <FormField label="Reference No.">
                          <FormInput
                            type="text"
                            placeholder="e.g. PO-REF-001"
                            value={referenceNo}
                            onChange={(e) => setReferenceNo(e.target.value)}
                          />
                        </FormField>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: Medicines & Items */}
                  {(activeSection === 'items' || activeSection === 'details') && (
                    <div className="p-5 rounded-2xl border border-surface bg-surface-card shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface/60">
                        <div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary shrink-0" />
                            <h3 className="text-[17px] font-semibold text-text-primary tracking-tight">
                              Medicines & Items
                            </h3>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            Add medicines to this purchase order.
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddItem()}
                          className="h-8 text-xs font-semibold text-primary border-primary/30 hover:bg-secondary gap-1 cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Item</span>
                        </Button>
                      </div>

                      {/* Quick Search Helper */}
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="text"
                          placeholder="Quick search medicine to add..."
                          value={medicineSearchTerm}
                          onChange={(e) => setMedicineSearchTerm(e.target.value)}
                          className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-surface bg-surface-page placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {medicineSearchTerm && (
                          <div className="absolute top-11 left-0 right-0 z-20 bg-surface-card border border-surface rounded-xl shadow-lg max-h-48 overflow-y-auto p-1 text-xs">
                            {medicines
                              .filter((m) =>
                                m.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
                                m.genericName.toLowerCase().includes(medicineSearchTerm.toLowerCase())
                              )
                              .slice(0, 5)
                              .map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    handleAddItem(m.id);
                                    setMedicineSearchTerm('');
                                  }}
                                  className="w-full text-left p-2 hover:bg-secondary rounded-lg flex items-center justify-between cursor-pointer"
                                >
                                  <div>
                                    <span className="font-semibold text-text-primary">{m.name}</span>
                                    <span className="text-[11px] text-text-muted block">{m.genericName}</span>
                                  </div>
                                  <span className="text-primary font-mono font-bold">+ Add Line</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Editable Items Table */}
                      <div className="overflow-x-auto rounded-xl border border-surface">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-surface-page text-text-muted font-semibold uppercase tracking-wider text-[11px] border-b border-surface">
                            <tr>
                              <th className="py-2.5 px-3 w-8">#</th>
                              <th className="py-2.5 px-3 min-w-[160px]">Medicine</th>
                              <th className="py-2.5 px-3 w-28">Batch (Optional)</th>
                              <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                              <th className="py-2.5 px-3 w-24 text-right">Cost Price (₹)</th>
                              <th className="py-2.5 px-3 w-24 text-right">MRP (₹)</th>
                              <th className="py-2.5 px-3 w-24 text-right">Line Total (₹)</th>
                              <th className="py-2.5 px-3 w-12 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface">
                            {items.map((item, idx) => {
                              const selectedMed = medicines.find((m) => m.id === item.medicineId);
                              const lineTotal = (parseFloat(item.orderedQuantity) || 0) * (parseFloat(item.unitCost) || 0);

                              return (
                                <tr key={idx} className="hover:bg-surface-page/50 transition-colors">
                                  <td className="py-2.5 px-3 font-mono text-text-muted font-bold text-center">
                                    {idx + 1}
                                  </td>
                                  <td className="py-2 px-3">
                                    <select
                                      value={item.medicineId}
                                      onChange={(e) => handleItemChange(idx, 'medicineId', e.target.value)}
                                      className="w-full h-9 rounded-lg border border-surface bg-surface-card px-2 text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                      {medicines.map((m) => (
                                        <option key={m.id} value={m.id}>
                                          {m.name} ({m.dosageForm} • {m.packageUnit})
                                        </option>
                                      ))}
                                    </select>
                                    <span className="text-[10px] text-text-muted block mt-0.5 truncate max-w-[160px]">
                                      {selectedMed?.genericName || 'Pharmaceutical salt'}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2">
                                    <input
                                      type="text"
                                      value={item.batchNumber}
                                      onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                                      className="w-full h-9 rounded-lg border border-surface bg-surface-card px-2 font-mono text-xs text-text-primary uppercase"
                                      placeholder="LOT #"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.orderedQuantity}
                                      onChange={(e) => handleItemChange(idx, 'orderedQuantity', e.target.value)}
                                      className="w-full h-9 rounded-lg border border-surface bg-surface-card px-2 font-mono text-xs text-center font-bold text-text-primary"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.unitCost}
                                      onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                                      className="w-full h-9 rounded-lg border border-surface bg-surface-card px-2 font-mono text-xs text-right text-text-primary"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.unitSalePrice}
                                      onChange={(e) => handleItemChange(idx, 'unitSalePrice', e.target.value)}
                                      className="w-full h-9 rounded-lg border border-surface bg-surface-card px-2 font-mono text-xs text-right text-text-primary"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-right text-text-primary">
                                    {formatCurrency(lineTotal)}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(idx)}
                                      className="p-1.5 text-text-muted hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-surface-page"
                                      title="Remove Line Item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Add Another Item Button */}
                      <button
                        type="button"
                        onClick={() => handleAddItem()}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Another Item</span>
                      </button>
                    </div>
                  )}

                  {/* SECTION 3: Notes & Shipping */}
                  {(activeSection === 'shipping' || activeSection === 'commercials') && (
                    <div className="p-5 rounded-2xl border border-surface bg-surface-card shadow-2xs space-y-4">
                      <FormSectionHeader
                        icon={FileText}
                        title="Notes & Shipping Instructions"
                        subtitle="Add cold-chain requirements, freight terms, or payment terms."
                      />
                      <FormField label="Special Procurement Remarks">
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Keep refrigerated at 2°C - 8°C during transit. Deliver before 2 PM."
                          className="w-full rounded-xl border border-surface bg-surface-card p-3 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </FormField>
                    </div>
                  )}
                </div>

                {/* Right Column: Order Summary Card (4 Cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-5 rounded-2xl border border-surface bg-surface-card shadow-2xs space-y-4 sticky top-0">
                    <div className="flex items-center gap-2 pb-2 border-b border-surface/60">
                      <Calculator className="w-4 h-4 text-primary shrink-0" />
                      <h4 className="text-[17px] font-semibold text-text-primary tracking-tight">
                        Order Summary
                      </h4>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center text-text-muted">
                        <span>Total Items</span>
                        <span className="font-mono font-bold text-text-primary">{totalItemsCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-text-muted">
                        <span>Total Quantity</span>
                        <span className="font-mono font-bold text-text-primary">{totalQuantity} units</span>
                      </div>
                      <div className="flex justify-between items-center text-text-muted">
                        <span>Sub Total</span>
                        <span className="font-mono font-medium text-text-primary">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-text-muted pb-3 border-b border-surface">
                        <span>Est. GST (12%)</span>
                        <span className="font-mono font-medium text-text-primary">{formatCurrency(estimatedTax)}</span>
                      </div>

                      {/* Grand Total Highlight Pill */}
                      <div className="p-3.5 rounded-xl bg-secondary border border-primary/20 flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">Grand Total</span>
                        <span className="font-mono text-lg font-black text-primary">
                          {formatCurrency(grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Informative Regulatory Callout */}
                    <div className="p-3 rounded-xl bg-surface-page border border-surface/80 flex items-start gap-2 text-xs text-text-muted">
                      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong className="text-text-primary">Note:</strong> Batch and expiry details are verified and finalized during Goods Receipt (GRN).
                      </p>
                    </div>

                    {/* Quick Section Switcher Buttons for mobile/responsive */}
                    <div className="pt-2 flex flex-col gap-1.5 border-t border-surface/60">
                      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                        Quick Sections
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {SECTIONS.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setActiveSection(s.id)}
                            className={`p-1.5 rounded-lg border text-left truncate cursor-pointer transition-colors ${
                              activeSection === s.id
                                ? 'bg-secondary border-primary/30 text-primary font-bold'
                                : 'border-surface hover:bg-surface-page text-text-muted'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Form Footer */}
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
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating PO...' : 'Create Purchase Order'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
