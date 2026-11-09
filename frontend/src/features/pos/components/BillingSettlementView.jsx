import React from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  Percent,
  Sparkles,
  Printer,
  Receipt
} from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function BillingSettlementView({
  onBackToSelection,
  tempBillNumber,
  customerName,
  customerPhone,
  cart,
  updateQuantity,
  removeFromCart,
  paymentMethod,
  setPaymentMethod,
  tenderedAmount,
  setTenderedAmount,
  splitCashAmount,
  setSplitCashAmount,
  splitOnlineAmount,
  setSplitOnlineAmount,
  paymentReference,
  setPaymentReference,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  calculatedDiscount,
  grossPayable,
  roundOffEnabled,
  setRoundOffEnabled,
  roundOffAmount,
  subtotal,
  estimatedTax,
  finalNetPayable,
  changeAmount,
  handleCheckout,
  isCheckingOut
}) {
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full w-full space-y-3.5 overflow-hidden select-none">
      {/* 1. Settlement Top Navigation Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-surface shrink-0 bg-surface-card px-5 py-3 rounded-2xl border">
        <div className="flex items-center gap-3.5">
          <Button
            variant="outline"
            size="default"
            onClick={onBackToSelection}
            className="text-sm font-bold border-surface gap-2 hover:bg-surface-muted h-10 px-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-brand-primary" />
            <span>← Back / Add More Medicines (Esc)</span>
          </Button>

          <div className="h-6 w-px bg-surface" />

          <div>
            <h1 className="text-lg font-black tracking-tight text-text-primary flex items-center gap-2.5">
              <Receipt className="w-5 h-5 text-brand-primary" />
              <span>Billing & Payment Settlement</span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-surface-muted text-text-muted font-bold">
                {tempBillNumber}
              </span>
            </h1>
          </div>
        </div>

        {/* Customer Badge */}
        <div className="flex items-center gap-2 text-sm bg-surface-page px-3.5 py-1.5 rounded-xl border border-surface">
          <User className="w-4 h-4 text-brand-primary" />
          <span className="font-bold text-text-primary">{customerName}</span>
          {customerPhone && (
            <span className="text-text-muted font-mono text-xs">• {customerPhone}</span>
          )}
        </div>
      </div>

      {/* 2. Main 2-Column Settlement Screen */}
      <div className="w-full flex-1 min-h-0 flex flex-row flex-nowrap gap-4 overflow-hidden">
        {/* LEFT COLUMN: Order Items Review & Adjustment */}
        <div className="w-[420px] 2xl:w-[460px] shrink-0 h-full flex flex-col rounded-2xl border border-surface bg-surface-card shadow-xs overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface px-5 py-3.5 shrink-0 bg-surface-card">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-primary" />
              <h2 className="font-bold text-base text-text-primary">
                Order Review ({cart.length} items, {totalUnits} units)
              </h2>
            </div>
            <button
              type="button"
              onClick={onBackToSelection}
              className="text-xs md:text-sm font-bold text-brand-primary hover:underline cursor-pointer"
            >
              + Add More
            </button>
          </div>

          {/* Cart items list with stepper */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 scrollbar-thin bg-surface-card">
            {cart.map((item) => (
              <div
                key={item.medicineId}
                className="p-3 rounded-xl border border-surface bg-surface-card hover:border-surface-muted transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm md:text-base font-bold text-text-primary leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      Lot: <code className="font-mono text-text-primary font-bold">{item.earliestBatch}</code>
                      {item.earliestExpiry ? ` • Exp: ${formatDate(item.earliestExpiry)}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.medicineId)}
                    className="p-1 rounded text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-surface/50 text-xs md:text-sm">
                  <span className="text-text-muted font-medium">
                    {formatCurrency(item.unitPrice)} / unit
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 border border-surface bg-surface-page rounded-lg p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                        className="h-6 w-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-card cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.medicineId, parseInt(e.target.value, 10) || 1)}
                        className="w-9 text-center text-xs md:text-sm font-bold text-text-primary bg-transparent focus:outline-none font-mono"
                        min="1"
                        max={item.availableStock}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                        className="h-6 w-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-card cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-black text-text-primary font-mono text-sm md:text-base w-18 text-right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Subtotal review footer */}
          <div className="p-4 border-t border-surface bg-surface-page/50 space-y-1.5 text-xs md:text-sm shrink-0">
            <div className="flex justify-between">
              <span className="text-text-muted font-medium">Subtotal (Gross Items):</span>
              <span className="font-bold text-text-primary font-mono text-sm md:text-base">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-medium">Tax (GST/VAT 12%):</span>
              <span className="font-bold text-text-primary font-mono">{formatCurrency(estimatedTax)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Tender, Discounts & Final Checkout */}
        <div className="flex-1 min-w-[420px] h-full flex flex-col rounded-2xl border border-surface bg-surface-card shadow-xs overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 scrollbar-thin bg-surface-card">
            {/* A. Payment Mode Tabs */}
            <div className="space-y-2.5">
              <label className="text-xs md:text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-primary" /> 1. Select Payment Tender Mode
              </label>

              <div className="grid grid-cols-5 gap-2 bg-surface-muted p-1 rounded-xl border border-surface">
                {['CASH', 'UPI', 'CARD', 'CREDIT', 'SPLIT'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMethod(mode)}
                    className={`py-2.5 rounded-lg transition-all cursor-pointer capitalize font-bold text-xs md:text-sm ${
                      paymentMethod === mode
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {mode.toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Cash Tender Details */}
              {paymentMethod === 'CASH' && (
                <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-3 shadow-2xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs md:text-sm font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Cash Received (₹)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={tenderedAmount}
                        onChange={(e) => setTenderedAmount(e.target.value)}
                        placeholder={finalNetPayable > 0 ? finalNetPayable.toFixed(2) : '0.00'}
                        className="w-full h-12 px-3.5 text-base md:text-lg font-bold font-mono rounded-xl border border-surface bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-2xs"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Change to Return (₹)
                      </label>
                      <div
                        className={`h-12 px-4 flex items-center justify-end font-mono rounded-xl border transition-all ${
                          changeAmount > 0
                            ? 'bg-emerald-600 text-white border-emerald-500 font-black text-2xl shadow-sm'
                            : 'bg-surface-card border-surface text-text-primary font-bold text-xl md:text-2xl shadow-2xs'
                        }`}
                      >
                        {formatCurrency(changeAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Quick Cash Helper Chips */}
                  {finalNetPayable > 0 && (
                    <div className="flex items-center gap-2 flex-wrap text-xs md:text-sm pt-1">
                      <span className="font-bold text-text-muted mr-1">Quick:</span>
                      <button
                        type="button"
                        onClick={() => setTenderedAmount(finalNetPayable.toFixed(2))}
                        className="px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-muted text-text-primary font-bold border border-surface cursor-pointer text-xs md:text-sm"
                      >
                        Exact ({formatCurrency(finalNetPayable)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTenderedAmount((Math.ceil(finalNetPayable / 50) * 50).toFixed(2))}
                        className="px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-muted text-text-primary font-bold border border-surface cursor-pointer text-xs md:text-sm"
                      >
                        Round ₹50 ({formatCurrency(Math.ceil(finalNetPayable / 50) * 50)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTenderedAmount((Math.ceil(finalNetPayable / 100) * 100).toFixed(2))}
                        className="px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-muted text-text-primary font-bold border border-surface cursor-pointer text-xs md:text-sm"
                      >
                        Round ₹100 ({formatCurrency(Math.ceil(finalNetPayable / 100) * 100)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTenderedAmount('500.00')}
                        className="px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-muted text-text-primary font-bold border border-surface cursor-pointer text-xs md:text-sm"
                      >
                        ₹500.00
                      </button>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="p-4 rounded-xl bg-surface-page border border-surface text-sm space-y-2.5">
                  <p className="font-bold text-text-primary flex items-center gap-2 text-sm md:text-base">
                    <QrCode className="w-5 h-5 text-brand-primary" /> Scan UPI QR or Enter Transaction ID / UTR
                  </p>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter UPI Reference / UTR Number (Optional)"
                    className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="p-4 rounded-xl bg-surface-page border border-surface text-sm space-y-2.5">
                  <p className="font-bold text-text-primary flex items-center gap-2 text-sm md:text-base">
                    <CreditCard className="w-5 h-5 text-brand-primary" /> Card Swipe / POS Terminal
                  </p>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Card Last 4 Digits or Terminal Auth Code"
                    className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              )}

              {paymentMethod === 'CREDIT' && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-sm space-y-1.5 text-amber-800 dark:text-amber-300">
                  <p className="font-bold text-base flex items-center gap-2">
                    ⚠️ Customer Udhaar / Credit Ledger
                  </p>
                  <p className="text-xs md:text-sm leading-relaxed">
                    This bill of <strong>{formatCurrency(finalNetPayable)}</strong> will post to <strong>{customerName}</strong>&apos;s customer account balance ledger.
                  </p>
                </div>
              )}

              {paymentMethod === 'SPLIT' && (
                <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-3">
                  <p className="font-bold text-sm text-text-primary">Split Payment: Cash + UPI / Card</p>
                  <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
                    <div>
                      <label className="text-xs font-bold text-text-muted block mb-1">
                        Cash Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={splitCashAmount}
                        onChange={(e) => setSplitCashAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-text-primary text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-muted block mb-1">
                        UPI / Card Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={splitOnlineAmount}
                        onChange={(e) => setSplitOnlineAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-text-primary text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* B. Bill Discount Card */}
            <div className="p-4 rounded-2xl border border-surface bg-surface-page space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-brand-primary" /> 2. Bill Discount & Offers
                </span>

                {/* Mode Toggle: % vs Flat */}
                <div className="flex items-center p-0.5 rounded-lg bg-surface-muted border border-surface text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENT')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      discountType === 'PERCENT'
                        ? 'bg-brand-primary text-white shadow-xs font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    % Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('FLAT')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      discountType === 'FLAT'
                        ? 'bg-brand-primary text-white shadow-xs font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    ₹ Flat Discount
                  </button>
                </div>
              </div>

              {/* Discount Input & Presets */}
              <div className="space-y-2.5">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-text-muted">
                    {discountType === 'PERCENT' ? '%' : '₹'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={discountType === 'PERCENT' ? 100 : grossPayable}
                    step="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={
                      discountType === 'PERCENT'
                        ? 'Enter discount percentage (e.g. 10%)'
                        : 'Enter flat discount amount (e.g. ₹50)'
                    }
                    className="w-full h-12 pl-10 pr-20 text-base font-bold text-text-primary rounded-xl border border-surface bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-2xs font-mono"
                  />
                  {discountValue && (
                    <button
                      type="button"
                      onClick={() => setDiscountValue('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Preset Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs md:text-sm font-bold text-text-muted mr-1">Presets:</span>
                  {discountType === 'PERCENT' ? (
                    <>
                      {[5, 10, 15, 20].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountValue(pct.toString())}
                          className={`px-3.5 py-1 text-xs md:text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                            discountValue === pct.toString()
                              ? 'bg-brand-primary text-white border-brand-primary shadow-2xs'
                              : 'bg-surface-card hover:bg-surface-muted text-text-primary border-surface'
                          }`}
                        >
                          {pct}% Off
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[10, 20, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDiscountValue(amt.toString())}
                          className={`px-3.5 py-1 text-xs md:text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                            discountValue === amt.toString()
                              ? 'bg-brand-primary text-white border-brand-primary shadow-2xs'
                              : 'bg-surface-card hover:bg-surface-muted text-text-primary border-surface'
                          }`}
                        >
                          ₹{amt} Off
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Savings Badge */}
              {calculatedDiscount > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-card border border-brand-primary/40 text-xs md:text-sm shadow-2xs">
                  <span className="font-bold text-brand-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Customer Discount Savings:
                  </span>
                  <span className="font-black text-sm md:text-base text-brand-primary font-mono">
                    -{formatCurrency(calculatedDiscount)}
                  </span>
                </div>
              )}
            </div>

            {/* C. Financial Totals & Round Off */}
            <div className="space-y-3 pt-2 border-t border-surface">
              {/* Round Off Toggle Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-page border border-surface text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">Round Off to Nearest Rupee:</span>
                  <span className="text-xs md:text-sm text-text-muted font-mono font-bold">
                    {roundOffEnabled ? (roundOffAmount >= 0 ? `+${formatCurrency(roundOffAmount)}` : `-${formatCurrency(Math.abs(roundOffAmount))}`) : 'Disabled'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRoundOffEnabled((r) => !r)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    roundOffEnabled ? 'bg-brand-primary' : 'bg-surface-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                      roundOffEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Subtotal & Breakdown */}
              <div className="space-y-1.5 text-xs md:text-sm text-text-muted py-1">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal (Gross Items):</span>
                  <span className="font-bold text-text-primary font-mono text-sm md:text-base">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tax (GST/VAT 12%):</span>
                  <span className="font-bold text-text-primary font-mono">{formatCurrency(estimatedTax)}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>Discount Savings:</span>
                    <span className="font-mono">-{formatCurrency(calculatedDiscount)}</span>
                  </div>
                )}
                {roundOffEnabled && roundOffAmount !== 0 && (
                  <div className="flex justify-between text-text-muted font-medium">
                    <span>Round-Off:</span>
                    <span className="font-mono">{roundOffAmount > 0 ? `+${formatCurrency(roundOffAmount)}` : `-${formatCurrency(Math.abs(roundOffAmount))}`}</span>
                  </div>
                )}
              </div>

              {/* Crystal-Clear Total Payable Card */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-card border-2 border-brand-primary shadow-xs">
                <div>
                  <span className="block text-xs md:text-sm font-black text-text-primary uppercase tracking-wider">
                    Total Payable Amount
                  </span>
                  <span className="text-xs text-text-muted font-medium">
                    Final net amount payable at counter
                  </span>
                </div>
                <span className="font-black text-3xl md:text-4xl text-brand-primary tracking-tight font-mono">
                  {formatCurrency(finalNetPayable)}
                </span>
              </div>
            </div>
          </div>

          {/* D. Final Complete Billing Action */}
          <div className="p-4 border-t border-surface bg-surface-card shrink-0 flex items-center gap-3.5">
            <Button
              variant="outline"
              onClick={onBackToSelection}
              className="h-13 px-5 text-sm md:text-base font-bold border-surface hover:bg-surface-muted cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5 mr-1.5 text-brand-primary" />
              <span>Back</span>
            </Button>

            <Button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className="flex-1 h-13 bg-brand-primary hover:bg-brand-primary/90 text-white font-black text-base md:text-lg rounded-xl shadow-md gap-2.5 transition-all cursor-pointer"
            >
              {isCheckingOut ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing & Printing Invoice...</span>
                </>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  <span>Complete & Print Invoice (F6)</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
