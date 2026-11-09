import React, { useState, useRef } from 'react';
import { Printer, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function ThermalInvoiceModal({ open, onOpenChange, completedSale, shopProfile, user }) {
  const [activePrintFormat, setActivePrintFormat] = useState('80mm');
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  if (!completedSale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b border-surface bg-surface-card">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Checkout Complete</span>
              </div>
              {/* Receipt Format Switcher */}
              <div className="flex items-center gap-1 bg-surface-muted p-0.5 rounded-lg text-xs">
                {['80mm', '58mm', 'A4'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setActivePrintFormat(fmt)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      activePrintFormat === fmt
                        ? 'bg-surface-card font-bold text-brand-primary shadow-xs'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Invoice #{completedSale.invoiceNumber} recorded in ledger.
            </DialogDescription>
          </DialogHeader>

          {/* Thermal Slip Paper Display */}
          <div className="flex-1 overflow-y-auto max-h-[66vh] p-4 bg-zinc-100 dark:bg-zinc-900/60">
            <div
              ref={printRef}
              id="thermal-receipt-print-area"
              className="mx-auto bg-white text-zinc-950 p-4 font-mono shadow-md border border-zinc-300 rounded-sm space-y-2.5 select-text"
              style={{
                width:
                  activePrintFormat === '58mm'
                    ? '54mm'
                    : activePrintFormat === 'A4'
                    ? '100%'
                    : '76mm',
                fontSize: activePrintFormat === '58mm' ? '11px' : '12.5px'
              }}
            >
              {/* Shop Branding */}
              <div className="text-center pb-2 border-b border-dashed border-zinc-400">
                <h2 className="font-black text-[15px] tracking-tight uppercase">
                  {shopProfile?.pharmacyName || 'PharmaFlow Pharmacy'}
                </h2>
                <p className="text-[10px] text-zinc-600 font-sans mt-0.5">
                  {shopProfile?.tagline}
                </p>
                <p className="text-[9.5px] text-zinc-500 font-sans mt-0.5">
                  {shopProfile?.address}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  Ph: {shopProfile?.phone}
                </p>
                <p className="text-[9.5px] text-zinc-500 mt-0.5">
                  DL: {shopProfile?.licenseNumber} • GST: {shopProfile?.taxNumber}
                </p>
              </div>

              {/* Invoice Metadata */}
              <div className="text-[11px] space-y-0.5 pb-2 border-b border-dashed border-zinc-400 text-zinc-700">
                <div className="flex justify-between">
                  <span className="font-bold text-zinc-950">TAX INVOICE</span>
                  <span className="font-black text-zinc-950">#{completedSale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formatDate(completedSale.createdAt || new Date())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-semibold text-zinc-950 truncate max-w-[150px]">
                    {completedSale.customerName}
                  </span>
                </div>
                {completedSale.customerPhone && (
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{completedSale.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{completedSale.cashier?.fullName || user?.fullName || 'Cashier'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="font-bold uppercase text-zinc-950">{completedSale.paymentMethod}</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-1.5 py-1">
                <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-zinc-300 pb-1">
                  <span className="col-span-6">Item / Batch</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Price</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>

                {completedSale.items?.map((item, idx) => (
                  <div key={item.id || idx} className="text-[11.5px] py-1 border-b border-dotted border-zinc-200">
                    <div className="font-bold text-zinc-950 leading-tight">
                      {item.medicine?.name || item.name}
                    </div>
                    <div className="grid grid-cols-12 items-baseline text-[10.5px] text-zinc-600 mt-0.5">
                      <span className="col-span-6 text-[9.5px]">
                        Lot:{item.batch?.batchNumber || 'EARLY'} Exp:{formatDate(item.batch?.expiryDate || new Date())}
                      </span>
                      <span className="col-span-2 text-center font-bold text-zinc-950">
                        {item.quantity}
                      </span>
                      <span className="col-span-2 text-right">
                        {formatCurrency(item.unitPrice)}
                      </span>
                      <span className="col-span-2 text-right font-black text-zinc-950">
                        {formatCurrency(item.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="pt-2 border-t border-dashed border-zinc-400 space-y-1 text-[12px]">
                <div className="flex justify-between text-zinc-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(completedSale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-700">
                  <span>Tax (GST/VAT):</span>
                  <span className="font-semibold">{formatCurrency(completedSale.taxAmount)}</span>
                </div>
                {completedSale.discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Discount Savings:</span>
                    <span>-{formatCurrency(completedSale.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[16px] font-black pt-1.5 border-t-2 border-zinc-950 mt-1 text-zinc-950">
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(completedSale.totalAmount)}</span>
                </div>
                {completedSale.discountAmount > 0 && (
                  <div className="text-center py-1 bg-zinc-100 text-zinc-800 rounded font-bold text-[10.5px] mt-1 border border-zinc-300">
                    *** YOU SAVED {formatCurrency(completedSale.discountAmount)} ***
                  </div>
                )}
              </div>

              {/* Footer Policy & Scannable Barcode */}
              <div className="text-center pt-2 border-t border-dashed border-zinc-400 space-y-1">
                <p className="text-[10.5px] text-zinc-600 leading-tight">
                  {shopProfile?.returnPolicy || 'Medicines once sold cannot be returned without original receipt within 7 days.'}
                </p>
                <p className="text-[11px] font-semibold text-zinc-800">
                  {shopProfile?.receiptFooter || 'Thank you for choosing PharmaFlow! Wishing you good health.'}
                </p>
                <div className="flex flex-col items-center justify-center pt-1.5">
                  <div className="h-7 w-48 bg-zinc-950 rounded-xs flex items-center justify-center text-[10px] text-white font-mono font-bold tracking-widest">
                    *{completedSale.invoiceNumber}*
                  </div>
                  <span className="text-[9.5px] text-zinc-500 font-mono mt-0.5">
                    SCAN FOR RETURNS / AUDIT
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-3 border-t border-surface bg-surface-card flex items-center justify-between sm:justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-brand-primary text-white font-semibold gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print Thermal Slip
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
