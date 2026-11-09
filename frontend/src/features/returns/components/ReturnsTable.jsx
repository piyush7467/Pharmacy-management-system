import React from 'react';
import { RotateCcw, Search, Eye, X, Loader2, PackageCheck, AlertCircle } from 'lucide-react';
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
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function ReturnsTable({
  returns,
  isLoading,
  searchTerm,
  setSearchTerm,
  onViewReturnDetails
}) {
  return (
    <Card className="bg-surface-card border-surface shadow-xs">
      {/* Search and Table Header */}
      <CardHeader className="p-4 pb-3 border-b border-surface flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-text-primary">
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
            className="pl-9 pr-8 bg-surface-page border-surface text-sm rounded-xl"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <p className="text-sm font-medium">Loading returns ledger...</p>
          </div>
        ) : returns.length === 0 ? (
          <div className="py-16 text-center text-text-muted">
            <RotateCcw className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
            <p className="font-bold text-base text-text-primary">No customer return records</p>
            <p className="text-xs text-text-muted mt-1">
              {searchTerm ? 'No returns match your search term.' : 'All completed sales remain unreturned.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-surface hover:bg-transparent bg-surface-page/50">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Return Number</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Original Invoice</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Date & Time</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Mandatory Reason</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">Processed By</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right">Refund Amount</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((ret) => (
                  <TableRow key={ret.id} className="border-surface hover:bg-surface-page/60 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-brand-primary">
                      {ret.returnNumber}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-primary font-bold">
                      {ret.sale?.invoiceNumber || 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs text-text-muted font-medium">
                      {formatDate(ret.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-text-primary font-medium">
                      {ret.reason}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold text-text-primary">
                        {ret.processedByUser?.fullName || 'Staff'}
                      </div>
                      <div className="text-[10px] text-text-muted uppercase font-bold">
                        {ret.processedByUser?.role || 'Pharmacist'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-sm text-rose-600 dark:text-rose-400 font-mono">
                      {formatCurrency(ret.refundAmount)}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 font-bold gap-1 cursor-pointer rounded-lg"
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
      </CardContent>
    </Card>
  );
}
