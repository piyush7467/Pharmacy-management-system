import React from 'react';
import {
  Boxes,
  CheckCircle2,
  Clock,
  XCircle,
  SlidersHorizontal,
  Loader2,
  Building2
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

export function BatchesTable({
  batches,
  isLoading,
  onOpenAdjustment,
  canAdjustStock
}) {
  const getExpiryBadge = (batch) => {
    if (batch.expiryStatus === 'EXPIRED') {
      return (
        <Badge variant="outline" className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs">
          <XCircle className="w-3 h-3 mr-1" /> Expired
        </Badge>
      );
    }
    if (batch.expiryStatus === 'NEAR_EXPIRY') {
      return (
        <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold text-xs">
          <Clock className="w-3 h-3 mr-1" /> &lt; {batch.daysToExpiry}d left
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-brand-primary/15 text-brand-primary border border-brand-primary/30 font-bold text-xs">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Valid ({batch.daysToExpiry}d)
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="default" className="bg-brand-primary/15 text-brand-primary border border-brand-primary/30 font-bold">
            Active
          </Badge>
        );
      case 'DEPLETED':
        return (
          <Badge variant="outline" className="text-text-muted border-surface font-bold">
            Depleted (0)
          </Badge>
        );
      case 'QUARANTINED':
        return (
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
            Quarantined
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="outline" className="text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 font-bold">
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-surface-card border-surface shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-surface">
        <CardTitle className="text-base font-bold text-text-primary flex items-center justify-between">
          <span>Pharmaceutical Lots & FEFO Allocation Ledger</span>
          <span className="text-xs font-semibold text-text-muted font-mono">{batches.length} batch lot(s)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <p className="text-sm font-medium">Loading inventory batches...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="py-16 text-center text-text-muted">
            <Boxes className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
            <p className="font-bold text-base text-text-primary">No inventory batches found</p>
            <p className="text-xs text-text-muted mt-1">Receive shipments in the Purchases module to create lots.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-surface hover:bg-transparent bg-surface-page/50">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Batch Lot #</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Medicine Name</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Expiry Horizon</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right">Available Stock</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right">Cost Price</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right">Sale MRP</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-center">Lot Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id} className="border-surface hover:bg-surface-page/60 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-brand-primary">
                      {batch.batchNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-text-primary">{batch.medicine?.name}</div>
                      <div className="text-[11px] text-text-muted font-mono">
                        {batch.medicine?.sku} • {batch.medicine?.strength || ''} {batch.medicine?.dosageForm || ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-medium text-text-primary">
                          {formatDate(batch.expiryDate)}
                        </div>
                        {getExpiryBadge(batch)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-black text-sm text-text-primary">
                        {batch.currentQuantity}
                      </span>
                      <span className="text-[10px] text-text-muted block">
                        of {batch.initialQuantity} rcvd
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-text-muted font-medium">
                      {formatCurrency(batch.purchaseCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-text-primary">
                      {formatCurrency(batch.salePrice)}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(batch.status)}</TableCell>
                    <TableCell className="text-right pr-4">
                      {canAdjustStock && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 font-bold gap-1 cursor-pointer rounded-lg text-xs"
                          onClick={() => onOpenAdjustment(batch)}
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
      </CardContent>
    </Card>
  );
}
