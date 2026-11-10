import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Pill,
  Loader2,
  X,
  Check,
  ChevronDown,
  Building,
  Tag,
  Package
} from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient.js';

export function MedicineSearchAutocomplete({
  selectedMedicine = null,
  onSelect,
  placeholder = 'Search medicine (brand, generic, SKU...)',
  isCompact = false,
  autoFocus = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync display with selected medicine
  useEffect(() => {
    if (selectedMedicine) {
      const label = `${selectedMedicine.name} ${selectedMedicine.strength ? `(${selectedMedicine.strength})` : ''} ${selectedMedicine.dosageForm || ''}`.trim();
      setSearchTerm(label);
    } else {
      setSearchTerm('');
    }
  }, [selectedMedicine]);

  // Debounce search term by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Query server for 10-15 matching medicines
  const { data: results = [], isLoading, isFetching } = useQuery({
    queryKey: ['medicines-autocomplete', debouncedTerm],
    queryFn: async () => {
      const params = {
        limit: 15,
        isActive: true
      };
      if (debouncedTerm) {
        params.search = debouncedTerm;
      }
      const res = await apiClient.get('/medicines', { params });
      return res.data?.medicines || res.data || [];
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 2 // Cache for 2 minutes
  });

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset display to current selected medicine if user didn't pick anything new
        if (selectedMedicine) {
          const label = `${selectedMedicine.name} ${selectedMedicine.strength ? `(${selectedMedicine.strength})` : ''} ${selectedMedicine.dosageForm || ''}`.trim();
          setSearchTerm(label);
        } else {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedMedicine]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const handleSelect = (medicine) => {
    onSelect?.(medicine);
    const label = `${medicine.name} ${medicine.strength ? `(${medicine.strength})` : ''} ${medicine.dosageForm || ''}`.trim();
    setSearchTerm(label);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    setDebouncedTerm('');
    onSelect?.(null);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${isOpen ? 'z-[80]' : 'z-10'}`}>
      {/* Input Field */}
      <div
        className={`relative flex items-center rounded-lg border bg-surface-card transition-all ${
          isOpen
            ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-xs'
            : 'border-surface hover:border-brand-primary/40'
        } ${isCompact ? 'h-9 text-xs' : 'h-11 text-sm'}`}
      >
        <Search
          className={`shrink-0 text-text-muted transition-colors ${
            isOpen ? 'text-brand-primary' : ''
          } ${isCompact ? 'ml-2.5 h-3.5 w-3.5' : 'ml-3.5 h-4 w-4'}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full bg-transparent px-2.5 text-text-primary placeholder:text-text-muted/60 focus:outline-none ${
            isCompact ? 'text-xs font-medium' : 'text-sm font-medium'
          }`}
        />

        {/* Action icons on right */}
        <div className="flex items-center gap-1 pr-2.5 shrink-0">
          {isLoading || isFetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
          ) : searchTerm ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              inputRef.current?.focus();
            }}
            className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-brand-primary' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[90] mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-surface bg-surface-card p-1.5 shadow-2xl transition-all">
          {isLoading && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
              <span>Searching medicine catalogue...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 px-4 text-center text-xs text-text-muted">
              <Pill className="mx-auto h-6 w-6 opacity-30 mb-1.5" />
              <p className="font-medium text-text-primary">No formulations found</p>
              <p className="text-[11px] mt-0.5">
                Try searching by trade name, generic molecule, or SKU barcode.
              </p>
            </div>
          ) : (
            <div ref={listRef} className="space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted/80 flex items-center justify-between border-b border-surface/60 pb-1 mb-1">
                <span>Matching Formulations ({results.length})</span>
                <span className="text-[10px] text-text-muted">↑↓ to navigate • ↵ to select</span>
              </div>

              {results.map((medicine, index) => {
                const isSelected = selectedMedicine?.id === medicine.id;
                const isActive = activeIndex === index;
                const availableStock = medicine.totalAvailableStock ?? 0;

                return (
                  <div
                    key={medicine.id}
                    onClick={() => handleSelect(medicine)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex items-start justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : isSelected
                        ? 'bg-brand-primary/5 text-text-primary'
                        : 'hover:bg-surface/60 text-text-primary'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                        <Pill className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-text-primary">
                            {medicine.name}
                          </span>
                          {medicine.strength && (
                            <span className="text-[11px] font-medium text-text-muted">
                              {medicine.strength}
                            </span>
                          )}
                          {medicine.dosageForm && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface border border-surface text-text-muted">
                              {medicine.dosageForm}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5 truncate">
                          <span className="truncate italic">
                            {medicine.genericName}
                          </span>
                          {medicine.manufacturer && (
                            <>
                              <span>•</span>
                              <span className="truncate text-text-muted/80">
                                {medicine.manufacturer}
                              </span>
                            </>
                          )}
                        </div>

                        {medicine.sku && (
                          <div className="text-[10px] font-mono text-text-muted/70 mt-0.5">
                            SKU: {medicine.sku}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock & MRP Snapshot */}
                    <div className="text-right shrink-0">
                      {medicine.salePrice ? (
                        <div className="text-xs font-semibold text-text-primary">
                          MRP ₹{Number(medicine.salePrice).toFixed(2)}
                        </div>
                      ) : null}
                      <div
                        className={`text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${
                          availableStock > 0
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'bg-zinc-500/10 text-zinc-500'
                        }`}
                      >
                        {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
