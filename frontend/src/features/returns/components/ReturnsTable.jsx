import React, { useState, useMemo } from 'react';
import { RotateCcw, Search, Eye, X, Loader2, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import { Input } from '../../../components/ui/input.jsx';
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

export function ReturnsTable({
  returns = [],
  isLoading,
  searchTerm,
  setSearchTerm,
  onViewReturnDetails
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when returns change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [returns.length, searchTerm]);

  const paginatedReturns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return returns.slice(start, start + pageSize);
  }, [returns, currentPage, pageSize]);

  return (
    <Card className="bg-surface-card border-surface shadow-xs overflow-hidden">
      {/* Search and Table Header */}
      <CardHeader className="p-4 pb-3 border-b border-surface flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <CardTitle className="text-base font-semibold text-text-primary">
            Customer Return Credit Notes
          </CardTitle>
          <p className="text-xs text-text-muted mt-0.5">
            Immutable log of returned items, condition dispositions, and refunds.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search return #, invoice #, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 bg-surface-page border-surface text-xs h-9 rounded-lg"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-20 text-center text-text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <p className="text-sm font-medium">Loading returns ledger...</p>
          </div>
        ) : returns.length === 0 ? (
          <div className="py-20 text-center text-text-muted">
            <RotateCcw className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
            <p className="font-semibold text-base text-text-primary">No customer return records</p>
            <p className="text-xs text-text-muted mt-1">
              {searchTerm ? 'No returns match your search term.' : 'All completed sales remain unreturned.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-surface bg-surface-muted/40 hover:bg-surface-muted/40">
                  <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-text-muted">Return #</TableHead>
                  <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-text-muted">Original Invoice</TableHead>
                  <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-text-muted">Date & Time</TableHead>
                  <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-text-muted">Return Reason</TableHead>
                  <TableHead className="w-40 text-xs font-semibold uppercase tracking-wider text-text-muted">Processed By</TableHead>
                  <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">Refund Amount</TableHead>
                  <TableHead className="w-24 text-xs font-semibold uppercase tracking-wider text-text-muted text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReturns.map((ret) => (
                  <TableRow key={ret.id} className="border-surface/60 hover:bg-surface-page/70 transition-colors">
                    <TableCell className="w-32 align-middle font-mono font-semibold text-xs text-brand-primary">
                      {ret.returnNumber}
                    </TableCell>

                    <TableCell className="w-32 align-middle font-mono text-xs text-text-primary font-medium">
                      {ret.sale?.invoiceNumber || '—'}
                    </TableCell>

                    <TableCell className="w-36 align-middle text-xs text-text-muted">
                      {formatDate(ret.createdAt)}
                    </TableCell>

                    <TableCell className="min-w-[200px] align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-text-primary font-medium truncate max-w-xs block">
                          {ret.reason}
                        </span>
                        {ret.reason && ret.reason.length > 30 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="text-brand-primary p-0.5 rounded hover:bg-brand-primary/10 cursor-pointer shrink-0 transition-colors"
                                title="Click to view full reason"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-3 text-xs shadow-xl" align="start">
                              <div className="font-semibold text-xs text-text-primary border-b border-surface pb-1.5 mb-1.5">
                                Mandatory Audit Reason
                              </div>
                              <p className="text-text-primary leading-relaxed break-words">
                                {ret.reason}
                              </p>
                              <div className="mt-2 pt-1.5 border-t border-surface/60 text-[11px] text-text-muted">
                                Return Note: <span className="font-mono font-semibold text-text-primary">{ret.returnNumber}</span>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="w-40 align-middle">
                      <div className="text-xs font-semibold text-text-primary">
                        {ret.processedByUser?.fullName || 'Staff'}
                      </div>
                      <div className="text-[10px] text-text-muted uppercase font-medium">
                        {ret.processedByUser?.role || 'Pharmacist'}
                      </div>
                    </TableCell>

                    <TableCell className="w-32 align-middle text-right font-mono font-semibold text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                      {formatCurrency(ret.refundAmount)}
                    </TableCell>

                    <TableCell className="w-24 align-middle text-right pr-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-text-muted hover:text-brand-primary hover:border-brand-primary/40 font-medium gap-1 cursor-pointer rounded-lg text-xs"
                        onClick={() => onViewReturnDetails(ret.id)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && returns.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={returns.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
          />
        )}
      </CardContent>
    </Card>
  );
}
