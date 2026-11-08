import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Layers,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
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
import { formatCurrency, formatDate } from '../../lib/utils.js';

export function InventoryView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');
  const [selectedBatchForAdjustment, setSelectedBatchForAdjustment] = useState(null);

  // Form state for stock adjustment
  const [adjType, setAdjType] = useState('WRITE_OFF_DAMAGED');
  const [adjDelta, setAdjDelta] = useState(-1);
  const [adjReason, setAdjReason] = useState('');

  // Queries
  const { data: overviewData } = useQuery({
    queryKey: ['inventory-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/inventory/overview');
      return res.data?.data || {};
    }
  });

  const { data: batchesData, isLoading } = useQuery({
    queryKey: ['inventory-batches', searchTerm, statusFilter, expiryFilter],
    queryFn: async () => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (expiryFilter) params.expiringWithinDays = expiryFilter;
      const res = await apiClient.get('/inventory/batches', { params });
      return res.data;
    }
  });

  const batches = batchesData?.data || [];
  const overview = overviewData || {};

  // Mutation: Record Stock Adjustment
  const adjustMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/inventory/adjustments', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.meta?.message || 'Stock adjustment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-overview'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
      setSelectedBatchForAdjustment(null);
      setAdjReason('');
      setAdjDelta(-1);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to record stock adjustment');
    }
  });

  const handleAdjustmentSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatchForAdjustment) return;

    if (!adjReason.trim() || adjReason.trim().length < 3) {
      toast.error('A mandatory audit reason is required (min 3 characters)');
      return;
    }

    const delta = parseInt(adjDelta, 10);
    if (isNaN(delta) || delta === 0) {
      toast.error('Quantity delta must be non-zero');
      return;
    }

    if (selectedBatchForAdjustment.currentQuantity + delta < 0) {
      toast.error(`Adjustment would cause negative inventory (${selectedBatchForAdjustment.currentQuantity + delta})`);
      return;
    }

    adjustMutation.mutate({
      batchId: selectedBatchForAdjustment.id,
      adjustmentType: adjType,
      quantityDelta: delta,
      reason: adjReason.trim()
    });
  };

  const getExpiryBadge = (batch) => {
    if (batch.expiryStatus === 'EXPIRED') {
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-semibold text-[10px]">
          <XCircle className="w-2.5 h-2.5 mr-1" /> Expired
        </Badge>
      );
    }
    if (batch.expiryStatus === 'NEAR_EXPIRY') {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold text-[10px]">
          <Clock className="w-2.5 h-2.5 mr-1" /> &lt; {batch.daysToExpiry}d
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
        <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Valid
      </Badge>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Boxes className="w-6 h-6 text-brand-primary" />
            Batch-Wise Inventory & Reconciliation
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Monitor granular pharmaceutical lots, expiry horizons, stock valuations, and audit write-offs.
          </p>
        </div>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Active Units</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">
                {overview.totalActiveUnits || 0}
              </h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Stock Valuation (Cost)</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">
                {formatCurrency(overview.totalActiveCostValuation || 0)}
              </h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Near Expiry (&lt; 60d)</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {overview.nearExpiryBatchesCount || 0}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Expired Batches</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">
                {overview.expiredBatchesCount || 0}
              </h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
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
              placeholder="Search batch #, medication name, SKU..."
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
              <option value="">All Batch Statuses</option>
              <option value="ACTIVE">Active (In Stock)</option>
              <option value="DEPLETED">Depleted (0 units)</option>
              <option value="QUARANTINED">Quarantined</option>
            </select>

            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-surface-bg border border-surface rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="">All Expiry Horizons</option>
              <option value="30">Expiring in 30 days</option>
              <option value="60">Expiring in 60 days</option>
              <option value="90">Expiring in 90 days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <Card className="bg-surface-card border-surface">
        <CardHeader className="p-4 pb-2 border-b border-surface">
          <CardTitle className="text-base font-semibold text-text-primary flex items-center justify-between">
            <span>Granular Batch Inventory</span>
            <span className="text-xs font-normal text-text-muted">{batches.length} batch(es) listed</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <p className="text-sm">Loading batch inventory...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="py-16 text-center text-text-muted">
              <Boxes className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
              <p className="font-medium text-text-primary">No batches found</p>
              <p className="text-xs text-text-muted mt-1">Receive goods shipments to populate active batch lots.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-surface hover:bg-transparent">
                    <TableHead className="text-xs font-semibold">Batch / Lot #</TableHead>
                    <TableHead className="text-xs font-semibold">Medication</TableHead>
                    <TableHead className="text-xs font-semibold">Expiry Date</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Remaining Units</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Cost Price</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Sale Price</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Valuation (Cost)</TableHead>
                    <TableHead className="text-xs font-semibold text-right pr-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id} className="border-surface hover:bg-surface-bg/50">
                      <TableCell className="font-mono font-medium text-xs text-brand-primary">
                        {batch.batchNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-text-primary">{batch.medicine?.name}</div>
                        <div className="text-[11px] text-text-muted">
                          {batch.medicine?.strength} • {batch.medicine?.dosageForm}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-text-primary">{formatDate(batch.expiryDate)}</div>
                        <div className="mt-0.5">{getExpiryBadge(batch)}</div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-xs text-text-primary">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full ${
                            batch.currentQuantity === 0
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-text-muted'
                              : 'bg-brand-primary/10 text-brand-primary'
                          }`}
                        >
                          {batch.currentQuantity} units
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(batch.purchaseCost)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(batch.salePrice)}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-text-primary">
                        {formatCurrency(batch.stockValueAtCost)}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-text-muted hover:text-brand-primary gap-1"
                          onClick={() => {
                            setSelectedBatchForAdjustment(batch);
                            setAdjDelta(-1);
                            setAdjReason('');
                          }}
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* STOCK ADJUSTMENT MODAL */}
      <Dialog open={!!selectedBatchForAdjustment} onOpenChange={() => setSelectedBatchForAdjustment(null)}>
        <DialogContent className="max-w-md bg-surface-card border-surface">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-text-primary flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
              Adjust Batch Stock: {selectedBatchForAdjustment?.batchNumber}
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Record auditable write-offs or physical stock count adjustments.
            </DialogDescription>
          </DialogHeader>

          {selectedBatchForAdjustment && (
            <form onSubmit={handleAdjustmentSubmit} className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-xl border border-surface bg-surface-bg/40 space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">Medication:</span>
                  <span className="font-semibold text-text-primary">{selectedBatchForAdjustment.medicine?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Current Balance:</span>
                  <span className="font-bold text-brand-primary">{selectedBatchForAdjustment.currentQuantity} units</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Adjustment Type</Label>
                <select
                  value={adjType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAdjType(val);
                    if (val === 'INVENTORY_COUNT_GAIN') {
                      setAdjDelta(1);
                    } else if (adjDelta > 0) {
                      setAdjDelta(-1);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-surface-bg border border-surface rounded-lg text-text-primary focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="WRITE_OFF_DAMAGED">Write-Off Damaged Goods (-)</option>
                  <option value="WRITE_OFF_EXPIRED">Write-Off Expired Stock (-)</option>
                  <option value="INVENTORY_COUNT_LOSS">Stock Count Shortage (-)</option>
                  <option value="INVENTORY_COUNT_GAIN">Stock Count Surplus (+)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Quantity Delta</Label>
                  <Input
                    type="number"
                    value={adjDelta}
                    onChange={(e) => setAdjDelta(e.target.value)}
                    className="h-8 text-xs bg-surface-bg border-surface font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-text-muted">Balance After</Label>
                  <div className="h-8 px-3 rounded-md bg-surface-bg/60 border border-surface flex items-center font-bold text-brand-primary">
                    {selectedBatchForAdjustment.currentQuantity + (parseInt(adjDelta, 10) || 0)} units
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Mandatory Audit Reason <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Broken vial during shelf restock"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="h-8 text-xs bg-surface-bg border-surface"
                  required
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button type="button" variant="outline" onClick={() => setSelectedBatchForAdjustment(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={adjustMutation.isPending}
                  className="bg-brand-primary hover:bg-brand-secondary text-white font-bold"
                >
                  {adjustMutation.isPending ? 'Recording...' : 'Commit Adjustment'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
