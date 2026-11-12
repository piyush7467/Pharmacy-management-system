import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Eye,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Banknote,
  CreditCard,
  QrCode,
  Layers,
  User,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '../../../components/ui/table.jsx';
import { TablePagination } from '../../../components/ui/table-pagination.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function SalesTable({ sales = [], isLoading, onViewReceipt }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [sales.length]);

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sales.slice(start, start + pageSize);
  }, [sales, currentPage, pageSize]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'REFUNDED_PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
            <RotateCcw className="w-3 h-3" /> Partial Refund
          </span>
        );
      case 'REFUNDED_FULL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 rounded-full">
            <RotateCcw className="w-3 h-3" /> Fully Refunded
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted border border-surface px-2.5 py-0.5 rounded-full line-through">
            Cancelled
          </span>
        );
      default:
        return <Badge variant="outline" className="text-[11px]">{status}</Badge>;
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />;
      case 'CARD':
        return <CreditCard className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />;
      case 'UPI':
        return <QrCode className="w-3.5 h-3.5 mr-1 text-purple-600 dark:text-purple-400" />;
      case 'SPLIT':
        return <Layers className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-surface-card border-surface shadow-xs overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-surface">
        <CardTitle className="text-base font-semibold text-text-primary flex items-center justify-between">
          <span>Fiscal Invoices Directory</span>
          <span className="text-xs font-medium text-text-muted tabular-nums">
            {sales.length} total invoice(s)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-20 text-center text-text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <p className="text-sm font-medium">Loading sales ledger...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="py-20 text-center text-text-muted">
            <Receipt className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
            <p className="font-semibold text-base text-text-primary">No sales records found</p>
            <p className="text-xs text-text-muted mt-1">Process transactions in the POS Checkout view.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-surface bg-surface-muted/40 hover:bg-surface-muted/40">
                  <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-text-muted">Invoice Number</TableHead>
                  <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-text-muted">Date & Time</TableHead>
                  <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-text-muted">Customer Details</TableHead>
                  <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-text-muted text-center">Items</TableHead>
                  <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-text-muted">Payment</TableHead>
                  <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">Grand Total</TableHead>
                  <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-text-muted text-center">Status</TableHead>
                  <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-text-muted text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSales.map((sale) => (
                  <TableRow key={sale.id} className="border-surface/60 hover:bg-surface-page/70 transition-colors">
                    {/* Invoice Number */}
                    <TableCell className="w-36 align-middle font-mono font-semibold text-xs text-brand-primary">
                      <code className="px-2 py-1 rounded bg-surface-page border border-surface font-mono font-medium text-xs text-text-primary block w-fit">
                        {sale.invoiceNumber}
                      </code>
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell className="w-32 align-middle text-xs text-text-muted font-medium">
                      {formatDate(sale.createdAt)}
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="min-w-[200px] align-middle">
                      <div className="flex items-center gap-1.5 font-semibold text-sm text-text-primary">
                        <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="truncate max-w-[180px]">{sale.customerName || 'Walk-in Customer'}</span>
                      </div>
                      {sale.customerPhone && (
                        <div className="text-xs text-text-muted font-mono mt-0.5">
                          {sale.customerPhone}
                        </div>
                      )}
                    </TableCell>

                    {/* Items Count */}
                    <TableCell className="w-28 align-middle text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-muted border border-surface font-mono text-xs font-medium text-text-primary">
                        <ShoppingBag className="w-3 h-3 text-text-muted" />
                        {sale.itemsCount ?? 1} item{sale.itemsCount !== 1 ? 's' : ''}
                      </span>
                    </TableCell>

                    {/* Payment */}
                    <TableCell className="w-32 align-middle">
                      <span className="inline-flex items-center text-xs font-semibold text-text-primary">
                        {getPaymentIcon(sale.paymentMethod)}
                        {sale.paymentMethod}
                      </span>
                    </TableCell>

                    {/* Grand Total */}
                    <TableCell className="w-32 align-middle text-right font-mono font-semibold text-sm text-text-primary tabular-nums">
                      {formatCurrency(sale.totalAmount)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="w-32 align-middle text-center">
                      {getStatusBadge(sale.status)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="w-28 align-middle text-right pr-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-text-muted hover:text-brand-primary hover:border-brand-primary/40 font-medium gap-1 cursor-pointer rounded-lg text-xs"
                        onClick={() => onViewReceipt(sale.id)}
                        title="View and print tax receipt"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && sales.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={sales.length}
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
  );
}
