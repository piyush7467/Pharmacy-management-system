import React, { useState, useMemo } from 'react';
import {
  Truck,
  Eye,
  PackageCheck,
  XCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Building2,
  Package,
  FileText,
  Phone
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '../../../components/ui/popover.jsx';
import { TablePagination } from '../../../components/ui/table-pagination.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function PurchasesTable({
  purchases = [],
  isLoading,
  onViewDetails,
  onReceiveGoods,
  onCancelPurchase,
  canManagePurchases
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [purchases.length]);

  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return purchases.slice(start, start + pageSize);
  }, [purchases, currentPage, pageSize]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary bg-brand-primary/10 border border-brand-primary/25 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Received & Stocked
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Pending Delivery
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted border border-surface px-2.5 py-0.5 rounded-full line-through">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return <Badge variant="outline" className="text-[11px]">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-surface-card border-surface shadow-xs overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-surface">
        <CardTitle className="text-base font-semibold text-text-primary flex items-center justify-between">
          <span>Supplier Purchase Orders & GRN Register</span>
          <span className="text-xs font-medium text-text-muted tabular-nums">
            {purchases.length} total order(s)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-20 text-center text-text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <p className="text-sm font-medium">Loading purchases ledger...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="py-20 text-center text-text-muted">
            <Truck className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
            <p className="font-semibold text-base text-text-primary">No purchase orders found</p>
            <p className="text-xs text-text-muted mt-1">Create a purchase order to receive stock from pharmaceutical distributors.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-surface bg-surface-muted/40 hover:bg-surface-muted/40">
                  <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-text-muted">PO Number</TableHead>
                  <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-text-muted">Order Date</TableHead>
                  <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-text-muted">Supplier Details</TableHead>
                  <TableHead className="min-w-[220px] text-xs font-semibold uppercase tracking-wider text-text-muted">Ordered Items</TableHead>
                  <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">Grand Total</TableHead>
                  <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-text-muted text-center">Status</TableHead>
                  <TableHead className="w-40 text-xs font-semibold uppercase tracking-wider text-text-muted text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPurchases.map((purchase) => {
                  const items = Array.isArray(purchase.items) ? purchase.items : [];
                  const firstItem = items[0];
                  const hasMultipleItems = items.length > 1;

                  return (
                    <TableRow key={purchase.id} className="border-surface/60 hover:bg-surface-page/70 transition-colors">
                      {/* PO Number */}
                      <TableCell className="w-36 align-middle font-mono font-semibold text-xs text-brand-primary">
                        <code className="px-2 py-1 rounded bg-surface-page border border-surface font-mono font-medium text-xs text-text-primary block w-fit">
                          {purchase.purchaseNumber}
                        </code>
                      </TableCell>

                      {/* Order Date */}
                      <TableCell className="w-32 align-middle text-xs text-text-muted font-medium">
                        {formatDate(purchase.orderedDate || purchase.createdAt)}
                      </TableCell>

                      {/* Supplier Details */}
                      <TableCell className="min-w-[200px] align-middle">
                        <div className="flex items-center gap-1.5 font-semibold text-sm text-text-primary">
                          <Building2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                          <span className="truncate max-w-[200px]">{purchase.supplier?.name || 'Unknown Supplier'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                          {purchase.supplier?.contactPerson && (
                            <span className="truncate max-w-[140px]">Rep: {purchase.supplier.contactPerson}</span>
                          )}
                          {purchase.supplier?.phone && (
                            <span className="flex items-center gap-0.5 font-mono text-[11px]">
                              <Phone className="w-2.5 h-2.5" />
                              {purchase.supplier.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Ordered Items with Interactive Popover */}
                      <TableCell className="min-w-[220px] align-middle">
                        {items.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-medium text-text-primary truncate max-w-[150px]" title={firstItem?.medicine?.name}>
                                {firstItem?.medicine?.name || 'Line Item 1'}
                              </span>
                              <span className="text-[11px] font-mono text-text-muted">
                                ({firstItem?.orderedQuantity} qty)
                              </span>

                              {hasMultipleItems && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/25 hover:bg-brand-primary/20 hover:border-brand-primary/40 transition-colors cursor-pointer flex items-center gap-0.5 shadow-2xs"
                                      title={`Click to view all ${items.length} ordered line items`}
                                    >
                                      <span>+{items.length - 1}</span>
                                      <span className="text-[10px]">more</span>
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 p-3 text-xs shadow-xl" align="start">
                                    <div className="font-semibold text-xs text-text-primary border-b border-surface pb-1.5 flex items-center justify-between">
                                      <span className="flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5 text-brand-primary" />
                                        <span>Order Items ({items.length})</span>
                                      </span>
                                      <span className="font-mono text-[11px] text-text-muted">{purchase.purchaseNumber}</span>
                                    </div>
                                    <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
                                      {items.map((it, idx) => (
                                        <div key={idx} className="p-2 rounded-md bg-surface-muted/60 border border-surface space-y-1">
                                          <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
                                            <span className="truncate max-w-[180px]">{it.medicine?.name || 'Formulation'}</span>
                                            <span className="font-mono tabular-nums">{formatCurrency(it.lineTotal || 0)}</span>
                                          </div>
                                          <div className="flex items-center justify-between text-[11px] text-text-muted font-mono">
                                            <span>Batch: {it.batchNumber || '—'}</span>
                                            <span>{it.orderedQuantity} ordered @ {formatCurrency(it.unitCost || 0)}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-2.5 pt-2 border-t border-surface flex items-center justify-between font-semibold text-xs text-text-primary">
                                      <span>Order Subtotal:</span>
                                      <span className="font-mono">{formatCurrency(purchase.subtotal || purchase.grandTotal)}</span>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>

                            {purchase.notes && (
                              <div className="flex items-center gap-1 text-[11px] text-text-muted italic truncate max-w-[200px]">
                                <FileText className="w-3 h-3 text-text-muted/60 shrink-0" />
                                <span>{purchase.notes}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-text-muted font-mono">
                            {purchase.itemsCount ?? 0} line item(s)
                          </div>
                        )}
                      </TableCell>

                      {/* Grand Total */}
                      <TableCell className="w-32 align-middle text-right font-mono font-semibold text-sm text-text-primary tabular-nums">
                        {formatCurrency(purchase.grandTotal)}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="w-36 align-middle text-center">
                        {getStatusBadge(purchase.status)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="w-40 align-middle text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-text-muted hover:text-brand-primary hover:border-brand-primary/40 font-medium gap-1 cursor-pointer rounded-lg text-xs"
                            onClick={() => onViewDetails(purchase)}
                            title="Inspect purchase details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Button>

                          {purchase.status === 'DRAFT' && canManagePurchases && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 px-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium gap-1 cursor-pointer rounded-lg text-xs shadow-2xs"
                                onClick={() => onReceiveGoods(purchase)}
                                title="Receive goods into inventory"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>Receive</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer rounded-md"
                                onClick={() => onCancelPurchase(purchase.id)}
                                title="Cancel Purchase Order"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && purchases.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={purchases.length}
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
