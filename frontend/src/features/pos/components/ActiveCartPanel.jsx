import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  RotateCcw,
  Search,
  X,
  Building2,
  Percent,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';
import { apiClient } from '../../../services/api/apiClient.js';

export function ActiveCartPanel({
  tempBillNumber,
  customerName,
  setCustomerName,
  customerPhone,
  selectedCustomer,
  onSelectCustomer,
  onOpenCustomerModal,
  cart,
  updateQuantity,
  removeFromCart,
  clearCart,
  subtotal,
  estimatedTax,
  grossPayable,
  onProceedToBilling
}) {
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Customer Autocomplete Search State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!lookupQuery.trim() || lookupQuery.trim().length < 2) {
      setLookupResults([]);
      setDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiClient.get('/customers/lookup', {
          params: { q: lookupQuery.trim(), limit: 6 }
        });
        const results = res.data?.data || res.data || [];
        setLookupResults(results);
        setDropdownOpen(results.length > 0);
      } catch (err) {
        console.error('Customer lookup error', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [lookupQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePickCustomer = (cust) => {
    onSelectCustomer(cust);
    setLookupQuery('');
    setDropdownOpen(false);
  };

  const handleUnlinkCustomer = () => {
    onSelectCustomer(null);
    setCustomerName('Walk-in Customer');
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-surface bg-surface-card shadow-xs overflow-hidden">
      {/* 1. Panel Header */}
      <div className="flex items-center justify-between border-b border-surface px-5 py-3.5 shrink-0 bg-surface-card">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-text-primary tracking-tight">
              Active Billing Cart
            </h2>
            <span className="text-xs font-mono font-bold text-text-muted">
              {tempBillNumber}
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-bold text-red-700 hover:text-red-800 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Empty billing cart"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Cart
          </button>
        )}
      </div>

      {/* 2. Customer Row (Intelligent Segment Autocomplete & Dynamic Badge) */}
      <div className="px-5 py-3 border-b border-surface shrink-0 bg-surface-card">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-brand-primary" /> Customer Account
          </label>
          {selectedCustomer ? (
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">
              ● Linked Profile
            </span>
          ) : (
            customerPhone && (
              <span className="text-xs font-mono text-text-muted">Ph: {customerPhone}</span>
            )
          )}
        </div>

        {selectedCustomer ? (
          /* Linked Customer Card Pill */
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-brand-primary/30 bg-brand-primary/5 dark:bg-brand-primary/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-brand-primary/15 text-brand-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {selectedCustomer.name.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-text-primary truncate">
                    {selectedCustomer.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-card border border-surface text-text-muted">
                    {selectedCustomer.customerCode}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                      selectedCustomer.type === 'HOSPITAL_CLINIC'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : selectedCustomer.type === 'WHOLESALE_BULK'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : selectedCustomer.type === 'REGULAR'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {selectedCustomer.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                  {selectedCustomer.phone && <span>Ph: {selectedCustomer.phone}</span>}
                  {selectedCustomer.defaultDiscountPct > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {selectedCustomer.defaultDiscountPct}% Discount
                    </span>
                  )}
                  {selectedCustomer.creditLimit > 0 && (
                    <span className="text-text-muted">
                      Bal: {formatCurrency(selectedCustomer.currentBalance || 0)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUnlinkCustomer}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-surface-card transition-colors cursor-pointer shrink-0 ml-2"
              title="Unlink Customer (Switch to Walk-in)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Walk-in Input with Live Autocomplete */
          <div className="relative flex items-center gap-2" ref={dropdownRef}>
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={lookupQuery || customerName}
                onChange={(e) => {
                  setLookupQuery(e.target.value);
                  setCustomerName(e.target.value);
                }}
                onFocus={() => {
                  if (lookupResults.length > 0) setDropdownOpen(true);
                }}
                placeholder="Walk-in Customer (type name or phone to search)"
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-surface bg-surface-page text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium"
              />

              {/* Autocomplete Dropdown */}
              {dropdownOpen && lookupResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-surface bg-surface-card shadow-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-surface">
                  {lookupResults.map((cust) => (
                    <div
                      key={cust.id}
                      onClick={() => handlePickCustomer(cust)}
                      className="p-2.5 hover:bg-surface-page/80 cursor-pointer transition-colors flex items-center justify-between text-left"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-text-primary truncate">
                            {cust.name}
                          </span>
                          <span className="text-[10px] font-mono text-text-muted">
                            ({cust.customerCode})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                          {cust.phone && <span>{cust.phone}</span>}
                          {cust.companyName && <span className="truncate max-w-[120px]">• {cust.companyName}</span>}
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-page text-brand-primary">
                          {cust.type.replace('_', ' ')}
                        </span>
                        {cust.defaultDiscountPct > 0 && (
                          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                            {cust.defaultDiscountPct}% Off
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              size="default"
              variant="outline"
              onClick={onOpenCustomerModal}
              className="h-9 px-3 text-xs md:text-sm font-bold border-surface gap-1.5 shrink-0 hover:bg-surface-muted cursor-pointer"
              title="Register new customer profile"
            >
              <Plus className="w-4 h-4" /> New
            </Button>
          </div>
        )}
      </div>

      {/* 3. Spacious Cart Items List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-surface-card">
        <div className="flex items-center justify-between text-xs md:text-sm font-bold text-text-muted uppercase tracking-wider pb-1">
          <span>Items in Cart ({cart.length})</span>
          {cart.length > 0 && (
            <span className="text-text-primary font-mono text-sm">{totalUnits} units</span>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="h-[80%] flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-surface text-center space-y-2 bg-surface-page/30 my-auto">
            <div className="h-14 w-14 rounded-2xl bg-surface-muted flex items-center justify-center text-text-muted">
              <ShoppingCart className="w-7 h-7 text-text-muted/60" />
            </div>
            <div>
              <p className="text-base font-bold text-text-primary">Cart is empty</p>
              <p className="text-xs md:text-sm text-text-muted mt-1 max-w-[240px]">
                Search or select medicines on the left and click &quot;Add&quot;.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {cart.map((item) => (
              <div
                key={item.medicineId}
                className="p-3.5 rounded-xl border border-surface bg-surface-card hover:border-surface-muted transition-all space-y-2.5 shadow-2xs"
              >
                {/* Item Top: Name + Unit Price + Delete */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-text-primary leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-text-muted mt-1 truncate">
                      Lot: <code className="font-mono text-text-primary font-bold">{item.earliestBatch}</code>
                      {item.earliestExpiry ? ` • Exp: ${formatDate(item.earliestExpiry)}` : ''}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.medicineId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Item Bottom: Stepper + Line Total */}
                <div className="flex items-center justify-between pt-2 border-t border-surface/60">
                  <span className="text-xs md:text-sm text-text-muted font-medium">
                    {formatCurrency(item.unitPrice)} / unit
                  </span>

                  <div className="flex items-center gap-3">
                    {/* Stepper controls */}
                    <div className="flex items-center gap-1 border border-surface bg-surface-page rounded-xl p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-card transition-colors cursor-pointer"
                        title="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.medicineId, parseInt(e.target.value, 10) || 1)}
                        className="w-10 text-center text-sm font-bold text-text-primary bg-transparent focus:outline-none font-mono"
                        min="1"
                        max={item.availableStock}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-card transition-colors cursor-pointer"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line total */}
                    <span className="text-base font-black text-text-primary font-mono w-20 text-right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Bottom Action Bar */}
      <div className="p-4 border-t border-surface bg-surface-card space-y-3 shrink-0">
        {/* Quick Cart Summary Preview */}
        <div className="space-y-1.5 text-xs md:text-sm text-text-muted">
          <div className="flex justify-between items-center">
            <span className="font-medium">Subtotal (Items):</span>
            <span className="font-bold text-text-primary font-mono text-base">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Est. Tax (12% GST):</span>
            <span className="font-semibold text-text-muted font-mono">{formatCurrency(estimatedTax)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-surface text-text-primary">
            <span className="text-sm font-bold">Estimated Total:</span>
            <span className="font-black text-lg md:text-xl text-brand-primary font-mono">{formatCurrency(grossPayable)}</span>
          </div>
        </div>

        {/* Primary Proceed Action Button */}
        <Button
          onClick={onProceedToBilling}
          disabled={cart.length === 0}
          className="w-full h-13 bg-brand-primary hover:bg-brand-primary/90 text-white font-black text-base md:text-lg rounded-xl shadow-md gap-2.5 transition-all cursor-pointer flex items-center justify-center"
        >
          <span>Proceed to Billing (F6)</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
