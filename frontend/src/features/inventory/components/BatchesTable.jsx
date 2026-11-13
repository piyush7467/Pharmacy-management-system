import React, { useState, useMemo } from 'react';
import {
  Boxes,
  CheckCircle2,
  Clock,
  XCircle,
  SlidersHorizontal,
  Loader2
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

export function BatchesTable({
  batches = [],
  isLoading,
  onOpenAdjustment,
  canAdjustStock
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [batches.length]);

  const paginatedBatches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return batches.slice(start, start + pageSize);
  }, [batches, currentPage, pageSize]);

  const getExpiryBadge = (batch) => {
    if (batch.expiryStatus === 'EXPIRED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" /> Expired
        </span>
      );
    }
    if (batch.expiryStatus === 'NEAR_EXPIRY') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
          <Clock className="w-3 h-3" /> &lt; {batch.daysToExpiry}d left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> {batch.daysToExpiry}d valid
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Active
          </span>
        );
      case 'DEPLETED':
        return (
          <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            Depleted (0)
          </span>
        );
      case 'QUARANTINED':
        return (
          <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            Quarantined
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-block text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
            Expired
          </span>
        );
      default:
        return <Badge variant="outline" className="text-[11px] font-medium text-slate-700 bg-slate-50 border-slate-200">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-surface-card border-surface shadow-xs overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-surface">
        <CardTitle className="text-base font-semibold text-text-primary flex items-center justify-between">
          <span>Pharmaceutical Lots & FEFO Allocation Ledger</span>
          <span className="text-xs font-medium text-text-muted tabular-nums">
            {batches.length} total batch lot(s)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-20 text-center text-text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <p className="text-sm font-medium">Loading inventory batches...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="py-20 text-center text-text-muted">
            <Boxes className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
            <p className="font-semibold text-base text-text-primary">No inventory batches found</p>
            <p className="text-xs text-text-muted mt-1">Receive shipments in the Purchases module to create lots.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/90 hover:bg-slate-50/90 text-slate-500">
                  <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-slate-500">Batch Lot #</TableHead>
                  <TableHead className="min-w-[220px] text-xs font-semibold uppercase tracking-wider text-slate-500">Medicine Name</TableHead>
                  <TableHead className="w-40 text-xs font-semibold uppercase tracking-wider text-slate-500">Expiry Horizon</TableHead>
                  <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Available Stock</TableHead>
                  <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Cost Price</TableHead>
                  <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Sale MRP</TableHead>
                  <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Lot Status</TableHead>
                  <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBatches.map((batch) => (
                  <TableRow key={batch.id} className="border-surface/60 hover:bg-surface-page/70 transition-colors">
                    {/* Batch Number */}
                    <TableCell className="w-36 align-middle font-mono font-semibold text-xs text-brand-primary">
                      <code className="px-2 py-1 rounded bg-surface-page border border-surface font-mono font-medium text-xs text-text-primary">
                        {batch.batchNumber}
                      </code>
                    </TableCell>

                    {/* Medicine Name */}
                    <TableCell className="min-w-[220px] align-middle">
                      <div className="font-semibold text-sm text-text-primary">{batch.medicine?.name}</div>
                      <div className="text-xs text-text-muted font-mono mt-0.5">
                        {batch.medicine?.sku} {batch.medicine?.strength ? `• ${batch.medicine.strength}` : ''} {batch.medicine?.dosageForm ? `• ${batch.medicine.dosageForm}` : ''}
                      </div>
                    </TableCell>

                    {/* Expiry Horizon */}
                    <TableCell className="w-40 align-middle">
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-medium text-text-primary">
                          {formatDate(batch.expiryDate)}
                        </div>
                        {getExpiryBadge(batch)}
                      </div>
                    </TableCell>

                    {/* Available Stock */}
                    <TableCell className="w-36 align-middle text-right">
                      <div className="font-mono font-semibold text-sm text-text-primary tabular-nums">
                        {batch.currentQuantity} <span className="text-xs font-sans text-text-muted font-normal">units</span>
                      </div>
                      <span className="text-[11px] text-text-muted block tabular-nums">
                        of {batch.initialQuantity} rcvd
                      </span>
                    </TableCell>

                    {/* Cost Price */}
                    <TableCell className="w-28 align-middle text-right font-mono text-xs text-text-muted font-medium tabular-nums">
                      {formatCurrency(batch.purchaseCost)}
                    </TableCell>

                    {/* Sale MRP */}
                    <TableCell className="w-28 align-middle text-right font-mono font-semibold text-xs text-text-primary tabular-nums">
                      {formatCurrency(batch.salePrice)}
                    </TableCell>

                    {/* Lot Status */}
                    <TableCell className="w-28 align-middle text-center">
                      {getStatusBadge(batch.status)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="w-28 align-middle text-right pr-4">
                      {canAdjustStock && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-text-muted hover:text-brand-primary hover:border-brand-primary/40 font-medium gap-1.5 cursor-pointer rounded-lg text-xs"
                          onClick={() => onOpenAdjustment(batch)}
                          title="Record Stock Adjustment"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Adjust</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && batches.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={batches.length}
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
