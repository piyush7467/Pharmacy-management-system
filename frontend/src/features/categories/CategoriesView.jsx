import React, { useState } from 'react';
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
  CheckCircle2
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
import { formatDate } from '../../lib/utils.js';

export function CategoriesView() {
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
        description: `Category "${res.data?.category?.name}" is ready.`
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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

  const categories = data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Therapeutic Categories</h1>
            <Badge variant="outline">{categories.length} Categories</Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Organize medications by pharmacological action and therapeutic classes.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="default">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Category
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Clinical Description</TableHead>
                  <TableHead>Linked Medicines</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-semibold text-text-primary">
                        <div className="p-1.5 rounded-md bg-brand-primary/10 text-brand-primary">
                          <Tags className="w-3.5 h-3.5" />
                        </div>
                        {cat.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-text-muted max-w-md">
                      {cat.description ? (
                        <span className="truncate block">{cat.description}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <AlertCircle className="w-3 h-3" /> Needs Description
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1 font-mono">
                        <Pill className="w-3 h-3 text-brand-primary" />
                        {cat.medicineCount} {cat.medicineCount === 1 ? 'drug' : 'drugs'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-muted">{formatDate(cat.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-600"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                              deleteMutation.mutate(cat.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          title="Delete Category"
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

      {/* Add / Edit Category Dialog */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Therapeutic Category'}</DialogTitle>
            <DialogDescription>
              Define a pharmacological classification for medicines in your catalogue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cardiovascular & Antihypertensives"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description (Optional)</Label>
              <textarea
                id="cat-desc"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Indications, class details, or clinical notes..."
                className="w-full rounded-lg border border-surface bg-surface-card p-2.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : editingCategory ? (
                  'Update Category'
                ) : (
                  'Create Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
