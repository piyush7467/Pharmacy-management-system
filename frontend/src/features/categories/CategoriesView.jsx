import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Tags,
  Plus,
  Search,
  Pill,
  Trash2,
  Edit2,
  Loader2,
  RefreshCw,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { FormField, FormInput } from '../../components/ui/form-system.jsx';
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '../../components/ui/popover.jsx';
import { TablePagination } from '../../components/ui/table-pagination.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { formatDate } from '../../lib/utils.js';

function CategoryMedicinesCell({ category, onNavigate }) {
  const [open, setOpen] = useState(false);
  const count = category.medicineCount ?? 0;

  // Lazy query if medicines not already attached by the backend
  const { data: remoteMedicines, isLoading } = useQuery({
    queryKey: ['categoryMedicines', category.id],
    queryFn: async () => {
      const res = await apiClient.get('/medicines', {
        params: { categoryId: category.id, limit: 50 }
      });
      return res.data?.medicines || res.data || [];
    },
    enabled: open && (!category.medicines || category.medicines.length === 0) && count > 0,
    staleTime: 60000
  });

  const medicines = (category.medicines && category.medicines.length > 0)
    ? category.medicines
    : (remoteMedicines || []);

  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-surface-muted/60 text-text-muted border border-surface text-xs font-mono">
        <Pill className="w-3 h-3 text-text-muted/50" />
        0 drugs
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer font-mono text-xs font-semibold shadow-2xs group"
          title={`Click to view all ${count} medicines in this category`}
        >
          <Pill className="w-3.5 h-3.5 text-emerald-700" />
          <span>{count} {count === 1 ? 'drug' : 'drugs'}</span>
          <ChevronRight className="w-3 h-3 text-emerald-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-3 text-xs shadow-xl" align="center">
        <div className="font-semibold text-xs text-text-primary border-b border-surface pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate max-w-[220px]">
            <Tags className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            <span className="truncate">{category.name}</span>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-semibold shrink-0">
            {count} {count === 1 ? 'Formulation' : 'Formulations'}
          </span>
        </div>

        {/* Scrollable list of related medicines */}
        <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-6 text-center text-text-muted flex flex-col items-center justify-center gap-1.5">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              <span className="text-[11px]">Loading formulations...</span>
            </div>
          ) : medicines.length > 0 ? (
            medicines.map((med) => (
              <div
                key={med.id}
                className="p-2 rounded-lg bg-surface-muted/60 border border-surface hover:bg-surface-muted transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-text-primary text-xs truncate flex items-center gap-1.5">
                    <span className="truncate">{med.name}</span>
                    {med.isActive ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" title="Active" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" title="Inactive" />
                    )}
                  </div>
                  <div className="text-[11px] text-text-muted truncate mt-0.5">
                    {med.genericName || 'Standard formulation'}
                    {med.strength ? ` • ${med.strength}` : ''}
                    {med.dosageForm ? ` • ${med.dosageForm}` : ''}
                  </div>
                </div>
                <code className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-surface-page border border-surface text-text-muted shrink-0">
                  {med.sku}
                </code>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-text-muted italic">
              No medicines linked to this category yet.
            </div>
          )}
        </div>

        {/* Footer Link to view all in Medicines Table */}
        <div className="mt-2.5 pt-2 border-t border-surface flex items-center justify-between">
          <span className="text-[11px] text-text-muted font-mono">
            {medicines.length > 0 && medicines.length < count
              ? `Showing ${medicines.length} of ${count}`
              : `${count} total`}
          </span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onNavigate();
            }}
            className="text-[11px] font-semibold text-brand-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Open in Catalogue</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CategoriesView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'complete' | 'needs_description'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['categories', { search: searchTerm, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const res = await apiClient.get(`/categories?${params.toString()}`);
      return res.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: (catData) => {
      if (editingCategory) {
        return apiClient.patch(`/categories/${editingCategory.id}`, catData);
      }
      return apiClient.post('/categories', catData);
    },
    onSuccess: (res) => {
      toast.success(editingCategory ? 'Category updated' : 'Category created', {
        description: `Category "${res.data?.category?.name || res.data?.name || formData.name}" is ready.`
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categoriesList'] });
      handleCloseModal();
    },
    onError: (err) => {
      toast.error('Failed to save category', {
        description: err.message || 'Please check for duplicate category names.'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      toast.error('Cannot delete category', {
        description: err.message || 'Category contains active medicine records.'
      });
    }
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const categories = Array.isArray(data) ? data : (data?.categories || data?.data || []);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchSearch =
        !searchTerm.trim() ||
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'complete' && Boolean(cat.description && cat.description.trim())) ||
        (statusFilter === 'needs_description' && (!cat.description || !cat.description.trim()));

      return matchSearch && matchStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCategories.length]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Therapeutic Categories
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            <span className="font-semibold text-text-primary">{categories.length}</span> categories defined across pharmacological and therapeutic classes.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold gap-2 shadow-sm rounded-lg text-sm">
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Filter Toolbar with Needs Description Filter */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Search category name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'complete', label: 'Complete Details', icon: CheckCircle2 },
                { id: 'needs_description', label: 'Needs Description', icon: AlertCircle, alert: true }
              ].map((pill) => {
                const Icon = pill.icon;
                const isActive = statusFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setStatusFilter(pill.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? pill.alert
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-brand-primary text-white shadow-xs'
                        : 'bg-surface-muted text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {pill.label}
                  </button>
                );
              })}
              <Button onClick={() => refetch()} variant="outline" size="icon" className="shrink-0 h-8 w-8" title="Refresh">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-text-muted gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              Loading categories...
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-xs text-red-600">
              Failed to load categories: {error?.message}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-muted flex flex-col items-center gap-2">
              <FolderOpen className="w-8 h-8 opacity-40" />
              <span>No therapeutic categories found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/90 hover:bg-slate-50/90">
                    <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-slate-500">Category Name</TableHead>
                    <TableHead className="min-w-[260px] text-xs font-semibold uppercase tracking-wider text-slate-500">Clinical Description</TableHead>
                    <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Linked Medicines</TableHead>
                    <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-500">Created</TableHead>
                    <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.map((cat) => {
                    const hasLongDesc = cat.description && cat.description.length > 50;
                    return (
                      <TableRow key={cat.id} className="border-surface/60 hover:bg-surface-page/70 transition-colors">
                        <TableCell className="min-w-[200px] align-middle">
                          <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
                            <div className="p-1.5 rounded-md bg-brand-primary/10 text-brand-primary">
                              <Tags className="w-3.5 h-3.5" />
                            </div>
                            <span>{cat.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[260px] align-middle text-text-muted text-xs">
                          {cat.description ? (
                            <div className="flex items-center gap-1.5">
                              <span className="truncate max-w-[240px]" title={cat.description}>
                                {cat.description}
                              </span>
                              {hasLongDesc && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-text-muted hover:text-brand-primary p-0.5 rounded cursor-pointer shrink-0 transition-colors"
                                      title="Read full clinical description"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-72 p-3 text-xs shadow-xl" align="start">
                                    <div className="font-semibold text-xs text-text-primary border-b border-surface pb-1.5 flex items-center justify-between">
                                      <span>{cat.name}</span>
                                      <span className="text-[10px] text-text-muted">Description</span>
                                    </div>
                                    <p className="mt-2 text-text-secondary leading-relaxed whitespace-pre-wrap">{cat.description}</p>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertCircle className="w-3 h-3" /> Needs Description
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="w-36 align-middle text-center">
                          <CategoryMedicinesCell
                            category={cat}
                            onNavigate={() => navigate(`/medicines?category=${cat.id}`)}
                          />
                        </TableCell>
                        <TableCell className="w-32 align-middle text-text-muted text-xs font-medium">
                          {formatDate(cat.createdAt)}
                        </TableCell>
                        <TableCell className="w-28 align-middle text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-text-muted hover:text-brand-primary hover:bg-surface-muted cursor-pointer rounded-md"
                              onClick={() => handleOpenEdit(cat)}
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-text-muted hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer rounded-md"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                  deleteMutation.mutate(cat.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && filteredCategories.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredCategories.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 15, 25, 50]}
            />
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Category Dialog */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
                <Tags className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                  {editingCategory ? 'Edit Category' : 'Create Therapeutic Category'}
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Define a pharmacological classification for medicines in your catalogue.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <FormField label="Category Name" required helperText="e.g. Cardiovascular & Antihypertensives, Antibiotics">
              <FormInput
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Analgesics & Antipyretics"
                required
                autoFocus
              />
            </FormField>

            <FormField label="Description (Optional)" helperText="Brief therapeutic scope or clinical note">
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Indications, pharmacological mechanism or clinical notes..."
                className="w-full rounded-xl border border-surface bg-surface-card p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
              />
            </FormField>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={saveMutation.isPending}
                className="h-10 px-5 text-sm font-medium rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2 cursor-pointer"
              >
                <Tags className="w-4 h-4" />
                <span>
                  {saveMutation.isPending
                    ? 'Saving...'
                    : editingCategory
                    ? 'Update Category'
                    : 'Create Category'}
                </span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
