import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Receipt,
  Search,
  Eye,
  Printer,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  DollarSign,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
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

export function SalesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);

  // Queries
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-ledger', searchTerm, paymentFilter, statusFilter],
    queryFn: async () => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (paymentFilter) params.paymentMethod = paymentFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/sales', { params });
      return res.data;
    }
  });

  const sales = salesData?.data || [];

  // Summary Metrics
  const totalCount = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalTax = sales.reduce((sum, s) => sum + (s.taxAmount || 0), 0);
  const avgBasket = totalCount > 0 ? totalRevenue / totalCount : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      case 'REFUNDED_PARTIAL':
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            <RotateCcw className="w-3 h-3 mr-1" /> Partial Refund
          </Badge>
        );
      case 'REFUNDED_FULL':
        return (
          <Badge variant="outline" className="text-rose-500 border-rose-500/20 bg-rose-500/5">
            <RotateCcw className="w-3 h-3 mr-1" /> Fully Refunded
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="text-text-muted border-surface line-through">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="w-3 h-3 mr-1 text-emerald-500" />;
      case 'CARD':
        return <CreditCard className="w-3 h-3 mr-1 text-blue-500" />;
      case 'UPI':
        return <QrCode className="w-3 h-3 mr-1 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-primary" />
            Sales Ledger & Invoices
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Audit completed transactions, inspect FEFO batch distributions, and reprint tax invoices.
          </p>
        </div>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Invoices</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{totalCount}</h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Gross Sales Revenue</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(totalRevenue)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Tax Remittance (GST)</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(totalTax)}</h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Average Basket</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(avgBasket)}</h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <CreditCard className="w-5 h-5" />
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
              placeholder="Search invoice #, customer name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface-bg border-surface text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-surface-bg border border-surface rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="">All Payment Methods</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-surface-bg border border-surface rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="REFUNDED_PARTIAL">Partial Refund</option>
              <option value="REFUNDED_FULL">Fully Refunded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="bg-surface-card border-surface">
        <CardHeader className="p-4 pb-2 border-b border-surface">
          <CardTitle className="text-base font-semibold text-text-primary flex items-center justify-between">
            <span>Fiscal Invoices Directory</span>
            <span className="text-xs font-normal text-text-muted">{sales.length} record(s)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <p className="text-sm">Loading sales ledger...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="py-16 text-center text-text-muted">
              <Receipt className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
              <p className="font-medium text-text-primary">No sales records found</p>
              <p className="text-xs text-text-muted mt-1">Process a transaction in the POS Checkout view.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-surface hover:bg-transparent">
                    <TableHead className="text-xs font-semibold">Invoice Number</TableHead>
                    <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                    <TableHead className="text-xs font-semibold">Customer</TableHead>
                    <TableHead className="text-xs font-semibold">Payment</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Grand Total</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="border-surface hover:bg-surface-bg/50">
                      <TableCell className="font-mono font-medium text-xs text-brand-primary">
                        {sale.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">{formatDate(sale.createdAt)}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm text-text-primary">{sale.customerName}</div>
                        {sale.customerPhone && <div className="text-xs text-text-muted">{sale.customerPhone}</div>}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-medium">
                          {getPaymentIcon(sale.paymentMethod)}
                          {sale.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm text-text-primary">
                        {formatCurrency(sale.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(sale.status)}</TableCell>
                      <TableCell className="text-right pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-text-muted hover:text-brand-primary gap-1"
                          onClick={async () => {
                            try {
                              const res = await apiClient.get(`/sales/${sale.id}`);
                              setSelectedSale(res.data.data);
                            } catch (err) {
                              toast.error('Failed to load invoice details');
                            }
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" /> View Receipt
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

      {/* VIEW & REPRINT RECEIPT MODAL */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-xl bg-surface-card border-surface">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary flex items-center justify-between">
              <span>Invoice #{selectedSale?.invoiceNumber}</span>
              {selectedSale && getStatusBadge(selectedSale.status)}
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Complete itemized tax breakdown and batch deduction logs.
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-xl border border-surface bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs space-y-3">
                <div className="text-center pb-3 border-b border-dashed border-zinc-300 dark:border-zinc-700 space-y-1">
                  <h2 className="text-base font-bold tracking-tight uppercase">PharmaFlow Pharmacy</h2>
                  <p className="text-[11px] text-zinc-500">Official Fiscal Receipt</p>
                  <p className="text-[11px] text-zinc-500 font-semibold">TAX INVOICE #{selectedSale.invoiceNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
                  <div>
                    <span className="block text-zinc-400">Date:</span>
                    <span>{formatDate(selectedSale.createdAt)}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-zinc-400">Cashier:</span>
                    <span>{selectedSale.cashier?.fullName || 'Staff'}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-400">Customer:</span>
                    <span className="font-semibold">{selectedSale.customerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-zinc-400">Payment:</span>
                    <span className="font-semibold">{selectedSale.paymentMethod}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 py-1">
                  <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span className="col-span-6">Item (Batch #)</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                    <span className="col-span-2 text-right">Total</span>
                  </div>
                  {selectedSale.items?.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 text-[11px] py-0.5">
                      <div className="col-span-6">
                        <span className="font-semibold block truncate">{item.medicine?.name}</span>
                        <span className="text-[9px] text-zinc-500">
                          Lot: {item.batch?.batchNumber} • Exp: {formatDate(item.batch?.expiryDate)}
                        </span>
                      </div>
                      <span className="col-span-2 text-center">{item.quantity}</span>
                      <span className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</span>
                      <span className="col-span-2 text-right font-bold">{formatCurrency(item.totalAmount)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-2 border-t border-dashed border-zinc-300 dark:border-zinc-700 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedSale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(selectedSale.taxAmount)}</span>
                  </div>
                  {selectedSale.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedSale.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <span>GRAND TOTAL:</span>
                    <span>{formatCurrency(selectedSale.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setSelectedSale(null)}>
                  Close
                </Button>
                <Button onClick={() => window.print()} className="bg-brand-primary text-white gap-2">
                  <Printer className="w-4 h-4" /> Print Invoice
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
