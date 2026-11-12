import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Edit2,
  Upload,
  Percent,
  Boxes,
  Receipt,
  FileSpreadsheet,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  FileCheck
} from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { formatCurrency } from '../../lib/utils.js';
import { toast } from 'sonner';
import { MedicineSearchAutocomplete } from './components/MedicineSearchAutocomplete.jsx';
import { SupplierSearchCombobox } from './components/SupplierSearchCombobox.jsx';

export function CreatePurchaseView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Progressive Step State: 1 = Supplier Details, 2 = Medicines & Commercials
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [draftSavedTime, setDraftSavedTime] = useState('just now');

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [procurementMode, setProcurementMode] = useState('RECEIVED'); // 'RECEIVED' (Direct Inward) | 'DRAFT' (Pending Delivery)
  const [poDate, setPoDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expectedDelivery, setExpectedDelivery] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  });
  const [referenceNo, setReferenceNo] = useState(() => `PO-REF-${Math.floor(100 + Math.random() * 900)}`);
  const [notes, setNotes] = useState('');
  const [quickAddSelectedMed, setQuickAddSelectedMed] = useState(null);

  // Line items state
  const [items, setItems] = useState([
    {
      medicineId: '',
      medicineObj: null,
      batchNumber: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      manufacturingDate: '',
      expiryDate: (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 2);
        return d.toISOString().slice(0, 10);
      })(),
      orderedQuantity: 50,
      unitCost: 8.0,
      unitSalePrice: 12.5
    }
  ]);

  // Queries
  const { data: suppliersData, isLoading: loadingSuppliers } = useQuery({
    queryKey: ['suppliers-active'],
    queryFn: async () => {
      const res = await apiClient.get('/suppliers?isActive=true&limit=100');
      return res.data?.suppliers || res.data || res || [];
    }
  });

  const suppliers = Array.isArray(suppliersData)
    ? suppliersData
    : (suppliersData?.suppliers || suppliersData?.data || []);

  // Fetch initial top medicine catalog
  const { data: initialMedsData } = useQuery({
    queryKey: ['medicines-initial-top'],
    queryFn: async () => {
      const res = await apiClient.get('/medicines?isActive=true&limit=10');
      return res.data?.medicines || res.data || [];
    }
  });

  const initialMeds = Array.isArray(initialMedsData)
    ? initialMedsData
    : (initialMedsData?.medicines || initialMedsData?.data || []);

  // Populate first item with a medicine when catalog loads if unassigned
  useEffect(() => {
    if (initialMeds.length > 0 && items.length === 1 && !items[0].medicineId) {
      const first = initialMeds[0];
      setItems([
        {
          ...items[0],
          medicineId: first.id,
          medicineObj: first,
          unitSalePrice: first.salePrice || 12.5,
          unitCost: first.salePrice ? Math.round(first.salePrice * 0.65 * 100) / 100 : 8.0
        }
      ]);
    }
  }, [initialMeds]);

  // Create PO Mutation
  const createPurchaseMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/purchases', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.meta?.message || 'Purchase order created successfully!');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-overview'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
      navigate('/purchases');
    },
    onError: (err) => {
      toast.error(err?.message || err?.response?.data?.message || 'Failed to create purchase order');
    }
  });

  // Regenerate PO Reference Code
  const handleRegenerateRef = () => {
    setReferenceNo(`PO-REF-${Math.floor(100 + Math.random() * 900)}`);
  };

  // Add Item to table
  const handleAddItem = (medicine = null) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);

    const cost = medicine?.batches?.[0]?.purchaseCost || (medicine?.salePrice ? Math.round(medicine.salePrice * 0.65 * 100) / 100 : 10.0);
    const price = medicine?.batches?.[0]?.salePrice || medicine?.salePrice || 15.0;

    const newItem = {
      medicineId: medicine?.id || '',
      medicineObj: medicine || null,
      batchNumber: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      manufacturingDate: '',
      expiryDate: d.toISOString().slice(0, 10),
      orderedQuantity: 20,
      unitCost: cost,
      unitSalePrice: price
    };

    setItems((prev) => [...prev, newItem]);
    setDraftSavedTime('just now');
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      toast.warning('A purchase order must include at least one medicine item');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
    if (expandedRowIndex === index) {
      setExpandedRowIndex(null);
    } else if (expandedRowIndex > index) {
      setExpandedRowIndex(expandedRowIndex - 1);
    }
    setDraftSavedTime('just now');
  };

  // Change Field on item
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setDraftSavedTime('just now');
  };

  // Change Medicine on an existing item row
  const handleMedicineSelect = (index, medicine) => {
    setItems((prev) => {
      const updated = [...prev];
      if (!medicine) {
        updated[index] = {
          ...updated[index],
          medicineId: '',
          medicineObj: null
        };
      } else {
        const cost = medicine?.batches?.[0]?.purchaseCost || (medicine.salePrice ? Math.round(medicine.salePrice * 0.65 * 100) / 100 : updated[index].unitCost);
        const price = medicine?.batches?.[0]?.salePrice || medicine.salePrice || updated[index].unitSalePrice;

        updated[index] = {
          ...updated[index],
          medicineId: medicine.id,
          medicineObj: medicine,
          unitSalePrice: price,
          unitCost: cost
        };
      }
      return updated;
    });
    setDraftSavedTime('just now');
  };

  // Toggle Row Expansion
  const toggleRowExpansion = (index) => {
    setExpandedRowIndex((prev) => (prev === index ? null : index));
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

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  // Validate Step 1 Before Moving to Step 2
  const handleProceedToStep2 = () => {
    if (!supplierId) {
      toast.error('Please select a supplier / distributor to proceed');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form Submit
  const handleSubmit = (e, overrideStatus = null) => {
    e?.preventDefault();

    if (!supplierId) {
      toast.error('Please select a supplier / distributor');
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.medicineId) {
        toast.error(`Please select a medicine formulation for item #${i + 1}`);
        setCurrentStep(2);
        return;
      }
      if (!it.batchNumber?.trim()) {
        toast.error(`Please enter a batch/lot number for item #${i + 1}`);
        setCurrentStep(2);
        return;
      }
      if (!it.expiryDate) {
        toast.error(`Please set an expiry date for item #${i + 1}`);
        setExpandedRowIndex(i);
        setCurrentStep(2);
        return;
      }
      if (it.expiryDate <= todayStr) {
        toast.error(`Expiry date for line #${i + 1} must be in the future`);
        setExpandedRowIndex(i);
        setCurrentStep(2);
        return;
      }
      if (parseFloat(it.orderedQuantity) <= 0) {
        toast.error(`Ordered quantity must be greater than 0 for item #${i + 1}`);
        setCurrentStep(2);
        return;
      }
      if (parseFloat(it.unitCost) < 0) {
        toast.error(`Unit cost cannot be negative for item #${i + 1}`);
        setCurrentStep(2);
        return;
      }
      if (parseFloat(it.unitSalePrice) < parseFloat(it.unitCost)) {
        toast.error(`Sale MRP must be greater than or equal to purchase cost for item #${i + 1}`);
        setCurrentStep(2);
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
      status: overrideStatus || procurementMode,
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

    createPurchaseMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28">
      {/* 1. Breadcrumbs */}
      <div>
        <Link
          to="/purchases"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors py-1 px-2 -ml-2 rounded-md hover:bg-surface-card"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-text-muted" />
          <span>Back to Purchases</span>
        </Link>
      </div>

      {/* 2. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Create Purchase Order
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {currentStep === 1
              ? 'Step 1 of 2: Select distributor vendor, procurement model, and order timeline.'
              : 'Step 2 of 2: Search catalog formulations, set batch lots, quantities, and verify pricing.'}
          </p>
        </div>

        {/* Status Badge top right */}
        <div>
          <Badge
            variant="outline"
            className={
              procurementMode === 'RECEIVED'
                ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/30 px-3 py-1 font-semibold text-xs flex items-center gap-1.5'
                : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/30 px-3 py-1 font-semibold text-xs flex items-center gap-1.5'
            }
          >
            <Package className="h-3.5 w-3.5" />
            {procurementMode === 'RECEIVED' ? 'Direct Inward Stock' : 'Draft PO (GRN Required)'}
          </Badge>
        </div>
      </div>

      {/* 3. Progressive 2-Step Interactive Wizard Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        {/* Step 1 Pill */}
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
            currentStep === 1
              ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-xs'
              : selectedSupplier
              ? 'bg-surface-card border-emerald-500/20 hover:border-emerald-500/40 text-text-muted'
              : 'bg-surface-card border-surface text-text-muted hover:border-surface-active'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs shrink-0 ${
              selectedSupplier && currentStep !== 1
                ? 'bg-emerald-700 text-white'
                : currentStep === 1
                ? 'bg-emerald-700 text-white'
                : 'bg-surface text-text-muted'
            }`}
          >
            {selectedSupplier && currentStep !== 1 ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <span>1. Supplier & Procurement</span>
              {selectedSupplier && (
                <span className="text-[10px] text-emerald-700 font-semibold">(Selected)</span>
              )}
            </div>
            <div className="text-[11px] text-text-muted truncate mt-0.5">
              {selectedSupplier ? selectedSupplier.name : 'Vendor, timeline & instructions'}
            </div>
          </div>
        </button>

        {/* Step 2 Pill */}
        <button
          type="button"
          onClick={() => {
            if (!supplierId) {
              toast.info('Please select a supplier first before moving to medicines');
              return;
            }
            setCurrentStep(2);
          }}
          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
            currentStep === 2
              ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-xs'
              : 'bg-surface-card border-surface text-text-muted hover:border-surface-active'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs shrink-0 ${
              currentStep === 2
                ? 'bg-emerald-700 text-white'
                : 'bg-surface text-text-muted'
            }`}
          >
            2
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <span>2. Medicines & Line Items</span>
              <span className="text-[10px] font-semibold text-emerald-700">({items.length} items)</span>
            </div>
            <div className="text-[11px] text-text-muted truncate mt-0.5">
              Catalogue search, batches & pricing
            </div>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: SUPPLIER DETAILS & PROCUREMENT CONTEXT                             */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (8 cols): Supplier Form */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Vendor Selection with Elevated Z-Index Protection */}
            <div className="relative z-30 rounded-2xl border border-surface bg-surface-card p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-surface">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">
                    Pharmaceutical Supplier / Distributor
                  </h2>
                  <p className="text-xs text-text-muted">
                    Search authorized wholesale distributor or pharmaceutical manufacturer.
                  </p>
                </div>
              </div>

              {/* Supplier Search Combobox */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary flex items-center gap-1">
                  Supplier / Distributor Name <span className="text-red-500">*</span>
                </label>
                <SupplierSearchCombobox
                  suppliers={suppliers}
                  selectedSupplierId={supplierId}
                  onSelect={(id) => setSupplierId(id)}
                  placeholder="Type distributor company name, representative, GSTIN, or phone..."
                />
              </div>

              {/* Selected Supplier Highlight Card */}
              {selectedSupplier ? (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">{selectedSupplier.name}</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-800 border-emerald-500/20">
                        Active Vendor
                      </Badge>
                    </div>
                    {selectedSupplier.taxNumber && (
                      <span className="text-xs font-mono text-text-muted font-semibold">
                        GSTIN: {selectedSupplier.taxNumber}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{selectedSupplier.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="truncate">{selectedSupplier.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="truncate">{selectedSupplier.address || 'Standard Warehouse'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-surface bg-surface/30 text-xs text-text-muted text-center">
                  Search and select a vendor above to preview contact details, GST credentials, and warehouse location.
                </div>
              )}
            </div>

            {/* Card 2: Procurement Strategy & Timeline */}
            <div className="relative z-10 rounded-2xl border border-surface bg-surface-card p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-surface">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">
                    Procurement Strategy & Timeline
                  </h2>
                  <p className="text-xs text-text-muted">
                    Determine whether goods enter active stock immediately or require GRN receipt.
                  </p>
                </div>
              </div>

              {/* Procurement Mode Radio Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setProcurementMode('RECEIVED')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    procurementMode === 'RECEIVED'
                      ? 'border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20 shadow-xs'
                      : 'border-surface bg-surface-card hover:border-surface-active'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-text-primary">Direct Inward Receipt</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800">
                      Immediate Stock
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Stock enters active batches immediately upon creation. Ideal for already received local parcels.
                  </p>
                </div>

                <div
                  onClick={() => setProcurementMode('DRAFT')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    procurementMode === 'DRAFT'
                      ? 'border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20 shadow-xs'
                      : 'border-surface bg-surface-card hover:border-surface-active'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-text-primary">Pending Delivery (Draft PO)</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800">
                      GRN Required
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Generates a draft purchase order. Quantities, lots, and certificates are verified upon delivery via GRN.
                  </p>
                </div>
              </div>

              {/* Timeline Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary flex items-center gap-1">
                    PO Order Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 h-4 w-4 text-text-muted pointer-events-none" />
                    <input
                      type="date"
                      value={poDate}
                      onChange={(e) => setPoDate(e.target.value)}
                      className="w-full h-10 rounded-lg border border-surface bg-surface-card pl-9 pr-3 text-xs font-medium text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    Expected Delivery Date
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 h-4 w-4 text-text-muted pointer-events-none" />
                    <input
                      type="date"
                      value={expectedDelivery}
                      onChange={(e) => setExpectedDelivery(e.target.value)}
                      className="w-full h-10 rounded-lg border border-surface bg-surface-card pl-9 pr-3 text-xs font-medium text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    Reference Code
                  </label>
                  <div className="relative flex items-center">
                    <FileText className="absolute left-3 h-4 w-4 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      placeholder="e.g. PO-REF-368"
                      className="w-full h-10 rounded-lg border border-surface bg-surface-card pl-9 pr-9 text-xs font-mono font-medium text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateRef}
                      title="Generate new reference code"
                      className="absolute right-2.5 text-text-muted hover:text-text-primary p-1 rounded transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Instructions */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-text-primary">
                  Delivery Instructions & Special Requirements
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cold-chain storage (2°C - 8°C); require batch quality analysis reports; delivery between 9 AM and 4 PM..."
                  rows={3}
                  className="w-full rounded-xl border border-surface bg-surface-card px-3.5 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-muted/60 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all resize-y"
                />
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Step 1 Summary Card */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-surface bg-surface-card p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-surface">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <Calculator className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Order Overview
                </h3>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-text-muted">
                  <span>Selected Vendor</span>
                  <span className="font-semibold text-text-primary truncate max-w-[170px]">
                    {selectedSupplier ? selectedSupplier.name : 'Not selected yet'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>Mode</span>
                  <span className="font-semibold text-text-primary">
                    {procurementMode === 'RECEIVED' ? 'Direct Inward' : 'Draft PO'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>Target Delivery</span>
                  <span className="font-semibold text-text-primary">{expectedDelivery || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>Current Line Items</span>
                  <span className="font-semibold text-text-primary">{items.length} items configured</span>
                </div>
              </div>

              <div className="pt-3 border-t border-surface space-y-3">
                <Button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Proceed to Medicines & Items</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/purchases')}
                  className="w-full h-10 border-surface hover:bg-surface text-text-muted text-xs font-semibold"
                >
                  Discard & Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: MEDICINES & LINE ITEMS REGISTER                                    */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Vendor Snapshot Banner with Quick Switch */}
          <div className="p-4 rounded-2xl border border-surface bg-surface-card shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <span>Supplier: {selectedSupplier?.name || 'Selected Vendor'}</span>
                  {selectedSupplier?.phone && (
                    <span className="text-[11px] font-normal text-text-muted">({selectedSupplier.phone})</span>
                  )}
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  Ref: <span className="font-mono">{referenceNo}</span> • Mode:{' '}
                  {procurementMode === 'RECEIVED' ? 'Direct Inward Stock' : 'Draft PO'}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(1)}
              className="text-xs border-surface hover:bg-surface text-text-muted gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Edit2 className="h-3 w-3" />
              Edit Supplier Details
            </Button>
          </div>

          {/* Dedicated Medicine Search & Add Bar (Z-Index Protected) */}
          <div className="relative z-40 rounded-2xl border border-surface bg-surface-card p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">
                    Search & Add Medicines from Catalogue
                  </h2>
                  <p className="text-xs text-text-muted">
                    Scalable autocomplete: type trade name, generic salt molecule, strength, or SKU.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddItem()}
                  className="h-8 text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Blank Row
                </Button>
              </div>
            </div>

            {/* Prominent Autocomplete Bar */}
            <div className="relative z-50">
              <MedicineSearchAutocomplete
                selectedMedicine={quickAddSelectedMed}
                onSelect={(med) => {
                  if (med) {
                    handleAddItem(med);
                    toast.success(`Added ${med.name} (${med.strength || med.dosageForm}) to order`);
                  }
                }}
                placeholder="Search medicine to add (e.g. Paracetamol 650, Allegra 120, Azithromycin, MED-1002)..."
                isCompact={false}
              />
            </div>
          </div>

          {/* Line Items Table & Responsive Mobile Cards */}
          <div className="relative z-20 rounded-2xl border border-surface bg-surface-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-700" />
                <h3 className="text-base font-bold text-text-primary">
                  Line Items in Order ({items.length})
                </h3>
              </div>
              <span className="text-xs text-text-muted">
                {totalQuantity} total units • Subtotal: {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-surface">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface/60 text-text-muted uppercase text-[11px] font-semibold tracking-wider border-b border-surface">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3 min-w-[240px]">Medicine / Formulation *</th>
                    <th className="py-3 px-3 w-32">Batch Lot *</th>
                    <th className="py-3 px-3 w-28 text-center">Qty *</th>
                    <th className="py-3 px-3 w-28 text-right">Cost Price (₹)</th>
                    <th className="py-3 px-3 w-28 text-right">MRP (₹)</th>
                    <th className="py-3 px-3 w-28 text-right font-bold">Line Total (₹)</th>
                    <th className="py-3 px-2 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface bg-surface-card">
                  {items.map((item, index) => {
                    const lineTotal = (parseFloat(item.orderedQuantity) || 0) * (parseFloat(item.unitCost) || 0);
                    const isExpanded = expandedRowIndex === index;

                    return (
                      <React.Fragment key={index}>
                        <tr className="hover:bg-surface/20 transition-colors">
                          <td className="py-3 px-3 text-center text-text-muted font-medium">
                            {index + 1}
                          </td>

                          {/* Medicine Autocomplete or Label */}
                          <td className="py-3 px-3">
                            <MedicineSearchAutocomplete
                              selectedMedicine={item.medicineObj}
                              onSelect={(med) => handleMedicineSelect(index, med)}
                              placeholder="Search medicine formulation..."
                              isCompact
                            />
                          </td>

                          {/* Batch Lot input */}
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={item.batchNumber}
                              onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                              placeholder="BATCH-LOT"
                              className="h-9 w-full rounded-lg border border-surface bg-surface-card px-2.5 text-xs font-mono uppercase text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            />
                          </td>

                          {/* Quantity input with stepper buttons */}
                          <td className="py-3 px-3">
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                min="1"
                                value={item.orderedQuantity}
                                onChange={(e) => handleItemChange(index, 'orderedQuantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                                className="h-9 w-full rounded-lg border border-surface bg-surface-card pl-2 pr-6 text-xs font-semibold text-center text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <div className="absolute right-1 flex flex-col items-center justify-center -space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleItemChange(index, 'orderedQuantity', (parseInt(item.orderedQuantity, 10) || 0) + 1)}
                                  className="p-0.5 text-text-muted hover:text-text-primary transition-colors"
                                  title="Increase quantity"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleItemChange(index, 'orderedQuantity', Math.max(1, (parseInt(item.orderedQuantity, 10) || 0) - 1))}
                                  className="p-0.5 text-text-muted hover:text-text-primary transition-colors"
                                  title="Decrease quantity"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Cost Price */}
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitCost}
                              onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                              className="h-9 w-full rounded-lg border border-surface bg-surface-card px-2.5 text-xs text-right font-medium text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            />
                          </td>

                          {/* MRP */}
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitSalePrice}
                              onChange={(e) => handleItemChange(index, 'unitSalePrice', e.target.value)}
                              className="h-9 w-full rounded-lg border border-surface bg-surface-card px-2.5 text-xs text-right font-medium text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            />
                          </td>

                          {/* Line Total */}
                          <td className="py-3 px-3 text-right font-bold text-text-primary text-xs">
                            {lineTotal.toFixed(2)}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => toggleRowExpansion(index)}
                                className={`p-1.5 rounded-md transition-colors ${
                                  isExpanded
                                    ? 'bg-emerald-500/15 text-emerald-700'
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface'
                                }`}
                                title="Expand line item details (Expiry, Mfg Date, Packaging)"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                disabled={items.length === 1}
                                className="p-1.5 rounded-md text-text-muted hover:text-red-600 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                title="Remove line item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Details Sub-Drawer */}
                        {isExpanded && (
                          <tr className="bg-emerald-500/5 border-t border-b border-emerald-500/20">
                            <td colSpan={8} className="p-4">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                                <div>
                                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                                    Manufacturing Date
                                  </label>
                                  <input
                                    type="date"
                                    value={item.manufacturingDate || ''}
                                    onChange={(e) => handleItemChange(index, 'manufacturingDate', e.target.value)}
                                    className="h-8 w-full rounded-md border border-surface bg-surface-card px-2 text-xs text-text-primary focus:border-brand-primary"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                                    Expiry Date <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="date"
                                    value={item.expiryDate}
                                    onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                                    className="h-8 w-full rounded-md border border-surface bg-surface-card px-2 text-xs text-text-primary focus:border-brand-primary"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                                    Packaging & Dosage Form
                                  </label>
                                  <div className="text-xs text-text-primary font-medium py-1">
                                    {item.medicineObj?.packageUnit || 'Standard Strip'} • {item.medicineObj?.dosageForm || 'Tablet'}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                                    Estimated Margin
                                  </label>
                                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 py-1">
                                    {item.unitSalePrice > 0
                                      ? `${(((item.unitSalePrice - item.unitCost) / item.unitSalePrice) * 100).toFixed(1)}%`
                                      : '0.0%'}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View (< 768px, Zero Horizontal Scroll) */}
            <div className="md:hidden space-y-4">
              {items.map((item, index) => {
                const lineTotal = (parseFloat(item.orderedQuantity) || 0) * (parseFloat(item.unitCost) || 0);
                return (
                  <div key={index} className="p-4 rounded-xl border border-surface bg-surface/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-surface">
                      <span className="text-xs font-bold text-text-primary">Item #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="text-red-600 p-1 rounded hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-text-muted">Medicine Formulation</label>
                      <MedicineSearchAutocomplete
                        selectedMedicine={item.medicineObj}
                        onSelect={(med) => handleMedicineSelect(index, med)}
                        placeholder="Search formulation..."
                        isCompact
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-text-muted">Batch Lot</label>
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                          className="h-8 w-full rounded border border-surface bg-surface-card px-2 text-xs font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-text-muted">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.orderedQuantity}
                          onChange={(e) => handleItemChange(index, 'orderedQuantity', parseInt(e.target.value, 10) || 1)}
                          className="h-8 w-full rounded border border-surface bg-surface-card px-2 text-xs text-center font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-text-muted">Cost (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                          className="h-8 w-full rounded border border-surface bg-surface-card px-2 text-xs text-right font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-text-muted">MRP (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitSalePrice}
                          onChange={(e) => handleItemChange(index, 'unitSalePrice', e.target.value)}
                          className="h-8 w-full rounded border border-surface bg-surface-card px-2 text-xs text-right font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-text-muted">Line Total</label>
                        <div className="h-8 flex items-center justify-end font-bold text-xs text-emerald-700">
                          ₹{lineTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-surface/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-text-muted">Expiry Date</label>
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                          className="h-8 w-full rounded border border-surface bg-surface-card px-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted">Margin</label>
                        <div className="h-8 flex items-center font-bold text-xs text-emerald-700">
                          {item.unitSalePrice > 0
                            ? `${(((item.unitSalePrice - item.unitCost) / item.unitSalePrice) * 100).toFixed(1)}%`
                            : '0.0%'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2 Order Summary Bar */}
          <div className="p-6 rounded-2xl border border-surface bg-surface-card shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-surface">
              <Calculator className="h-4 w-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-text-primary">Order Financial Breakdown</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-surface/40 border border-surface">
                <span className="text-text-muted block text-[11px]">Total Line Items</span>
                <span className="text-base font-bold text-text-primary">{totalItemsCount} formulations</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/40 border border-surface">
                <span className="text-text-muted block text-[11px]">Total Units Ordered</span>
                <span className="text-base font-bold text-text-primary">{totalQuantity} units</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/40 border border-surface">
                <span className="text-text-muted block text-[11px]">Subtotal Before Tax</span>
                <span className="text-base font-bold text-text-primary">{formatCurrency(subtotal)}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-800 dark:text-emerald-300 block text-[11px] font-semibold">Grand Total (Inc. 12% GST)</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FIXED / STICKY BOTTOM ACTION BAR (Z-INDEX LAYERED)                     */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-surface px-6 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Auto-save status */}
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Draft saved {draftSavedTime} • {items.length} items configured</span>
          </div>

          {/* Right: Context-Aware Stepper Buttons */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {currentStep === 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/purchases')}
                  className="h-10 px-4 text-xs font-semibold border-surface hover:bg-surface text-text-muted"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="h-10 px-5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm gap-2"
                >
                  <span>Next: Add Medicines (Step 2)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="h-10 px-4 text-xs font-semibold border-surface hover:bg-surface text-text-primary gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Step 1</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => handleSubmit(e, 'DRAFT')}
                  disabled={createPurchaseMutation.isPending}
                  className="h-10 px-4 text-xs font-semibold border-surface hover:bg-surface text-text-primary gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Save as Draft
                </Button>

                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e)}
                  disabled={createPurchaseMutation.isPending}
                  className="h-10 px-5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm gap-2"
                >
                  {createPurchaseMutation.isPending ? 'Processing...' : (
                    <>
                      <span>Create Purchase Order</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
