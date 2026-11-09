import React from 'react';
import { Search, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Button } from '../../../components/ui/button.jsx';

export function MedicinesFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  lowStockFilter,
  setLowStockFilter,
  categories = [],
  onReset
}) {
  const hasActiveFilters = Boolean(searchTerm || categoryFilter || lowStockFilter);

  return (
    <Card className="bg-surface-card border-surface shadow-xs">
      <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search medicine, salt, SKU barcode..."
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

        {/* Dropdowns & Chips */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 text-sm bg-surface-page border border-surface rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Low Stock Filter Chip */}
          <button
            type="button"
            onClick={() => setLowStockFilter((prev) => !prev)}
            className={`h-10 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              lowStockFilter
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-surface-page text-text-muted hover:text-text-primary border-surface'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alerts</span>
          </button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-10 px-3 text-xs font-bold text-text-muted hover:text-text-primary border-surface rounded-xl gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
