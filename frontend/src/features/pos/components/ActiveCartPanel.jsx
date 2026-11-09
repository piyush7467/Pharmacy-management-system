import React from 'react';
import {
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function ActiveCartPanel({
  tempBillNumber,
  customerName,
  setCustomerName,
  customerPhone,
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
            className="text-xs font-bold text-red-600 hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Empty billing cart"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Cart
          </button>
        )}
      </div>

      {/* 2. Customer Row (Clean, Single Card) */}
      <div className="px-5 py-3 border-b border-surface shrink-0 bg-surface-card">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-brand-primary" /> Customer Name
          </label>
          {customerPhone && (
            <span className="text-xs font-mono text-text-muted">Ph: {customerPhone}</span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer (or click New)"
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-surface bg-surface-page text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium"
            />
          </div>

          <Button
            size="default"
            variant="outline"
            onClick={onOpenCustomerModal}
            className="h-9 px-3.5 text-xs md:text-sm font-bold border-surface gap-1.5 shrink-0 hover:bg-surface-muted cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New
          </Button>
        </div>
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
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
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
