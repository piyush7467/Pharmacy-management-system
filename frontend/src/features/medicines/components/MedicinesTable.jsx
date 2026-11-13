import React, { useState, useMemo } from 'react';
import {
  Pill,
  Edit2,
  Trash2,
  Boxes,
  Loader2,
  Info,
  ChevronRight,
  Layers,
  CheckCircle2,
  XCircle,
  Tag
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '../../../components/ui/tooltip.jsx';
import { TablePagination } from '../../../components/ui/table-pagination.jsx';
import { formatDate } from '../../../lib/utils.js';

export function MedicinesTable({
  medicines = [],
  isLoading,
  onEdit,
  onViewBatches,
  onDelete,
  canManageMedicines
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Reset to page 1 if medicines array changes (e.g. on filter/search)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [medicines.length]);

  // Paginated slice
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return medicines.slice(start, start + pageSize);
  }, [medicines, currentPage, pageSize]);

  return (
    <TooltipProvider>
      <Card className="bg-surface-card border-surface shadow-xs overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-surface">
          <CardTitle className="text-base font-semibold text-text-primary flex items-center justify-between">
            <span>Formulations & Master Pharmaceutical Index</span>
            <span className="text-xs font-medium text-text-muted tabular-nums">
              {medicines.length} total medicine(s)
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center text-text-muted flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <p className="text-sm font-medium">Loading medicines catalogue...</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="py-20 text-center text-text-muted">
              <Pill className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
              <p className="font-semibold text-base text-text-primary">No medicines found</p>
              <p className="text-xs text-text-muted mt-1">Register new drug formulations or adjust your search filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/90 hover:bg-slate-50/90">
                    <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-slate-500">SKU / Code</TableHead>
                    <TableHead className="min-w-[240px] text-xs font-semibold uppercase tracking-wider text-slate-500">Medicine &amp; Formulation</TableHead>
                    <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-slate-500">Category &amp; Classes</TableHead>
                    <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-slate-500">Earliest Batch</TableHead>
                    <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Available Stock</TableHead>
                    <TableHead className="w-24 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Status</TableHead>
                    <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMedicines.map((med) => {
                    const stock = med.totalAvailableStock || 0;
                    const reorder = med.minReorderLevel || 20;
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock > 0 && stock <= reorder;

                    const therapeuticClasses = Array.isArray(med.therapeuticClasses)
                      ? med.therapeuticClasses.filter(Boolean)
                      : [];

                    const hasExtraClasses = therapeuticClasses.length > 1;
                    const displayedClasses = therapeuticClasses.slice(0, 1);
                    const remainingClasses = therapeuticClasses.slice(1);

                    const fullComposition = [
                      med.genericName,
                      med.dosageForm,
                      med.strength ? `(${med.strength})` : '',
                      med.packageUnit
                    ]
                      .filter(Boolean)
                      .join(' • ');

                    return (
                      <TableRow key={med.id} className="border-surface/60 hover:bg-surface-page/70 transition-colors">
                        {/* 1. SKU / Code */}
                        <TableCell className="w-36 align-middle">
                          <code className="px-2 py-1 rounded-md bg-surface-page border border-surface font-mono font-medium text-xs text-text-primary tracking-tight block w-fit truncate">
                            {med.sku}
                          </code>
                        </TableCell>

                        {/* 2. Medicine Name & Formulation with Detailed Popover for long formulas */}
                        <TableCell className="min-w-[240px] align-middle">
                          <div className="font-semibold text-sm text-text-primary leading-tight">
                            {med.name}
                          </div>

                          {fullComposition ? (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs text-text-muted truncate max-w-[280px]">
                                {fullComposition}
                              </span>

                              {fullComposition.length > 35 && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-text-muted hover:text-brand-primary p-0.5 rounded cursor-pointer shrink-0 transition-colors"
                                      title="View complete formulation details"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 p-3 text-xs space-y-2 shadow-xl" align="start">
                                    <div className="font-semibold text-sm text-text-primary border-b border-surface pb-1.5 flex items-center justify-between">
                                      <span>{med.name}</span>
                                      <span className="font-mono text-[11px] text-text-muted">{med.sku}</span>
                                    </div>
                                    <div className="space-y-1.5 text-text-muted">
                                      {med.genericName && (
                                        <div>
                                          <span className="font-semibold text-text-primary block">Active Salt / Generic:</span>
                                          <span>{med.genericName}</span>
                                        </div>
                                      )}
                                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface/60">
                                        <div>
                                          <span className="font-semibold text-text-primary block">Form:</span>
                                          <span>{med.dosageForm || 'Oral'}</span>
                                        </div>
                                        <div>
                                          <span className="font-semibold text-text-primary block">Strength:</span>
                                          <span>{med.strength || 'Standard'}</span>
                                        </div>
                                      </div>
                                      {med.packageUnit && (
                                        <div className="pt-1 border-t border-surface/60">
                                          <span className="font-semibold text-text-primary block">Package Unit:</span>
                                          <span>{med.packageUnit}</span>
                                        </div>
                                      )}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted mt-0.5 block italic">Standard formulation</span>
                          )}
                        </TableCell>

                        {/* 3. Category & Interactive Therapeutic Classes Popover */}
                        <TableCell className="min-w-[200px] align-middle">
                          <div className="space-y-1.5">
                            <div className="font-medium text-xs text-text-primary">
                              {med.category?.name || 'General Category'}
                            </div>

                            {therapeuticClasses.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {displayedClasses.map((cls) => (
                                  <span
                                    key={cls}
                                    className="text-[11px] px-2 py-0.5 rounded-md bg-surface-muted text-text-secondary border border-surface font-medium truncate max-w-[150px]"
                                    title={cls}
                                  >
                                    {cls}
                                  </span>
                                ))}

                                {hasExtraClasses && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        type="button"
                                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/25 hover:bg-brand-primary/20 hover:border-brand-primary/40 transition-colors cursor-pointer flex items-center gap-0.5 shadow-2xs"
                                        title={`Click to view all ${therapeuticClasses.length} therapeutic classes`}
                                      >
                                        <span>+{remainingClasses.length}</span>
                                        <span className="text-[10px]">more</span>
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-72 p-3 text-xs shadow-xl" align="start">
                                      <div className="font-semibold text-xs text-text-primary border-b border-surface pb-1.5 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                          <Tag className="w-3.5 h-3.5 text-brand-primary" />
                                          <span>Therapeutic Classes ({therapeuticClasses.length})</span>
                                        </span>
                                      </div>
                                      <div className="mt-2.5 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                                        {therapeuticClasses.map((tag, idx) => (
                                          <span
                                            key={idx}
                                            className="text-xs px-2.5 py-1 rounded-md bg-surface-muted text-text-primary border border-surface font-medium"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                      <div className="mt-2.5 pt-2 border-t border-surface/60 text-[11px] text-text-muted">
                                        Category: <strong className="text-text-primary font-semibold">{med.category?.name || 'General'}</strong>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* 4. Earliest FEFO Batch */}
                        <TableCell className="w-36 align-middle font-mono text-xs">
                          {med.earliestBatch ? (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-text-primary block truncate">
                                {med.earliestBatch}
                              </span>
                              {med.earliestExpiry ? (
                                <span className="text-[11px] text-text-muted block">
                                  Exp: {formatDate(med.earliestExpiry)}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted/60">—</span>
                          )}
                        </TableCell>

                        {/* 5. Available Stock - Right aligned, Tabular numerals */}
                        <TableCell className="w-36 align-middle text-right">
                          <div className="font-mono text-sm font-semibold tabular-nums text-text-primary">
                            {stock}{' '}
                            <span className="text-xs font-sans text-text-muted font-normal">units</span>
                          </div>
                          <div className="mt-0.5 flex justify-end">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                Out of stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                                Low stock ({stock})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                In stock
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* 6. Status */}
                        <TableCell className="w-24 align-middle text-center">
                          {med.isActive ? (
                            <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="inline-block text-[11px] font-medium text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full line-through">
                              Inactive
                            </span>
                          )}
                        </TableCell>

                        {/* 7. Compact Actions */}
                        <TableCell className="w-32 align-middle text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs font-semibold gap-1 text-text-muted hover:text-brand-primary hover:border-brand-primary/40 rounded-lg cursor-pointer"
                              onClick={() => onViewBatches(med)}
                              title="View batch lots for this medicine"
                            >
                              <Boxes className="w-3.5 h-3.5 text-brand-primary" />
                              <span>Lots{med.activeBatchesCount ? ` (${med.activeBatchesCount})` : ''}</span>
                            </Button>

                            {canManageMedicines && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-text-muted hover:text-brand-primary hover:bg-surface-muted cursor-pointer rounded-md"
                                  onClick={() => onEdit(med)}
                                  title="Edit Formulation"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-text-muted hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer rounded-md"
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Clean Pagination Footer */}
          {!isLoading && medicines.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={medicines.length}
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
    </TooltipProvider>
  );
}
