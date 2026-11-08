import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  RotateCcw,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Eye,
  Trash2,
  DollarSign,
  PackageCheck,
  ShieldAlert,
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

export function ReturnsView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  // Return Processing Form State
  const [invoiceLookup, setInvoiceLookup] = useState('');
  const [targetSale, setTargetSale] = useState(null);
  const [searchingSale, setSearchingSale] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnItemsState, setReturnItemsState] = useState({});

  // Query: Returns list
  const { data: returnsData, isLoading } = useQuery({
    queryKey: ['returns-ledger', searchTerm],
    queryFn: async () => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const res = await apiClient.get('/returns', { params });
      return res.data?.returns || res.data || [];
    }
  });

  const returns = Array.isArray(returnsData) ? returnsData : returnsData?.returns || [];

  // Summary Metrics
  const totalReturnsCount = returns.length;
  const totalRefundAmount = returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);

  // Mutation: Process Return
  const createReturnMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/returns', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.meta?.message || 'Return processed and inventory adjusted successfully');
      queryClient.invalidateQueries({ queryKey: ['returns-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
      setCreateModalOpen(false);
      resetWizard();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to process return');
    }
  });

  const resetWizard = () => {
    setInvoiceLookup('');
    setTargetSale(null);
    setReturnReason('');
    setReturnItemsState({});
  };

  const handleLookupInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceLookup.trim()) return;

    setSearchingSale(true);
    try {
      // Find sale by invoiceNumber
      const res = await apiClient.get('/sales', {
        params: { search: invoiceLookup.trim() }
      });
      const match = res.data?.data?.[0];
      if (!match) {
        toast.error('No invoice found matching that number');
        setTargetSale(null);
        return;
      }

      // Fetch full sale details with items and existing returns
      const fullRes = await apiClient.get(`/sales/${match.id}`);
      setTargetSale(fullRes.data.data);

      // Pre-initialize return state for items
      const initialState = {};
      fullRes.data.data.items?.forEach((item) => {
        initialState[item.id] = {
          selected: false,
          quantity: 1,
          disposition: 'RESTOCKED'
        };
      });
      setReturnItemsState(initialState);
    } catch (err) {
      toast.error('Failed to look up invoice');
    } finally {
      setSearchingSale(false);
    }
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!targetSale) {
      toast.error('Please find a valid invoice first');
      return;
    }

    if (!returnReason.trim() || returnReason.trim().length < 3) {
      toast.error('A clear return reason is required (min 3 characters)');
      return;
    }

    const itemsToReturn = Object.entries(returnItemsState)
      .filter(([_, state]) => state.selected && state.quantity > 0)
      .map(([saleItemId, state]) => ({
        saleItemId,
        quantity: parseInt(state.quantity, 10),
        disposition: state.disposition
      }));

    if (itemsToReturn.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    createReturnMutation.mutate({
      saleId: targetSale.id,
      reason: returnReason.trim(),
      items: itemsToReturn
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-brand-primary" />
            Customer Returns & Restocking
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Process auditable customer returns against prior invoices with condition disposition and stock restitution.
          </p>
        </div>
        <Button
          onClick={() => {
            resetWizard();
            setCreateModalOpen(true);
          }}
          className="bg-brand-primary hover:bg-brand-secondary text-white shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Process Customer Return
        </Button>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Return Notes</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{totalReturnsCount}</h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Refund Disbursed</p>
              <h3 className="text-2xl font-bold text-rose-500 mt-1">{formatCurrency(totalRefundAmount)}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Active Restock Engine</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">Verified</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <PackageCheck className="w-5 h-5" />
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
              placeholder="Search return # or invoice #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface-bg border-surface text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card className="bg-surface-card border-surface">
        <CardHeader className="p-4 pb-2 border-b border-surface">
          <CardTitle className="text-base font-semibold text-text-primary flex items-center justify-between">
            <span>Customer Returns Directory</span>
            <span className="text-xs font-normal text-text-muted">{returns.length} record(s)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <p className="text-sm">Loading returns ledger...</p>
            </div>
          ) : returns.length === 0 ? (
            <div className="py-16 text-center text-text-muted">
              <RotateCcw className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
              <p className="font-medium text-text-primary">No customer returns on record</p>
              <p className="text-xs text-text-muted mt-1">Processed returns with reasons will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-surface hover:bg-transparent">
                    <TableHead className="text-xs font-semibold">Return #</TableHead>
                    <TableHead className="text-xs font-semibold">Original Invoice</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Mandatory Reason</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Refund Amount</TableHead>
                    <TableHead className="text-xs font-semibold">Handled By</TableHead>
                    <TableHead className="text-xs font-semibold text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((ret) => (
                    <TableRow key={ret.id} className="border-surface hover:bg-surface-bg/50">
                      <TableCell className="font-mono font-medium text-xs text-rose-500">
                        {ret.returnNumber}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-brand-primary">
                        {ret.sale?.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">{formatDate(ret.createdAt)}</TableCell>
                      <TableCell className="text-xs text-text-primary max-w-xs truncate">{ret.reason}</TableCell>
                      <TableCell className="text-right font-bold text-xs text-rose-500">
                        {formatCurrency(ret.refundAmount)}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">
                        {ret.processedByUser?.fullName || 'Staff'}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-text-muted hover:text-text-primary"
                          onClick={async () => {
                            try {
                              const res = await apiClient.get(`/returns/${ret.id}`);
                              setSelectedReturn(res.data.data);
                            } catch (err) {
                              toast.error('Failed to load return details');
                            }
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Note
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

      {/* PROCESS RETURN WIZARD MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-3xl bg-surface-card border-surface max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-brand-primary" />
              Process Customer Return
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Select original fiscal invoice, check item return quantities, and choose restock disposition.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Step 1: Invoice Lookup */}
            <form onSubmit={handleLookupInvoice} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Enter invoice number (e.g. INV-123456-7890)..."
                  value={invoiceLookup}
                  onChange={(e) => setInvoiceLookup(e.target.value)}
                  className="pl-9 bg-surface-bg border-surface text-sm"
                />
              </div>
              <Button type="submit" disabled={searchingSale} className="bg-brand-primary text-white text-xs">
                {searchingSale ? 'Searching...' : 'Find Invoice'}
              </Button>
            </form>

            {/* Step 2: Show Target Invoice Details */}
            {targetSale && (
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div className="p-3.5 rounded-xl border border-surface bg-surface-bg/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-text-muted block">Invoice #</span>
                    <span className="font-bold text-brand-primary">{targetSale.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Customer</span>
                    <span className="font-medium text-text-primary">{targetSale.customerName}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Sale Total</span>
                    <span className="font-bold text-text-primary">{formatCurrency(targetSale.totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Status</span>
                    <span className="font-semibold text-emerald-600">{targetSale.status}</span>
                  </div>
                </div>

                {/* Return Items Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-text-primary">
                    Select Items to Return from Invoice
                  </Label>
                  <div className="rounded-xl border border-surface overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-surface hover:bg-transparent">
                          <TableHead className="w-10"></TableHead>
                          <TableHead className="text-xs font-semibold">Medication</TableHead>
                          <TableHead className="text-xs font-semibold">Sold Qty</TableHead>
                          <TableHead className="text-xs font-semibold text-center">Return Qty</TableHead>
                          <TableHead className="text-xs font-semibold">Disposition</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {targetSale.items?.map((item) => {
                          const state = returnItemsState[item.id] || { selected: false, quantity: 1, disposition: 'RESTOCKED' };
                          return (
                            <TableRow key={item.id} className="border-surface">
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={state.selected}
                                  onChange={(e) =>
                                    setReturnItemsState({
                                      ...returnItemsState,
                                      [item.id]: { ...state, selected: e.target.checked }
                                    })
                                  }
                                  className="rounded border-surface text-brand-primary focus:ring-brand-primary"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold text-xs text-text-primary">{item.medicine?.name}</div>
                                <div className="text-[10px] text-text-muted font-mono">Lot: {item.batch?.batchNumber}</div>
                              </TableCell>
                              <TableCell className="text-xs">{item.quantity} sold</TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  min="1"
                                  max={item.quantity}
                                  disabled={!state.selected}
                                  value={state.quantity}
                                  onChange={(e) =>
                                    setReturnItemsState({
                                      ...returnItemsState,
                                      [item.id]: { ...state, quantity: e.target.value }
                                    })
                                  }
                                  className="h-8 w-20 mx-auto text-center text-xs bg-surface-bg border-surface font-semibold"
                                />
                              </TableCell>
                              <TableCell>
                                <select
                                  disabled={!state.selected}
                                  value={state.disposition}
                                  onChange={(e) =>
                                    setReturnItemsState({
                                      ...returnItemsState,
                                      [item.id]: { ...state, disposition: e.target.value }
                                    })
                                  }
                                  className="px-2 py-1 text-xs bg-surface-bg border border-surface rounded text-text-primary focus:ring-1 focus:ring-brand-primary"
                                >
                                  <option value="RESTOCKED">Restock into Inventory</option>
                                  <option value="DAMAGED_DISCARDED">Damaged / Discard</option>
                                </select>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Mandatory Reason */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-text-primary">
                    Mandatory Auditable Return Reason <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Prescribing physician altered dosage regimen to alternate brand"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="bg-surface-bg border-surface text-xs"
                    required
                  />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createReturnMutation.isPending}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                  >
                    {createReturnMutation.isPending ? 'Processing Refund...' : 'Authorize Return & Restock'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW RETURN DETAILS MODAL */}
      <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent className="max-w-lg bg-surface-card border-surface">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-text-primary">
              Credit Note #{selectedReturn?.returnNumber}
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Disbursed refund voucher and inventory disposition.
            </DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl border border-surface bg-surface-bg/40 space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">Original Invoice:</span>
                  <span className="font-mono font-bold text-brand-primary">{selectedReturn.sale?.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Processed Date:</span>
                  <span>{formatDate(selectedReturn.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Processed By:</span>
                  <span>{selectedReturn.processedByUser?.fullName}</span>
                </div>
                <div className="flex justify-between border-t border-surface pt-2">
                  <span className="font-bold text-text-primary">Total Refund:</span>
                  <span className="font-extrabold text-rose-500">{formatCurrency(selectedReturn.refundAmount)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-surface bg-surface-bg/20">
                <span className="text-text-muted block text-[11px]">Audit Reason:</span>
                <p className="text-text-primary font-medium mt-0.5">{selectedReturn.reason}</p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedReturn(null)}>
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
