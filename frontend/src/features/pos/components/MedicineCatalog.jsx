import React from 'react';
import {
  Search,
  X,
  Mic,
  Barcode,
  Pill,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function MedicineCatalog({
  searchTerm,
  setSearchTerm,
  filterStock,
  setFilterStock,
  selectedDosageForm,
  setSelectedDosageForm,
  sortBy,
  setSortBy,
  activeTab,
  setActiveTab,
  highlightedIndex,
  expandedMedIds,
  toggleExpandMed,
  addToCart,
  handleVoiceSearch,
  searchInputRef,
  isLoading,
  medicines
}) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-surface bg-surface-card shadow-xs overflow-hidden">
      {/* 1. Top Category Navigation Tabs */}
      <div className="flex items-center border-b border-surface px-5 pt-3 shrink-0 bg-surface-card">
        {[
          { id: 'SEARCH', label: 'Medicine Search' },
          { id: 'CATEGORIES', label: 'Categories' },
          { id: 'FAVORITES', label: 'Favorites' },
          { id: 'RECENT', label: 'Recently Sold' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 text-sm md:text-base font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Clean Search & Filter Header (Uncluttered, No Double Boxes) */}
      <div className="p-4 space-y-3 border-b border-surface shrink-0 bg-surface-card">
        {/* Prominent Search Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medicine name, generic salt, SKU, barcode..."
            className="w-full pl-12 pr-28 py-3 text-base rounded-xl border border-surface bg-surface-page text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium shadow-2xs"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-muted cursor-pointer"
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toast.info('Barcode scanner active. Scan barcode to auto-select medicine.')}
              className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-muted cursor-pointer"
              title="Barcode Scanner Mode"
            >
              <Barcode className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clean Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'IN_STOCK', label: 'In Stock' },
            { id: 'LOW_STOCK', label: 'Low Stock' },
            { id: 'NEAR_EXPIRY', label: 'Near Expiry' }
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilterStock(chip.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer text-xs md:text-sm ${
                filterStock === chip.id
                  ? 'bg-brand-primary text-white shadow-2xs'
                  : 'bg-surface-muted text-text-primary hover:bg-surface-muted/80'
              }`}
            >
              {chip.label}
            </button>
          ))}

          {/* Form Filter Dropdown */}
          <select
            value={selectedDosageForm}
            onChange={(e) => setSelectedDosageForm(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-surface-muted text-text-primary border border-surface text-xs md:text-sm font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">Form: All</option>
            <option value="Tablet">Tablets</option>
            <option value="Capsule">Capsules</option>
            <option value="Syrup">Syrups</option>
            <option value="Injection">Injections</option>
            <option value="Ointment">Ointments</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setFilterStock('ALL');
              setSelectedDosageForm('ALL');
              setSearchTerm('');
            }}
            className="text-text-muted hover:text-text-primary px-2.5 py-1 text-xs md:text-sm font-bold ml-auto cursor-pointer"
            title="Reset filters"
          >
            Reset Filters
          </button>
        </div>

        {/* Results Count & Sort Dropdown */}
        <div className="flex items-center justify-between text-xs md:text-sm text-text-muted pt-1">
          <span className="font-semibold">{medicines.length} medicines available</span>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-text-muted">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-text-primary font-bold focus:outline-none cursor-pointer"
            >
              <option value="RELEVANCE">Relevance</option>
              <option value="NAME_ASC">Name (A-Z)</option>
              <option value="PRICE_LOW">Price (Low to High)</option>
              <option value="PRICE_HIGH">Price (High to Low)</option>
              <option value="STOCK_HIGH">Stock (Highest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Medicine Results List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {isLoading ? (
          <div className="py-16 text-center text-text-muted space-y-2">
            <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-base font-semibold">Loading medicine catalog...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="py-16 text-center text-text-muted space-y-2">
            <Pill className="w-10 h-10 text-text-muted/60 mx-auto" />
            <p className="text-lg font-bold text-text-primary">No medicines match your search</p>
            <p className="text-sm text-text-muted">
              Try searching by generic salt name, alternative brand, or reset filters.
            </p>
          </div>
        ) : (
          medicines.map((med, index) => {
            const isHighlighted = index === highlightedIndex;
            const isExpanded = expandedMedIds.has(med.id);
            const isOutOfStock = med.totalAvailableStock <= 0;
            const isLow = med.isLowStock || (med.totalAvailableStock > 0 && med.totalAvailableStock <= 10);
            const activeBatches = med.batches || [];

            return (
              <div
                key={med.id}
                className={`p-4 rounded-xl border transition-all ${
                  isHighlighted
                    ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/30'
                    : 'border-surface bg-surface-card hover:border-surface-muted hover:shadow-xs'
                }`}
              >
                {/* Medicine Card Content */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start flex-1 min-w-0">
                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base md:text-lg text-text-primary leading-tight">
                          {med.name}
                        </h3>
                        {med.strength && (
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-surface px-2.5 py-0.5 rounded-md">
                            {med.strength}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-text-muted mt-1 leading-snug">
                        {med.genericName && <span>{med.genericName} • </span>}
                        {med.dosageForm && <span>{med.dosageForm} • </span>}
                        {med.packageUnit ? <span>{med.packageUnit}</span> : <span>Strip of 10</span>}
                        {med.category?.name && <span> • {med.category.name}</span>}
                      </p>

                      {/* Stock Badge & FEFO Indicator */}
                      <div className="mt-2.5 flex items-center gap-2.5 flex-wrap">
                        {isOutOfStock ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            Out of stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            {med.totalAvailableStock} in stock (Low Stock)
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                            {med.totalAvailableStock} in stock
                          </span>
                        )}

                        {med.earliestBatch && (
                          <span className="text-xs font-semibold text-text-muted">
                            FEFO Lot: <code className="font-mono text-text-primary font-bold">{med.earliestBatch}</code>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Add Action Button */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-lg md:text-xl font-black text-text-primary font-mono">
                      {formatCurrency(med.salePrice || 0)}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        size="default"
                        onClick={() => addToCart(med)}
                        disabled={isOutOfStock}
                        className={`h-9 px-4 text-sm font-bold rounded-xl shadow-xs cursor-pointer ${
                          isOutOfStock
                            ? 'bg-surface-muted text-text-muted cursor-not-allowed'
                            : 'bg-brand-primary hover:bg-brand-primary/90 text-white'
                        }`}
                      >
                        Add
                      </Button>

                      {activeBatches.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleExpandMed(med.id)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl border border-surface text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                          title={isExpanded ? 'Collapse batches' : 'Expand batches'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Batches Table */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-surface-muted bg-surface-page/80 dark:bg-surface-muted/30 p-3 rounded-xl">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Available Batches & FEFO Allocations</span>
                      <span className="text-xs text-brand-primary font-bold">
                        ✓ Sorted by earliest expiry
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead>
                          <tr className="border-b border-surface text-text-muted font-bold">
                            <th className="pb-2 pl-1">Batch No.</th>
                            <th className="pb-2">Expiry</th>
                            <th className="pb-2">Stock</th>
                            <th className="pb-2">MRP</th>
                            <th className="pb-2">Sell Price</th>
                            <th className="pb-2 text-right pr-1">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface/60">
                          {activeBatches.map((batch, bIdx) => {
                            const isFefo = bIdx === 0;
                            return (
                              <tr key={batch.id || batch.batchNumber} className="hover:bg-surface-card/60">
                                <td className="py-2 pl-1 font-mono font-medium text-text-primary">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`h-2.5 w-2.5 rounded-full ${isFefo ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                                    <span>{batch.batchNumber}</span>
                                    {isFefo && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-brand-primary/15 text-brand-primary">
                                        FEFO
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 text-text-muted">
                                  {formatDate(batch.expiryDate)}
                                </td>
                                <td className="py-2 font-semibold text-text-primary">
                                  {batch.currentQuantity} units
                                </td>
                                <td className="py-2 text-text-muted">
                                  {formatCurrency(batch.mrp || batch.salePrice * 1.15)}
                                </td>
                                <td className="py-2 font-bold text-text-primary font-mono">
                                  {formatCurrency(batch.salePrice)}
                                </td>
                                <td className="py-2 text-right pr-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => addToCart(med, batch)}
                                    className="h-7 text-xs text-brand-primary font-bold hover:bg-brand-primary/10 cursor-pointer"
                                  >
                                    Select
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
