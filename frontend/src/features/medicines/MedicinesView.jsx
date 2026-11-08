import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Pill,
  Plus,
  Search,
  AlertTriangle,
  Boxes,
  Layers,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Eye
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

const DOSAGE_FORMS = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Cream / Ointment',
  'Drops',
  'Inhaler',
  'Chewable Tablet'
];

export function MedicinesView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [batchModalMedicine, setBatchModalMedicine] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    categoryId: '',
    sku: '',
    dosageForm: 'Tablet',
    strength: '',
    packageUnit: 'Strip of 10',
    minReorderLevel: 20,
    defaultTaxRate: 12.0,
    isActive: true
  });

  // Fetch Categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['categoriesList'],
    queryFn: async () => {
      const res = await apiClient.get('/categories?limit=100');
      return res.data;
    }
  });

  // Fetch Medicines
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['medicines', { search: searchTerm, categoryId: categoryFilter, lowStockOnly: lowStockFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('categoryId', categoryFilter);
      if (lowStockFilter) params.append('lowStockOnly', 'true');
      const res = await apiClient.get(`/medicines?${params.toString()}`);
      return res.data;
    }
  });

  // Save / Update Mutation
  const saveMutation = useMutation({
    mutationFn: (medData) => {
      if (editingMedicine) {
        return apiClient.patch(`/medicines/${editingMedicine.id}`, medData);
      }
      return apiClient.post('/medicines', medData);
    },
    onSuccess: (res) => {
      toast.success(editingMedicine ? 'Medicine updated' : 'Medicine registered', {
        description: `"${res.data?.medicine?.name}" catalogue record saved.`
      });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      handleCloseModal();
    },
    onError: (err) => {
      toast.error('Failed to save medicine', {
        description: err.message || 'Please check for duplicate SKU barcode.'
      });
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/medicines/${id}`),
    onSuccess: () => {
      toast.success('Medicine removed');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
    onError: (err) => {
      toast.error('Cannot delete medicine', {
        description: err.message || 'Historical transactions or batches depend on this record.'
      });
    }
  });

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      genericName: '',
      categoryId: categories[0]?.id || '',
      sku: '',
      dosageForm: 'Tablet',
      strength: '',
      packageUnit: 'Strip of 10',
      minReorderLevel: 20,
      defaultTaxRate: 12.0,
      isActive: true
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMedicine(med);
    setFormData({
      name: med.name,
      genericName: med.genericName,
      categoryId: med.category?.id || '',
      sku: med.sku,
      dosageForm: med.dosageForm,
      strength: med.strength,
      packageUnit: med.packageUnit,
      minReorderLevel: med.minReorderLevel,
      defaultTaxRate: med.defaultTaxRate,
      isActive: med.isActive
    });
    setAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setEditingMedicine(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Category required', { description: 'Please select a therapeutic category.' });
      return;
    }
    saveMutation.mutate(formData);
  };

  const medicines = data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Medicine Catalogue</h1>
            <Badge variant="outline">{medicines.length} Products</Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Pharmaceutical directory with live batch stock valuation, dosage specifications, and reorder alerts.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="default">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Medicine
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Search brand name, generic composition, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-lg border border-surface bg-surface-card px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setLowStockFilter(!lowStockFilter)}
                className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  lowStockFilter
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'border-surface bg-surface-card text-text-muted hover:text-text-primary'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Low Stock Only
              </button>

              <Button onClick={() => refetch()} variant="outline" size="icon" title="Refresh">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicines Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-text-muted gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              Loading catalogue and calculating batch availability...
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-xs text-red-600">
              Failed to load catalogue: {error?.message}
            </div>
          ) : medicines.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-muted flex flex-col items-center gap-2">
              <Pill className="w-8 h-8 opacity-40" />
              <span>No medicines match the selected filter.</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine & Composition</TableHead>
                  <TableHead>SKU / Barcode</TableHead>
                  <TableHead>Dosage & Strength</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Available Stock</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary">{med.name}</span>
                        <span className="text-[11px] text-text-muted italic">{med.genericName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-surface-muted text-text-primary">
                        {med.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-[11px]">
                        <span className="font-medium text-text-primary">
                          {med.dosageForm} • {med.strength}
                        </span>
                        <span className="text-text-muted">{med.packageUnit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{med.category?.name || 'Unassigned'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-text-primary">
                            {med.totalAvailableStock} units
                          </span>
                          {med.isLowStock && (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                              Low Stock (&le; {med.minReorderLevel})
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-text-muted">
                          {med.activeBatchCount} active {med.activeBatchCount === 1 ? 'batch' : 'batches'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{med.defaultTaxRate}%</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-brand-primary"
                          onClick={() => setBatchModalMedicine(med)}
                          title="View Batches & Expiry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(med)}
                          title="Edit Medicine"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-600"
                          onClick={() => {
                            if (confirm(`Delete medicine "${med.name}"?`)) {
                              deleteMutation.mutate(med.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          title="Delete Medicine"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Medicine Modal */}
      <Dialog open={addModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingMedicine ? 'Edit Medicine Record' : 'Register New Medicine'}</DialogTitle>
            <DialogDescription>
              Configure drug brand name, composition, SKU identifier, dosage format, and reorder levels.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="med-name">Brand / Trade Name</Label>
                <Input
                  id="med-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Paracetamol 500mg"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="med-generic">Generic Salt Composition</Label>
                <Input
                  id="med-generic"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g. Acetaminophen"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="med-sku">SKU / Barcode (Unique)</Label>
                <Input
                  id="med-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. MED-PCM-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="med-cat">Therapeutic Category</Label>
                <select
                  id="med-cat"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full h-9 rounded-lg border border-surface bg-surface-card px-3 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  required
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="med-form">Dosage Form</Label>
                <select
                  id="med-form"
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                  className="w-full h-9 rounded-lg border border-surface bg-surface-card px-3 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  {DOSAGE_FORMS.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="med-strength">Strength</Label>
                <Input
                  id="med-strength"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  placeholder="e.g. 500mg, 10ml"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="med-pkg">Packaging Unit</Label>
                <Input
                  id="med-pkg"
                  value={formData.packageUnit}
                  onChange={(e) => setFormData({ ...formData, packageUnit: e.target.value })}
                  placeholder="e.g. Strip of 10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="med-reorder">Minimum Reorder Level (Alert Threshold)</Label>
                <Input
                  id="med-reorder"
                  type="number"
                  min="0"
                  value={formData.minReorderLevel}
                  onChange={(e) => setFormData({ ...formData, minReorderLevel: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="med-tax">Default GST / Tax Rate (%)</Label>
                <Input
                  id="med-tax"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.defaultTaxRate}
                  onChange={(e) => setFormData({ ...formData, defaultTaxRate: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Saving Record...
                  </>
                ) : editingMedicine ? (
                  'Update Medicine'
                ) : (
                  'Register Medicine'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Batch Breakdown Preview Modal */}
      {batchModalMedicine && (
        <BatchPreviewModal
          medicineId={batchModalMedicine.id}
          medicineName={batchModalMedicine.name}
          onClose={() => setBatchModalMedicine(null)}
        />
      )}
    </div>
  );
}

function BatchPreviewModal({ medicineId, medicineName, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['medicineBatches', medicineId],
    queryFn: async () => {
      const res = await apiClient.get(`/medicines/${medicineId}`);
      return res.data?.medicine;
    }
  });

  const batches = data?.batches || [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base">Batch Inventory Breakdown</DialogTitle>
            <Badge variant="outline">{medicineName}</Badge>
          </div>
          <DialogDescription>
            Live view of physical inventory batches, expiry boundaries, and FEFO eligibility status.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-xs text-text-muted gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted">
              No inventory batches received yet for this medicine.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Available Stock</TableHead>
                  <TableHead>Purchase Cost</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => {
                  const isExpired = new Date(b.expiryDate) < new Date();
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono font-medium text-xs text-text-primary">
                        {b.batchNumber}
                      </TableCell>
                      <TableCell>
                        <span className={isExpired ? 'text-red-600 font-semibold text-xs' : 'text-xs'}>
                          {formatDate(b.expiryDate)}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-xs">{b.currentQuantity} units</TableCell>
                      <TableCell className="text-text-muted">{formatCurrency(b.purchaseCost)}</TableCell>
                      <TableCell className="font-semibold text-text-primary">
                        {formatCurrency(b.salePrice)}
                      </TableCell>
                      <TableCell>
                        {isExpired ? (
                          <Badge variant="destructive">Expired (Blocked)</Badge>
                        ) : b.currentQuantity === 0 ? (
                          <Badge variant="outline">Depleted</Badge>
                        ) : (
                          <Badge variant="success">Active (FEFO)</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
