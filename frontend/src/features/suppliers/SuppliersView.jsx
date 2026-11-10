import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Package
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Pharmaceutical Distributors</h1>
            <Badge variant="outline">{suppliers.length} Vendors</Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage authorized medicine manufacturers, wholesale distributors, and tax credentials.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="default">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Supplier
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor & Representative</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>GSTIN / Tax ID</TableHead>
                  <TableHead>Purchase History</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((sup) => (
                  <TableRow key={sup.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-brand-primary" />
                          {sup.name}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          Rep: {sup.contactPerson || 'Not specified'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-[11px] text-text-muted">
                        {sup.phone && (
                          <span className="flex items-center gap-1 text-text-primary">
                            <Phone className="w-3 h-3 text-text-muted" /> {sup.phone}
                          </span>
                        )}
                        {sup.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-text-muted" /> {sup.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sup.taxNumber ? (
                        <code className="text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-surface-muted text-text-primary">
                          {sup.taxNumber}
                        </code>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1 font-mono">
                        <Package className="w-3 h-3 text-brand-primary" />
                        {sup.purchaseCount} POs
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sup.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(sup)}
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-600"
                          onClick={() => {
                            if (confirm(`Delete supplier "${sup.name}"?`)) {
                              deleteMutation.mutate(sup.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          title="Delete Supplier"
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
    </div>
  );
}
