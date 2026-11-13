import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  FileCheck,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  Building2,
  Package,
  MapPin,
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '../../components/ui/popover.jsx';
import { TablePagination } from '../../components/ui/table-pagination.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { formatDate } from '../../lib/utils.js';

export function SuppliersView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['suppliers', { search: searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const res = await apiClient.get(`/suppliers?${params.toString()}`);
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/suppliers/${id}`),
    onSuccess: () => {
      toast.success('Supplier removed');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (err) => {
      toast.error('Cannot delete supplier', {
        description: err.message || 'Historical purchase orders are associated with this vendor.'
      });
    }
  });

  const handleOpenAdd = () => {
    navigate('/suppliers/new');
  };

  const handleOpenEdit = (sup) => {
    navigate(`/suppliers/${sup.id}/edit`);
  };

  const suppliers = Array.isArray(data) ? data : (data?.suppliers || data?.data || []);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [suppliers.length, searchTerm]);

  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return suppliers.slice(start, start + pageSize);
  }, [suppliers, currentPage, pageSize]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Pharmaceutical Suppliers
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            <span className="font-semibold text-text-primary">{suppliers.length}</span> registered manufacturers and wholesale distributors.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold gap-2 shadow-sm rounded-lg text-sm">
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </Button>
      </div>

      {/* Search & Actions Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Search by vendor name, representative, GSTIN, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Button onClick={() => refetch()} variant="outline" size="icon" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-text-muted gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              Loading suppliers directory...
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-xs text-red-600">
              Failed to load suppliers: {error?.message}
            </div>
          ) : suppliers.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-muted flex flex-col items-center gap-2">
              <Building2 className="w-8 h-8 opacity-40" />
              <span>No suppliers registered yet.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/90 hover:bg-slate-50/90">
                    <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-slate-500">Vendor &amp; Representative</TableHead>
                    <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Details</TableHead>
                    <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-slate-500">GSTIN / Tax ID</TableHead>
                    <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Purchase History</TableHead>
                    <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Status</TableHead>
                    <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSuppliers.map((sup) => (
                    <TableRow key={sup.id} className="border-surface/60 hover:bg-surface-page/70 transition-colors">
                      {/* Vendor Name & Rep - Direct Link to Supplier Profile */}
                      <TableCell className="min-w-[200px] align-middle">
                        <div className="flex flex-col">
                          <Link
                            to={`/suppliers/${sup.id}`}
                            className="font-semibold text-sm text-text-primary hover:text-brand-primary flex items-center gap-1.5 transition-colors group cursor-pointer"
                            title={`View 360° profile for ${sup.name}`}
                          >
                            <Truck className="w-3.5 h-3.5 text-brand-primary group-hover:scale-110 transition-transform shrink-0" />
                            <span className="group-hover:underline">{sup.name}</span>
                          </Link>
                          <span className="text-xs text-text-muted mt-0.5">
                            Rep: {sup.contactPerson || 'Not specified'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Contact Details with Direct Click-to-Call and Click-to-Email */}
                      <TableCell className="min-w-[200px] align-middle">
                        <div className="flex flex-col gap-1 text-xs text-text-muted">
                          {sup.phone ? (
                            <a
                              href={`tel:${sup.phone}`}
                              className="flex items-center gap-1.5 text-text-primary hover:text-brand-primary font-mono transition-colors group cursor-pointer w-fit"
                              title={`Click to call ${sup.phone}`}
                            >
                              <Phone className="w-3 h-3 text-text-muted group-hover:text-brand-primary shrink-0" />
                              <span className="hover:underline">{sup.phone}</span>
                            </a>
                          ) : null}

                          {sup.email ? (
                            <a
                              href={`mailto:${sup.email}`}
                              className="flex items-center gap-1.5 text-text-muted hover:text-brand-primary transition-colors group cursor-pointer truncate max-w-[180px] w-fit"
                              title={`Click to email ${sup.email}`}
                            >
                              <Mail className="w-3 h-3 text-text-muted group-hover:text-brand-primary shrink-0" />
                              <span className="hover:underline truncate">{sup.email}</span>
                            </a>
                          ) : null}

                          {!sup.phone && !sup.email && (
                            <span className="italic text-text-muted">No contacts listed</span>
                          )}

                          {sup.address && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="flex items-center gap-1 text-[11px] text-brand-primary hover:underline cursor-pointer mt-0.5 w-fit"
                                  title="View supplier address"
                                >
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>Address</span>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-2.5 text-xs shadow-lg" align="start">
                                <div className="font-semibold text-xs text-text-primary border-b border-surface pb-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-brand-primary" />
                                  <span>Supplier Facility Address</span>
                                </div>
                                <p className="mt-1.5 text-text-muted leading-relaxed whitespace-pre-wrap">{sup.address}</p>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </TableCell>

                      {/* GSTIN / Tax ID */}
                      <TableCell className="w-36 align-middle">
                        {sup.taxNumber ? (
                          <code className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {sup.taxNumber}
                          </code>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Purchase History - Clickable link to Profile */}
                      <TableCell className="w-32 align-middle text-center">
                        <Link
                          to={`/suppliers/${sup.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono tabular-nums font-semibold hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-colors"
                          title="View all purchase orders"
                        >
                          <Package className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{sup.purchaseCount ?? 0} POs</span>
                        </Link>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="w-28 align-middle text-center">
                        {sup.isActive ? (
                          <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full line-through">
                            Suspended
                          </span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="w-28 align-middle text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-text-muted hover:text-brand-primary hover:bg-surface-muted cursor-pointer rounded-md"
                            onClick={() => navigate(`/suppliers/${sup.id}`)}
                            title="View Supplier Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-text-muted hover:text-brand-primary hover:bg-surface-muted cursor-pointer rounded-md"
                            onClick={() => handleOpenEdit(sup)}
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-text-muted hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer rounded-md"
                            onClick={() => {
                              if (confirm(`Delete supplier "${sup.name}"?`)) {
                                deleteMutation.mutate(sup.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            title="Delete Supplier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && suppliers.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={suppliers.length}
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
    </div>
  );
}
