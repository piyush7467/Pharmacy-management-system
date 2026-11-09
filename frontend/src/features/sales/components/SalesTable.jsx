import React from 'react';
import {
  Receipt,
  Eye,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Banknote,
  CreditCard,
  QrCode,
  Layers
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
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function SalesTable({ sales, isLoading, onViewReceipt }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="default" className="bg-brand-primary/15 text-brand-primary border border-brand-primary/30 font-bold">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      case 'REFUNDED_PARTIAL':
        return (
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
            <RotateCcw className="w-3 h-3 mr-1" /> Partial Refund
          </Badge>
        );
      case 'REFUNDED_FULL':
        return (
          <Badge variant="outline" className="text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 font-bold">
            <RotateCcw className="w-3 h-3 mr-1" /> Fully Refunded
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="text-text-muted border-surface line-through font-bold">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline" className="font-bold">{status}</Badge>;
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
    <Card className="bg-surface-card border-surface shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-surface">
        <CardTitle className="text-base font-bold text-text-primary flex items-center justify-between">
          <span>Fiscal Invoices Directory</span>
          <span className="text-xs font-semibold text-text-muted font-mono">{sales.length} record(s)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <p className="text-sm font-medium">Loading sales ledger...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="py-16 text-center text-text-muted">
            <Receipt className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
            <p className="font-bold text-base text-text-primary">No sales records found</p>
            <p className="text-xs text-text-muted mt-1">Process a transaction in the POS Checkout view.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-surface hover:bg-transparent bg-surface-page/50">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Invoice Number</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Date & Time</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Customer</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Payment</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right">Grand Total</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id} className="border-surface hover:bg-surface-page/60 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-brand-primary">
                      {sale.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs text-text-muted font-medium">
                      {formatDate(sale.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-text-primary">{sale.customerName}</div>
                      {sale.customerPhone && (
                        <div className="text-xs text-text-muted font-mono">{sale.customerPhone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-xs font-bold text-text-primary">
                        {getPaymentIcon(sale.paymentMethod)}
                        {sale.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-black text-sm text-text-primary font-mono">
                      {formatCurrency(sale.totalAmount)}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(sale.status)}</TableCell>
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 font-bold gap-1 cursor-pointer rounded-lg"
                        onClick={() => onViewReceipt(sale.id)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
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
  );
}
