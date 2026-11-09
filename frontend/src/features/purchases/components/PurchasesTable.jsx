import React from 'react';
import {
  Truck,
  Eye,
  PackageCheck,
  XCircle,
  CheckCircle2,
  Clock,
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

export function PurchasesTable({
  purchases,
  isLoading,
  onViewDetails,
  onReceiveGoods,
  onCancelPurchase,
  canManagePurchases
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <Badge variant="default" className="bg-brand-primary/15 text-brand-primary border border-brand-primary/30 font-bold">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Received & Stocked
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
            <Clock className="w-3 h-3 mr-1" /> Pending Delivery
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="text-text-muted border-surface line-through font-bold">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
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
          <span>Supplier Purchase Orders & GRN Register</span>
          <span className="text-xs font-semibold text-text-muted font-mono">{purchases.length} record(s)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <p className="text-sm font-medium">Loading purchases ledger...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="py-16 text-center text-text-muted">
            <Truck className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
            <p className="font-bold text-base text-text-primary">No purchase orders found</p>
            <p className="text-xs text-text-muted mt-1">Create a purchase order to receive stock from pharmaceutical distributors.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-surface hover:bg-transparent bg-surface-page/50">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">PO Number</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Order Date</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Supplier</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-center">Lines</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right">Grand Total</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id} className="border-surface hover:bg-surface-page/60 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-brand-primary">
                      {purchase.purchaseNumber}
                    </TableCell>
                    <TableCell className="text-xs text-text-muted font-medium">
                      {formatDate(purchase.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-text-primary">
                        <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span>{purchase.supplier?.name || 'Unknown Supplier'}</span>
                      </div>
                      {purchase.supplier?.contactPerson && (
                        <div className="text-[11px] text-text-muted">Contact: {purchase.supplier.contactPerson}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-xs text-text-primary">
                      {purchase.items?.length || 0}
                    </TableCell>
                    <TableCell className="text-right font-black text-sm text-text-primary font-mono">
                      {formatCurrency(purchase.grandTotal)}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(purchase.status)}</TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 font-bold gap-1 cursor-pointer rounded-lg text-xs"
                          onClick={() => onViewDetails(purchase)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Button>

                        {purchase.status === 'DRAFT' && canManagePurchases && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 px-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold gap-1 cursor-pointer rounded-lg text-xs shadow-xs"
                              onClick={() => onReceiveGoods(purchase)}
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Receive GRN</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-surface font-bold cursor-pointer rounded-lg text-xs"
                              onClick={() => onCancelPurchase(purchase.id)}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </Button>
                          </>
                        )}
                      </div>
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
