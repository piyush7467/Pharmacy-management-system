import React from 'react';
import { RotateCcw, PackageCheck, AlertTriangle } from 'lucide-react';
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

export function ReturnDetailsModal({ returnData, open, onOpenChange }) {
  if (!returnData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-surface-card border-surface shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary flex items-center justify-between">
            <span>Credit Note #{returnData.returnNumber}</span>
            <Badge variant="outline" className="font-bold border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10">
              REFUND ISSUED
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Auditable customer return record and inventory restitution details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Metadata Grid */}
          <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-text-muted block font-bold">Original Invoice:</span>
                <span className="font-mono font-bold text-brand-primary">{returnData.sale?.invoiceNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-text-muted block font-bold">Processed On:</span>
                <span className="font-medium">{formatDate(returnData.createdAt)}</span>
              </div>
              <div>
                <span className="text-text-muted block font-bold">Customer:</span>
                <span className="font-bold text-text-primary">{returnData.sale?.customerName || 'Walk-in Customer'}</span>
              </div>
              <div className="text-right">
                <span className="text-text-muted block font-bold">Authorized By:</span>
                <span className="font-bold text-text-primary">
                  {returnData.processedByUser?.fullName} ({returnData.processedByUser?.role})
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-surface">
              <span className="text-text-muted block font-bold">Mandatory Reason on Record:</span>
              <p className="text-text-primary font-medium mt-0.5 italic bg-surface-card p-2 rounded-lg border border-surface">
                "{returnData.reason}"
              </p>
            </div>
          </div>

          {/* Returned Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Returned Items Breakdown
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {returnData.items?.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-surface bg-surface-card flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-text-primary block truncate">
                      {item.saleItem?.medicine?.name || 'Medicine'}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">
                      Batch: {item.saleItem?.batch?.batchNumber || 'N/A'} • Qty: {item.quantity}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        item.disposition === 'RESTOCKED'
                          ? 'border-brand-primary/30 text-brand-primary bg-brand-primary/10'
                          : 'border-rose-500/30 text-rose-600 bg-rose-500/10'
                      }`}
                    >
                      {item.disposition === 'RESTOCKED' ? 'Restocked (Saleable)' : 'Damaged / Discarded'}
                    </Badge>

                    <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(item.refundAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Refund Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-page border border-surface">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Total Refund Disbursed:
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {formatCurrency(returnData.refundAmount)}
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-surface font-bold cursor-pointer w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
