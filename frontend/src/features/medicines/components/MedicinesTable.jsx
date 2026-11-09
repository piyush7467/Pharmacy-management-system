import React from 'react';
import {
  Pill,
  Edit2,
  Trash2,
  Boxes,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle
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
import { formatDate } from '../../../lib/utils.js';

export function MedicinesTable({
  medicines = [],
  isLoading,
  onEdit,
  onViewBatches,
  onDelete,
  canManageMedicines
}) {
  const getStockBadge = (medicine) => {
    const stock = medicine.totalAvailableStock || 0;
    const reorder = medicine.minReorderLevel || 20;

    if (stock === 0) {
      return (
        <Badge variant="outline" className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs">
          Out of Stock
        </Badge>
      );
    }
    if (stock <= reorder) {
      return (
        <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold text-xs">
          Low Stock ({stock})
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-brand-primary/15 text-brand-primary border border-brand-primary/30 font-bold text-xs">
        {stock} in stock
      </Badge>
    );
  };

  return (
    <Card className="bg-surface-card border-surface shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-surface">
        <CardTitle className="text-base font-bold text-text-primary flex items-center justify-between">
          <span>Formulations & Master Pharmaceutical Index</span>
          <span className="text-xs font-semibold text-text-muted font-mono">{medicines.length} medicine(s)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <p className="text-sm font-medium">Loading medicines catalogue...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="py-16 text-center text-text-muted">
            <Pill className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
            <p className="font-bold text-base text-text-primary">No medicines found</p>
            <p className="text-xs text-text-muted mt-1">Register new drug formulations or adjust your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-surface hover:bg-transparent bg-surface-page/50">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">SKU / Code</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Medicine Name & Formulation</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Category</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Earliest FEFO Batch</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right">Available Stock</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((med) => (
                  <TableRow key={med.id} className="border-surface hover:bg-surface-page/60 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-brand-primary">
                      {med.sku}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-text-primary">{med.name}</div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {med.genericName && <span>{med.genericName} • </span>}
                        <span>{med.dosageForm || 'Oral'}</span>
                        {med.strength && <span> ({med.strength})</span>}
                        {med.packageUnit && <span> • {med.packageUnit}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="font-bold text-xs border-surface bg-surface-page text-text-primary">
                          {med.category?.name || 'General'}
                        </Badge>
                        {Array.isArray(med.therapeuticClasses) && med.therapeuticClasses.length > 0 && (
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {med.therapeuticClasses.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-muted text-text-secondary border border-surface font-medium truncate"
                              >
                                {tag}
                              </span>
                            ))}
                            {med.therapeuticClasses.length > 2 && (
                              <span className="text-[10px] text-text-muted font-mono" title={med.therapeuticClasses.join(', ')}>
                                +{med.therapeuticClasses.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {med.earliestBatch ? (
                        <div className="space-y-0.5 font-mono text-xs">
                          <span className="font-bold text-text-primary block">{med.earliestBatch}</span>
                          {med.earliestExpiry && (
                            <span className="text-[11px] text-text-muted">
                              Exp: {formatDate(med.earliestExpiry)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted italic">No active lots</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStockBadge(med)}
                    </TableCell>
                    <TableCell className="text-center">
                      {med.isActive ? (
                        <Badge variant="default" className="bg-brand-primary/15 text-brand-primary border border-brand-primary/30 font-bold text-[11px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-text-muted border-surface line-through font-bold text-[11px]">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 font-bold gap-1 cursor-pointer rounded-lg text-xs"
                          onClick={() => onViewBatches(med)}
                          title="View Inventory Lots"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span>Lots ({med.activeBatchesCount || 0})</span>
                        </Button>

                        {canManageMedicines && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 cursor-pointer rounded-lg"
                              onClick={() => onEdit(med)}
                              title="Edit Formulation"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer rounded-lg"
                              onClick={() => onDelete(med)}
                              title="Delete Formulation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
