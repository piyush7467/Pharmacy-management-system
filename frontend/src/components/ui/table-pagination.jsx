import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button.jsx';

export function TablePagination({
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100]
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-surface bg-surface-card text-xs text-text-muted">
      {/* Showing count */}
      <div className="flex items-center gap-2">
        <span>
          Showing <strong className="font-semibold text-text-primary tabular-nums">{startItem}–{endItem}</strong> of{' '}
          <strong className="font-semibold text-text-primary tabular-nums">{totalItems}</strong> records
        </span>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-surface bg-surface-page px-2 text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md cursor-pointer"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md cursor-pointer"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          <span className="px-2 font-medium">
            Page <strong className="text-text-primary font-semibold">{currentPage}</strong> of{' '}
            <strong className="text-text-primary font-semibold">{totalPages}</strong>
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md cursor-pointer"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md cursor-pointer"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

