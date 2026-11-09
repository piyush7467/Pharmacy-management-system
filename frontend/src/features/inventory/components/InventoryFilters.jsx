import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Button } from '../../../components/ui/button.jsx';

export function InventoryFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  expiryFilter,
  setExpiryFilter,
  onReset
}) {
  const hasActiveFilters = Boolean(searchTerm || statusFilter || expiryFilter);

  return (
    <Card className="bg-surface-card border-surface shadow-xs">
      <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search lot #, medicine name, SKU..."
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

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-sm bg-surface-page border border-surface rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active (In Stock)</option>
            <option value="QUARANTINED">Quarantined</option>
            <option value="DEPLETED">Depleted (0 Units)</option>
            <option value="EXPIRED">Expired</option>
          </select>

          <select
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
            className="h-10 px-3 text-sm bg-surface-page border border-surface rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">All Expiry Horizons</option>
            <option value="30">Expiring in &lt; 30 Days</option>
            <option value="60">Expiring in &lt; 60 Days</option>
            <option value="90">Expiring in &lt; 90 Days</option>
          </select>

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
