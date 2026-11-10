import React, { useState, useMemo } from 'react';
import {
  ShoppingCart, Plus, Trash2, Calendar, Building2, Package, Layers,
  FileText, Calculator, Search, Info, Clock, ShieldCheck,
  CheckCircle2, ChevronRight, X, AlertCircle, TrendingUp
} from 'lucide-react';
import {
  Dialog, DialogContent
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import {
  FormField, FormInput, FormSelect,
  VerticalSectionNav, FormSectionHeader
} from '../../../components/ui/form-system.jsx';
import { formatCurrency } from '../../../lib/utils.js';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'details', label: 'Order Details', icon: Layers, description: 'Supplier & dates' },
  { id: 'items', label: 'Medicines & Items', icon: Package, description: 'Line items' },
  { id: 'commercials', label: 'Commercials', icon: Calculator, description: 'Pricing & tax' },
  { id: 'shipping', label: 'Notes & Shipping', icon: FileText, description: 'Instructions' }
];

const defaultExpiry = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 2);
  return d.toISOString().slice(0, 10);
};

const defaultDelivery = () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toISOString().slice(0, 10);
};

export function CreatePurchaseModal({
  open, onOpenChange, suppliers = [], medicines = [], onSubmit, isSubmitting
}) {
  const [activeSection, setActiveSection] = useState('details');
  const [supplierId, setSupplierId] = useState('');
  const [procurementMode, setProcurementMode] = useState('DRAFT');
  const [poDate, setPoDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expectedDelivery, setExpectedDelivery] = useState(defaultDelivery);
  const [referenceNo, setReferenceNo] = useState(() => `PO-REF-${Math.floor(100 + Math.random() * 900)}`);
  const [notes, setNotes] = useState('');
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const newItem = (medId = '') => {
    const med = medicines.find((m) => m.id === medId) || medicines[0];
    return {
      medicineId: med?.id || '',
      batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
      manufacturingDate: '',
      expiryDate: defaultExpiry(),
      orderedQuantity: 50,
      unitCost: med?.salePrice ? Math.round(med.salePrice * 0.7 * 100) / 100 : 10,
      unitSalePrice: med?.salePrice || 15
    };
  };

  const [items, setItems] = useState([newItem()]);

  const resetForm = () => {
    setActiveSection('details');
    setSupplierId('');
    setProcurementMode('DRAFT');
    setNotes('');
    setReferenceNo(`PO-REF-${Math.floor(100 + Math.random() * 900)}`);
    setPoDate(new Date().toISOString().slice(0, 10));
    setExpectedDelivery(defaultDelivery());
    setItems([newItem()]);
    setMedicineSearchTerm('');
    setShowSearchDropdown(false);
  };

  const handleAddItem = (medId = '') => {
    setItems((prev) => [...prev, { ...newItem(medId), batchNumber: `BATCH-${Date.now().toString().slice(-4)}-${prev.length + 1}` }]);
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
      if (field === 'medicineId') {
        const found = medicines.find((m) => m.id === value);
        if (found?.salePrice) {
          updated[index].unitSalePrice = found.salePrice;
          updated[index].unitCost = Math.round(found.salePrice * 0.7 * 100) / 100;
        }
      }
      return updated;
    });
  };

  const filteredMedicines = useMemo(() => {
    if (!medicineSearchTerm.trim()) return [];
    const term = medicineSearchTerm.toLowerCase();
    return medicines.filter((m) =>
      m.name?.toLowerCase().includes(term) ||
      m.genericName?.toLowerCase().includes(term)
    ).slice(0, 6);
  }, [medicineSearchTerm, medicines]);

  // Calculations
  const totalItemsCount = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + (parseInt(item.orderedQuantity, 10) || 0), 0);
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.orderedQuantity) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);
  const estimatedTax = subtotal * 0.12;
  const grandTotal = subtotal + estimatedTax;

  // Completion tracking
  const detailsComplete = supplierId && poDate;
  const itemsComplete = items.every((i) => i.medicineId && i.batchNumber?.trim() && i.expiryDate && parseFloat(i.orderedQuantity) > 0);

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
      if (!it.medicineId) { setActiveSection('items'); toast.error(`Please select a medicine for line item #${i + 1}`); return; }
      if (!it.batchNumber.trim()) { setActiveSection('items'); toast.error(`Please enter a batch lot number for line item #${i + 1}`); return; }
      if (!it.expiryDate) { setActiveSection('items'); toast.error(`Please set an expiry date for line item #${i + 1}`); return; }
      if (it.expiryDate <= todayStr) { setActiveSection('items'); toast.error(`Expiry date for line #${i + 1} must be in the future`); return; }
      if (parseFloat(it.orderedQuantity) <= 0) { setActiveSection('items'); toast.error(`Ordered quantity must be positive at line #${i + 1}`); return; }
      if (parseFloat(it.unitCost) < 0) { setActiveSection('items'); toast.error(`Unit cost cannot be negative at line #${i + 1}`); return; }
      if (parseFloat(it.unitSalePrice) < parseFloat(it.unitCost)) { setActiveSection('items'); toast.error(`Sale MRP must be >= purchase cost at line #${i + 1}`); return; }
    }

    const fullNotes = [
      notes.trim(),
      referenceNo ? `Ref: ${referenceNo.trim()}` : '',
      expectedDelivery ? `Expected: ${expectedDelivery}` : ''
    ].filter(Boolean).join(' • ');

    onSubmit({
      supplierId,
      notes: fullNotes,
      status: procurementMode,
      items: items.map((it) => ({
        medicineId: it.medicineId,
        batchNumber: it.batchNumber.trim().toUpperCase(),
        manufacturingDate: it.manufacturingDate || null,
        expiryDate: it.expiryDate,
        orderedQuantity: parseInt(it.orderedQuantity, 10),
        unitCost: parseFloat(it.unitCost),
        unitSalePrice: parseFloat(it.unitSalePrice)
      }))
    }, () => {
      resetForm();
      onOpenChange(false);
    });
  };

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-[1200px] w-[96vw] max-h-[94vh] p-0 gap-0 overflow-hidden bg-white border-slate-200 shadow-2xl rounded-2xl flex flex-col">

        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  New Purchase Order
                </h2>
                <Badge className={`font-medium px-2.5 py-0.5 text-xs rounded-md border ${
                  procurementMode === 'DRAFT'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {procurementMode === 'DRAFT' ? 'Draft' : 'Direct Inward'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedSupplier
                  ? `Ordering from ${selectedSupplier.name}`
                  : 'Procurement order for medicines & healthcare products'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { resetForm(); onOpenChange(false); }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">

            {/* LEFT NAV */}
            <aside className="w-56 border-r border-slate-100 bg-slate-50/60 shrink-0 hidden lg:flex flex-col">
              <div className="p-4 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                  Form Sections
                </p>
                {SECTIONS.map((section, idx) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  const isComplete =
                    (section.id === 'details' && detailsComplete) ||
                    (section.id === 'items' && itemsComplete);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-white shadow-sm text-blue-700 border border-slate-200'
                          : 'text-slate-600 hover:bg-white/60'
                      }`}
                    >
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md shrink-0 ${
                        isActive ? 'bg-blue-100 text-blue-600' :
                        isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isComplete && !isActive
                          ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${
                          isActive ? 'text-blue-700' : 'text-slate-700'
                        }`}>
                          {section.label}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{section.description}</p>
                      </div>
                      {isActive && <ChevronRight className="w-3 h-3 text-blue-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30">
              <div className="p-5 sm:p-6 max-w-full">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

                  {/* ---- LEFT COLUMN: FORM ---- */}
                  <div className="xl:col-span-8 space-y-5">

                    {/* SECTION: Order Details */}
                    {(activeSection === 'details' || activeSection === 'commercials') && (
                      <SectionCard
                        icon={Layers}
                        title="Order Details"
                        subtitle="Supplier relationship and dispatch dates"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField label="Supplier / Distributor" required>
                            <FormSelect
                              leadingIcon={Building2}
                              value={supplierId}
                              onChange={(e) => setSupplierId(e.target.value)}
                              required
                            >
                              <option value="">Select an active supplier…</option>
                              {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
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
                              <option value="RECEIVED">Direct Inward Receipt (Stock Now)</option>
                            </FormSelect>
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          <FormField label="PO Date" required>
                            <FormInput type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} required />
                          </FormField>
                          <FormField label="Expected Delivery">
                            <FormInput type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} />
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
                      </SectionCard>
                    )}

                    {/* SECTION: Medicines & Items */}
                    {(activeSection === 'items' || activeSection === 'details') && (
                      <SectionCard
                        icon={Package}
                        title="Medicines & Items"
                        subtitle={`${items.length} line item${items.length !== 1 ? 's' : ''} added`}
                        action={
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddItem()}
                            className="h-8 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Item
                          </Button>
                        }
                      >
                        {/* Search with dropdown */}
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Search medicine to add quickly…"
                            value={medicineSearchTerm}
                            onChange={(e) => { setMedicineSearchTerm(e.target.value); setShowSearchDropdown(true); }}
                            onFocus={() => setShowSearchDropdown(true)}
                            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                            className="w-full h-10 pl-10 pr-10 text-sm rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                          />
                          {medicineSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setMedicineSearchTerm('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {showSearchDropdown && filteredMedicines.length > 0 && (
                            <div className="absolute top-12 left-0 right-0 z-30 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto p-1.5">
                              {filteredMedicines.map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    handleAddItem(m.id);
                                    setMedicineSearchTerm('');
                                    setShowSearchDropdown(false);
                                  }}
                                  className="w-full text-left p-2.5 hover:bg-blue-50 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors group"
                                >
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-slate-800 truncate">{m.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{m.genericName}</p>
                                  </div>
                                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0 group-hover:bg-blue-100">
                                    + Add
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                          {showSearchDropdown && medicineSearchTerm && filteredMedicines.length === 0 && (
                            <div className="absolute top-12 left-0 right-0 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center">
                              <p className="text-sm text-slate-500">No medicines found for "{medicineSearchTerm}"</p>
                            </div>
                          )}
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                              <tr>
                                <th className="py-2.5 px-3 w-10 text-center">#</th>
                                <th className="py-2.5 px-3 min-w-[180px]">Medicine</th>
                                <th className="py-2.5 px-3 w-32">Batch</th>
                                <th className="py-2.5 px-3 w-24">Expiry</th>
                                <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                                <th className="py-2.5 px-3 w-24 text-right">Cost (₹)</th>
                                <th className="py-2.5 px-3 w-24 text-right">MRP (₹)</th>
                                <th className="py-2.5 px-3 w-24 text-right">Total</th>
                                <th className="py-2.5 px-3 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {items.map((item, idx) => {
                                const selectedMed = medicines.find((m) => m.id === item.medicineId);
                                const lineTotal = (parseFloat(item.orderedQuantity) || 0) * (parseFloat(item.unitCost) || 0);
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-2.5 px-3 font-mono text-slate-400 font-bold text-center text-xs">
                                      {idx + 1}
                                    </td>
                                    <td className="py-2 px-3">
                                      <select
                                        value={item.medicineId}
                                        onChange={(e) => handleItemChange(idx, 'medicineId', e.target.value)}
                                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                      >
                                        {medicines.map((m) => (
                                          <option key={m.id} value={m.id}>
                                            {m.name} ({m.dosageForm} • {m.packageUnit})
                                          </option>
                                        ))}
                                      </select>
                                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[170px]">
                                        {selectedMed?.genericName || 'Pharmaceutical salt'}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="text"
                                        value={item.batchNumber}
                                        onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 font-mono text-xs text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                        placeholder="LOT #"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="date"
                                        value={item.expiryDate}
                                        onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        min="1"
                                        value={item.orderedQuantity}
                                        onChange={(e) => handleItemChange(idx, 'orderedQuantity', e.target.value)}
                                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 font-mono text-xs text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unitCost}
                                        onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 font-mono text-xs text-right text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unitSalePrice}
                                        onChange={(e) => handleItemChange(idx, 'unitSalePrice', e.target.value)}
                                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 font-mono text-xs text-right text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900 whitespace-nowrap">
                                      {formatCurrency(lineTotal)}
                                    </td>
                                    <td className="py-2 px-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveItem(idx)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer rounded-md hover:bg-red-50"
                                        title="Remove line item"
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

                        <button
                          type="button"
                          onClick={() => handleAddItem()}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer pt-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add another line item</span>
                        </button>
                      </SectionCard>
                    )}

                    {/* SECTION: Notes & Shipping */}
                    {(activeSection === 'shipping' || activeSection === 'commercials') && (
                      <SectionCard
                        icon={FileText}
                        title="Notes & Shipping Instructions"
                        subtitle="Cold-chain, freight, or payment terms"
                      >
                        <FormField label="Special Procurement Remarks">
                          <textarea
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Keep refrigerated at 2°C – 8°C during transit. Deliver before 2 PM."
                            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none transition-all"
                          />
                        </FormField>
                      </SectionCard>
                    )}

                  </div>

                  {/* ---- RIGHT COLUMN: SUMMARY ---- */}
                  <div className="xl:col-span-4">
                    <div className="sticky top-0 space-y-4">

                      {/* Order Summary Card */}
                      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                          <Calculator className="w-4 h-4 text-blue-600 shrink-0" />
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                            Order Summary
                          </h4>
                        </div>

                        <div className="p-5 space-y-3">
                          <SummaryRow label="Total Items" value={`${totalItemsCount}`} />
                          <SummaryRow label="Total Quantity" value={`${totalQuantity} units`} />
                          <SummaryRow label="Sub Total" value={formatCurrency(subtotal)} />
                          <SummaryRow label="Est. GST (12%)" value={formatCurrency(estimatedTax)} />

                          <div className="pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between p-3.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Grand Total</p>
                                <p className="text-xs text-blue-600/70 mt-0.5">Incl. tax</p>
                              </div>
                              <p className="font-mono text-xl font-black text-blue-700">
                                {formatCurrency(grandTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress / Checklist Card */}
                      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Before you submit</h4>
                        </div>
                        <div className="p-4 space-y-2.5">
                          <ChecklistItem done={!!supplierId} label="Supplier selected" />
                          <ChecklistItem done={!!poDate} label="PO date set" />
                          <ChecklistItem done={itemsComplete} label="All line items valid" />
                          <ChecklistItem done={items.length > 0} label="At least one medicine" />
                        </div>
                      </div>

                      {/* Info callout */}
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                          <strong className="font-semibold">Heads up:</strong> Batch and expiry details are verified during Goods Receipt (GRN).
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="flex items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-100 bg-white shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>All data is securely saved as a draft until confirmed</span>
            </div>
            <div className="flex items-center gap-2.5 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-10 px-5 text-sm font-medium rounded-lg cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-6 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 cursor-pointer transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Purchase Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Small Sub-Components ---------- */

function SectionCard({ icon: Icon, title, subtitle, action, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={`${bold ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{label}</span>
      <span className={`font-mono ${bold ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}

function ChecklistItem({ done, label }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-5 w-5 items-center justify-center rounded-full shrink-0 transition-colors ${
        done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
      }`}>
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
      </div>
      <span className={`text-xs ${done ? 'text-slate-600' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}