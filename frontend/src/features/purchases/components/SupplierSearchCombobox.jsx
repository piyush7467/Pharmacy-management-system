import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, ChevronDown, Check, X, Phone, Mail } from 'lucide-react';

export function SupplierSearchCombobox({
  suppliers = [],
  selectedSupplierId = '',
  onSelect,
  placeholder = 'Search supplier (name, phone, GSTIN...)'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  useEffect(() => {
    if (selectedSupplier) {
      setSearchTerm(selectedSupplier.name);
    } else {
      setSearchTerm('');
    }
  }, [selectedSupplier]);

  // Filter suppliers in-memory
  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.contactPerson?.toLowerCase().includes(term) ||
      s.phone?.toLowerCase().includes(term) ||
      s.taxNumber?.toLowerCase().includes(term)
    );
  }).slice(0, 15);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedSupplier) {
          setSearchTerm(selectedSupplier.name);
        } else {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedSupplier]);

  const handleSelect = (supplier) => {
    onSelect?.(supplier.id);
    setSearchTerm(supplier.name);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect?.('');
    setSearchTerm('');
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
      setActiveIndex((prev) => (prev < filteredSuppliers.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredSuppliers.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filteredSuppliers[activeIndex]) {
        handleSelect(filteredSuppliers[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${isOpen ? 'z-[80]' : 'z-20'}`}>
      <div
        className={`relative flex items-center h-10 rounded-lg border bg-surface-card transition-all ${
          isOpen
            ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-xs'
            : 'border-surface hover:border-brand-primary/40'
        }`}
      >
        <Search
          className={`shrink-0 ml-3 h-4 w-4 text-text-muted transition-colors ${
            isOpen ? 'text-brand-primary' : ''
          }`}
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
          className="w-full bg-transparent px-2.5 text-xs sm:text-sm font-medium text-text-primary placeholder:text-text-muted/60 focus:outline-none"
        />

        <div className="flex items-center gap-1 pr-2.5 shrink-0">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

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

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[90] mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-surface bg-surface-card p-1.5 shadow-2xl">
          {filteredSuppliers.length === 0 ? (
            <div className="py-4 px-3 text-center text-xs text-text-muted">
              No matching suppliers found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSuppliers.map((supplier, idx) => {
                const isSelected = selectedSupplierId === supplier.id;
                const isActive = activeIndex === idx;

                return (
                  <div
                    key={supplier.id}
                    onClick={() => handleSelect(supplier)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-start justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : isSelected
                        ? 'bg-brand-primary/5 text-text-primary'
                        : 'hover:bg-surface/60 text-text-primary'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">
                          {supplier.name}
                        </span>
                        {supplier.taxNumber && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-surface text-text-muted">
                            GSTIN: {supplier.taxNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-muted mt-0.5">
                        {supplier.contactPerson && <span>{supplier.contactPerson}</span>}
                        {supplier.phone && <span>• {supplier.phone}</span>}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                    )}
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
