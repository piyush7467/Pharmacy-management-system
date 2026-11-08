import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Layers,
  Calendar,
  DollarSign,
  PackageCheck,
  AlertCircle,
  Trash2,
  Building2,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '../../components/ui/table.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { formatDate, formatCurrency } from '../../lib/utils.js';

export function PurchasesView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [receiveModalPurchase, setReceiveModalPurchase] = useState(null);
  const [detailModalPurchase, setDetailModalPurchase] = useState(null);
  const [receiveQuantities, setReceiveQuantities] = useState({});

  // Form State for creating a Purchase Order
  const [formData, setFormData] = useState({
    supplierId: '',
    notes: '',
    status: 'DRAFT',
    items: [
      {
        medicineId: '',
        batchNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        orderedQuantity: 50,
        unitCost: 10,
        unitSalePrice: 15
      }
    ]
  });

  // Queries
  const { data: purchasesData, isLoading } = useQuery({
    queryKey: ['purchases', searchTerm, statusFilter],
    queryFn: async () => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/purchases', { params });
      return res.data;
    }
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-active'],
    queryFn: async () => {
      const res = await apiClient.get('/suppliers?isActive=true');
      return res.data?.suppliers || res.data || [];
    }
  });

  const { data: medicinesData } = useQuery({
    queryKey: ['medicines-active'],
    queryFn: async () => {
      const res = await apiClient.get('/medicines?isActive=true&limit=100');
      return res.data?.medicines || res.data || [];
    }
  });

  const purchases = purchasesData?.data || [];
  const suppliers = Array.isArray(suppliersData) ? suppliersData : suppliersData?.suppliers || [];
  const medicines = Array.isArray(medicinesData) ? medicinesData : medicinesData?.medicines || [];

  // Summary Metrics
  const totalPurchases = purchases.length;
  const receivedPurchases = purchases.filter((p) => p.status === 'RECEIVED').length;
  const draftPurchases = purchases.filter((p) => p.status === 'DRAFT').length;
  const totalSpend = purchases
    .filter((p) => p.status === 'RECEIVED')
    .reduce((sum, p) => sum + (p.grandTotal || 0), 0);

  // Mutations
  const createPurchaseMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/purchases', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.meta?.message || 'Purchase order created successfully');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create purchase order');
    }
  });

  const receivePurchaseMutation = useMutation({
    mutationFn: async ({ id, items }) => {
      const res = await apiClient.post(`/purchases/${id}/receive`, { items });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.meta?.message || 'Goods received into inventory');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      setReceiveModalPurchase(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to receive purchase goods');
    }
  });

  const cancelPurchaseMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.patch(`/purchases/${id}/cancel`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.meta?.message || 'Purchase order cancelled');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to cancel purchase order');
    }
  });

  const resetForm = () => {
    setFormData({
      supplierId: '',
      notes: '',
      status: 'DRAFT',
      items: [
        {
          medicineId: '',
          batchNumber: '',
          manufacturingDate: '',
          expiryDate: '',
          orderedQuantity: 50,
          unitCost: 10,
          unitSalePrice: 15
        }
      ]
    });
  };

  const handleAddItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          medicineId: '',
          batchNumber: '',
          manufacturingDate: '',
          expiryDate: '',
          orderedQuantity: 20,
          unitCost: 10,
          unitSalePrice: 15
        }
      ]
    }));
  };

  const handleRemoveItemRow = (index) => {
    if (formData.items.length === 1) {
      toast.error('Purchase must include at least one item');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      toast.error('Please select an authorized supplier');
      return;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.medicineId) {
        toast.error(`Please select a medication for line #${i + 1}`);
        return;
      }
      if (!item.batchNumber.trim()) {
        toast.error(`Batch number required for line #${i + 1}`);
        return;
      }
      if (!item.expiryDate) {
        toast.error(`Expiry date required for line #${i + 1}`);
        return;
      }
      if (new Date(item.expiryDate) <= new Date()) {
        toast.error(`Expiry date for line #${i + 1} must be in the future`);
        return;
      }
      if (Number(item.orderedQuantity) <= 0) {
        toast.error(`Ordered quantity must be > 0 at line #${i + 1}`);
        return;
      }
      if (Number(item.unitSalePrice) < Number(item.unitCost)) {
        toast.error(`Selling price cannot be lower than purchase cost at line #${i + 1}`);
        return;
      }
    }

    createPurchaseMutation.mutate({
      supplierId: formData.supplierId,
      notes: formData.notes,
      status: formData.status,
      items: formData.items.map((i) => ({
        ...i,
        orderedQuantity: parseInt(i.orderedQuantity, 10),
        unitCost: parseFloat(i.unitCost),
        unitSalePrice: parseFloat(i.unitSalePrice),
        manufacturingDate: i.manufacturingDate || null
      }))
    });
  };

  const openReceiveModal = (purchase) => {
    setReceiveModalPurchase(purchase);
    const initialQty = {};
    purchase.items?.forEach((item) => {
      initialQty[item.id] = item.orderedQuantity;
    });
    setReceiveQuantities(initialQty);
  };

  const handleConfirmReceipt = () => {
    if (!receiveModalPurchase) return;
    const payloadItems = receiveModalPurchase.items?.map((item) => ({
      purchaseItemId: item.id,
      receivedQuantity: parseInt(receiveQuantities[item.id] ?? item.orderedQuantity, 10)
    }));

    receivePurchaseMutation.mutate({
      id: receiveModalPurchase.id,
      items: payloadItems
    });
  };

  // Estimated Totals in Create Modal
  const calculatedSubtotal = formData.items.reduce((sum, item) => {
    const qty = Number(item.orderedQuantity) || 0;
    const cost = Number(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <Badge variant="default" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Received
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Draft / Pending
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="text-text-muted border-surface line-through">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Truck className="w-6 h-6 text-brand-primary" />
            Purchases & Goods Receiving
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Create supplier purchase orders and verify incoming batch intake into pharmacy inventory.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setCreateModalOpen(true);
          }}
          className="bg-brand-primary hover:bg-brand-secondary text-white shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Purchase Order
        </Button>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Purchase Orders</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{totalPurchases}</h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Goods Received</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{receivedPurchases}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <PackageCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Pending Drafts</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{draftPurchases}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Inward Spend</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(totalSpend)}</h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-surface-card border-surface">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search PO # or supplier name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface-bg border-surface text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-surface-bg border border-surface rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft / Pending</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card className="bg-surface-card border-surface">
        <CardHeader className="p-4 pb-2 border-b border-surface">
          <CardTitle className="text-base font-semibold text-text-primary flex items-center justify-between">
            <span>Purchase Orders Directory</span>
            <span className="text-xs font-normal text-text-muted">{purchases.length} record(s)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <p className="text-sm">Loading purchase records...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="py-16 text-center text-text-muted">
              <Truck className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
              <p className="font-medium text-text-primary">No purchase orders found</p>
              <p className="text-xs text-text-muted mt-1">Create your first purchase order to start stocking inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-surface hover:bg-transparent">
                    <TableHead className="text-xs font-semibold">PO Number</TableHead>
                    <TableHead className="text-xs font-semibold">Supplier</TableHead>
                    <TableHead className="text-xs font-semibold">Ordered Date</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Items</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Grand Total</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((po) => (
                    <TableRow key={po.id} className="border-surface hover:bg-surface-bg/50">
                      <TableCell className="font-mono font-medium text-xs text-brand-primary">
                        {po.purchaseNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm text-text-primary">{po.supplier?.name}</div>
                        {po.supplier?.phone && (
                          <div className="text-xs text-text-muted">{po.supplier.phone}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">
                        {formatDate(po.orderedDate || po.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-bg border border-surface text-text-secondary">
                          {po.itemsCount || 0} line(s)
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm text-text-primary">
                        {formatCurrency(po.grandTotal)}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(po.status)}</TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-text-muted hover:text-text-primary"
                            title="View PO Details"
                            onClick={async () => {
                              try {
                                const res = await apiClient.get(`/purchases/${po.id}`);
                                setDetailModalPurchase(res.data.data);
                              } catch (err) {
                                toast.error('Failed to load purchase details');
                              }
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {po.status === 'DRAFT' && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                                title="Receive Goods into Inventory"
                                onClick={async () => {
                                  try {
                                    const res = await apiClient.get(`/purchases/${po.id}`);
                                    openReceiveModal(res.data.data);
                                  } catch (err) {
                                    toast.error('Failed to fetch purchase details');
                                  }
                                }}
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                Receive
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                title="Cancel Purchase Order"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to cancel PO #${po.purchaseNumber}?`)) {
                                    cancelPurchaseMutation.mutate(po.id);
                                  }
                                }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE PURCHASE ORDER MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-4xl bg-surface-card border-surface max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-primary" />
              Create Purchase Order
            </DialogTitle>
            <DialogDescription className="text-sm text-text-muted">
              Specify supplier and item batches for inward stock procurement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-text-primary">
                  Authorized Supplier <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-surface-bg border border-surface rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  required
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.contactPerson ? `(${s.contactPerson})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-text-primary">Internal Notes / Delivery Terms</Label>
                <Input
                  placeholder="e.g. Standard 30-day invoice, refrigerated delivery"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-surface-bg border-surface text-sm"
                />
              </div>
            </div>

            {/* Line items section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-surface">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-primary" />
                  Order Items & Batch Details
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItemRow}
                  className="text-xs h-8 border-surface hover:bg-surface-bg"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Medicine Row
                </Button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-surface bg-surface-bg/40 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                        Line #{idx + 1}
                      </span>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="h-7 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1 md:col-span-1">
                        <Label className="text-[11px] font-medium text-text-muted">Medication *</Label>
                        <select
                          value={item.medicineId}
                          onChange={(e) => handleItemChange(idx, 'medicineId', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-surface-bg border border-surface rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                          required
                        >
                          <option value="">Select medication...</option>
                          {medicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.strength} - {m.dosageForm})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-text-muted">Batch / Lot # *</Label>
                        <Input
                          placeholder="e.g. BATCH-2026-X"
                          value={item.batchNumber}
                          onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                          className="h-8 text-xs bg-surface-bg border-surface font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-text-muted">Expiry Date *</Label>
                        <Input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                          className="h-8 text-xs bg-surface-bg border-surface"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-text-muted">Mfg Date (Opt)</Label>
                        <Input
                          type="date"
                          value={item.manufacturingDate}
                          onChange={(e) => handleItemChange(idx, 'manufacturingDate', e.target.value)}
                          className="h-8 text-xs bg-surface-bg border-surface"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-text-muted">Ordered Qty *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.orderedQuantity}
                          onChange={(e) => handleItemChange(idx, 'orderedQuantity', e.target.value)}
                          className="h-8 text-xs bg-surface-bg border-surface"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-text-muted">Unit Cost ($) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitCost}
                          onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                          className="h-8 text-xs bg-surface-bg border-surface"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-text-muted">Sale Price ($) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitSalePrice}
                          onChange={(e) => handleItemChange(idx, 'unitSalePrice', e.target.value)}
                          className="h-8 text-xs bg-surface-bg border-surface"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total summary bar */}
            <div className="p-4 rounded-xl border border-surface bg-surface-bg/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-text-muted">
                Line Items: <span className="font-semibold text-text-primary">{formData.items.length}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-text-muted text-xs">Estimated Subtotal: </span>
                  <span className="font-bold text-text-primary">{formatCurrency(calculatedSubtotal)}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="border-surface"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPurchaseMutation.isPending}
                className="bg-brand-primary hover:bg-brand-secondary text-white"
              >
                {createPurchaseMutation.isPending ? 'Submitting...' : 'Create Purchase Order'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* RECEIVE GOODS INSPECTION MODAL */}
      <Dialog open={!!receiveModalPurchase} onOpenChange={() => setReceiveModalPurchase(null)}>
        <DialogContent className="max-w-3xl bg-surface-card border-surface max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Goods Intake Inspection: {receiveModalPurchase?.purchaseNumber}
            </DialogTitle>
            <DialogDescription className="text-sm text-text-muted">
              Verify physical counts and batch seals before recording positive inventory movements.
            </DialogDescription>
          </DialogHeader>

          {receiveModalPurchase && (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl border border-surface bg-surface-bg/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-text-muted">Supplier: </span>
                  <span className="font-medium text-text-primary">{receiveModalPurchase.supplier?.name}</span>
                </div>
                <div>
                  <span className="text-text-muted">Ordered Date: </span>
                  <span className="font-medium text-text-primary">{formatDate(receiveModalPurchase.orderedDate)}</span>
                </div>
                <div>
                  <span className="text-text-muted">Grand Total: </span>
                  <span className="font-bold text-brand-primary">{formatCurrency(receiveModalPurchase.grandTotal)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-surface overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-surface hover:bg-transparent">
                      <TableHead className="text-xs font-semibold">Medication</TableHead>
                      <TableHead className="text-xs font-semibold">Batch #</TableHead>
                      <TableHead className="text-xs font-semibold">Expiry Date</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Ordered</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Received Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receiveModalPurchase.items?.map((item) => (
                      <TableRow key={item.id} className="border-surface">
                        <TableCell>
                          <div className="font-medium text-xs text-text-primary">{item.medicine?.name}</div>
                          <div className="text-[11px] text-text-muted font-mono">{item.medicine?.sku}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.batchNumber}</TableCell>
                        <TableCell className="text-xs text-text-muted">{formatDate(item.expiryDate)}</TableCell>
                        <TableCell className="text-center font-medium text-xs">{item.orderedQuantity}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            value={receiveQuantities[item.id] ?? item.orderedQuantity}
                            onChange={(e) =>
                              setReceiveQuantities({
                                ...receiveQuantities,
                                [item.id]: e.target.value
                              })
                            }
                            className="h-8 w-24 ml-auto text-xs text-right bg-surface-bg border-surface font-semibold"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p>
                  Confirming receipt will initialize active inventory batches in the database and append immutable
                  audit ledger records of type <span className="font-semibold">PURCHASE_RECEIPT</span>.
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReceiveModalPurchase(null)}
                  className="border-surface"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmReceipt}
                  disabled={receivePurchaseMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  {receivePurchaseMutation.isPending ? 'Processing...' : 'Confirm Goods Intake'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW PURCHASE ORDER DETAILS MODAL */}
      <Dialog open={!!detailModalPurchase} onOpenChange={() => setDetailModalPurchase(null)}>
        <DialogContent className="max-w-3xl bg-surface-card border-surface max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary flex items-center justify-between">
              <span>Purchase Order #{detailModalPurchase?.purchaseNumber}</span>
              {detailModalPurchase && getStatusBadge(detailModalPurchase.status)}
            </DialogTitle>
            <DialogDescription className="text-sm text-text-muted">
              Complete procurement manifest and batch distribution log.
            </DialogDescription>
          </DialogHeader>

          {detailModalPurchase && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-surface bg-surface-bg/40 text-xs">
                <div>
                  <span className="text-text-muted block">Supplier</span>
                  <span className="font-semibold text-text-primary">{detailModalPurchase.supplier?.name}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Order Placed</span>
                  <span className="font-semibold text-text-primary">{formatDate(detailModalPurchase.orderedDate)}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Intake Recorded</span>
                  <span className="font-semibold text-text-primary">
                    {detailModalPurchase.receivedDate ? formatDate(detailModalPurchase.receivedDate) : 'Pending Receipt'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Received Officer</span>
                  <span className="font-semibold text-text-primary">
                    {detailModalPurchase.receivedByUser?.fullName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Subtotal</span>
                  <span className="font-semibold text-text-primary">{formatCurrency(detailModalPurchase.subtotal)}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Grand Total</span>
                  <span className="font-bold text-brand-primary">{formatCurrency(detailModalPurchase.grandTotal)}</span>
                </div>
              </div>

              {detailModalPurchase.notes && (
                <div className="p-3 rounded-lg border border-surface bg-surface-bg/30 text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">Notes: </span>
                  {detailModalPurchase.notes}
                </div>
              )}

              <div className="rounded-xl border border-surface overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-surface hover:bg-transparent">
                      <TableHead className="text-xs font-semibold">Medication</TableHead>
                      <TableHead className="text-xs font-semibold">Batch #</TableHead>
                      <TableHead className="text-xs font-semibold">Expiry Date</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Ordered</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Received</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Cost</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Selling</TableHead>
                      <TableHead className="text-xs font-semibold text-right pr-4">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailModalPurchase.items?.map((item) => (
                      <TableRow key={item.id} className="border-surface">
                        <TableCell>
                          <div className="font-medium text-xs text-text-primary">{item.medicine?.name}</div>
                          <div className="text-[11px] text-text-muted">{item.medicine?.strength}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.batchNumber}</TableCell>
                        <TableCell className="text-xs text-text-muted">{formatDate(item.expiryDate)}</TableCell>
                        <TableCell className="text-center text-xs">{item.orderedQuantity}</TableCell>
                        <TableCell className="text-center text-xs font-semibold text-brand-primary">
                          {item.receivedQuantity}
                        </TableCell>
                        <TableCell className="text-right text-xs">{formatCurrency(item.unitCost)}</TableCell>
                        <TableCell className="text-right text-xs text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.unitSalePrice)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-semibold pr-4">
                          {formatCurrency(item.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDetailModalPurchase(null)}
                  className="border-surface"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
