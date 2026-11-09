import React from 'react';
import { Printer, CheckCircle2, RotateCcw, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function SaleDetailsModal({ sale, open, onOpenChange }) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-surface-card border-surface shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary flex items-center justify-between">
            <span>Invoice #{sale.invoiceNumber}</span>
            <Badge variant="outline" className="font-bold border-brand-primary/30 text-brand-primary">
              {sale.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Complete itemized tax breakdown and batch deduction logs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Printable Receipt Paper Container */}
          <div
            id="thermal-receipt-print-area"
            className="p-5 rounded-xl border border-surface bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs space-y-3 shadow-inner"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-zinc-300 dark:border-zinc-700 space-y-1">
              <h2 className="text-base font-black tracking-tight uppercase">PharmaFlow Pharmacy</h2>
              <p className="text-[11px] text-zinc-500">Official Fiscal Receipt</p>
              <p className="text-[11px] text-zinc-500 font-bold">TAX INVOICE #{sale.invoiceNumber}</p>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
              <div>
                <span className="block text-zinc-400 font-bold">Date:</span>
                <span>{formatDate(sale.createdAt)}</span>
              </div>
              <div className="text-right">
                <span className="block text-zinc-400 font-bold">Cashier:</span>
                <span>{sale.cashier?.fullName || 'Staff'}</span>
              </div>
              <div>
                <span className="block text-zinc-400 font-bold">Customer:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{sale.customerName}</span>
                {sale.customerPhone && <span className="block text-[10px]">{sale.customerPhone}</span>}
              </div>
              <div className="text-right">
                <span className="block text-zinc-400 font-bold">Payment Method:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{sale.paymentMethod}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 py-1">
              <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                <span className="col-span-6 uppercase">Item (Batch #)</span>
                <span className="col-span-2 text-center uppercase">Qty</span>
                <span className="col-span-2 text-right uppercase">Price</span>
                <span className="col-span-2 text-right uppercase">Total</span>
              </div>
              {sale.items?.map((item) => (
                <div key={item.id} className="grid grid-cols-12 text-[11px] py-0.5">
                  <div className="col-span-6">
                    <span className="font-semibold block truncate">{item.medicine?.name}</span>
                    <span className="text-[9px] text-zinc-500 block">
                      Lot: {item.batch?.batchNumber || 'N/A'} • Exp: {item.batch?.expiryDate ? formatDate(item.batch.expiryDate) : 'N/A'}
                    </span>
                  </div>
                  <span className="col-span-2 text-center font-bold">{item.quantity}</span>
                  <span className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</span>
                  <span className="col-span-2 text-right font-black">{formatCurrency(item.totalAmount)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-dashed border-zinc-300 dark:border-zinc-700 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal (Items):</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST 12%):</span>
                <span>{formatCurrency(sale.taxAmount)}</span>
              </div>
              {Number(sale.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Discount Savings:</span>
                  <span>-{formatCurrency(sale.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black pt-1.5 border-t border-zinc-300 dark:border-zinc-700">
                <span>GRAND TOTAL:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(sale.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-surface font-bold cursor-pointer"
            >
              Close
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold gap-2 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
