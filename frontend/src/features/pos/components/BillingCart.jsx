import React from 'react';
import {
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  Percent,
  Sparkles,
  Printer
} from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function BillingCart({
  tempBillNumber,
  customerName,
  setCustomerName,
  customerPhone,
  onOpenCustomerModal,
  cart,
  updateQuantity,
  removeFromCart,
  clearCart,
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
  return (
    <div className="flex flex-col h-full rounded-2xl border border-surface bg-surface-card shadow-xs overflow-hidden">
      {/* A. Current Bill Header */}
      <div className="flex items-center justify-between border-b border-surface px-4 py-2.5 shrink-0 bg-surface-card">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-[16px] text-text-primary tracking-tight">
            Current Bill
          </h2>
          <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-surface-muted text-text-muted">
            {tempBillNumber}
          </span>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* B. Customer Selection Row */}
      <div className="px-4 pt-2.5 pb-2 shrink-0 bg-surface-card">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Customer
          </label>
          {customerPhone && (
            <span className="text-xs text-text-muted">Ph: {customerPhone}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name or walk-in"
              className="w-full pl-9 pr-3 py-1.5 text-[13.5px] rounded-xl border border-surface bg-surface-page text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCustomerModal}
            className="h-8.5 px-3 text-xs font-bold border-surface gap-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </Button>
        </div>
      </div>

      {/* C. Cart Items List */}
      <div className="px-4 py-2 border-y border-surface shrink-0 min-h-[90px] max-h-[175px] overflow-y-auto scrollbar-thin space-y-1.5 bg-surface-card">
        <div className="flex items-center justify-between text-[11px] font-bold text-text-muted uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5" /> Cart Items ({cart.length})
          </span>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-red-600 hover:underline cursor-pointer font-bold text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="py-4 px-3 rounded-xl border border-dashed border-surface text-center space-y-1 bg-surface-page/50">
            <ShoppingCart className="w-5 h-5 text-text-muted/60 mx-auto" />
            <p className="text-xs font-bold text-text-primary">Cart is empty</p>
            <p className="text-[11px] text-text-muted">
              Click &quot;Add&quot; on any medicine from the left panel
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {cart.map((item) => (
              <div
                key={item.medicineId}
                className="flex items-center justify-between p-2 rounded-xl border border-surface bg-surface-page hover:border-surface-muted transition-all"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-[13px] font-bold text-text-primary truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-text-muted truncate">
                    Lot: {item.earliestBatch}{' '}
                    {item.earliestExpiry ? `• Exp: ${formatDate(item.earliestExpiry)}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1 border border-surface bg-surface-card rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                    className="h-5 w-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.medicineId, parseInt(e.target.value, 10) || 1)}
                    className="w-7 text-center text-xs font-bold text-text-primary bg-transparent focus:outline-none"
                    min="1"
                    max={item.availableStock}
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                    className="h-5 w-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  <span className="text-[13.5px] font-black text-text-primary w-14 text-right">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.medicineId)}
                    className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* D. Lower Financial Controls (Scrolls independently within remaining height) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin bg-surface-card">
        {/* Payment Mode Selector */}
        <div className="space-y-2 pt-1 border-t border-surface">
          <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Payment Tender
          </label>

          {/* Mode Tabs */}
          <div className="grid grid-cols-5 gap-1 bg-surface-muted p-1 rounded-xl border border-surface text-xs font-semibold">
            {['CASH', 'UPI', 'CARD', 'CREDIT', 'SPLIT'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentMethod(mode)}
                className={`py-1.5 rounded-lg transition-all cursor-pointer capitalize ${
                  paymentMethod === mode
                    ? 'bg-brand-primary text-white shadow-xs font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {mode.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Cash Input Fields */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Cash Received (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(e.target.value)}
                    placeholder={finalNetPayable > 0 ? finalNetPayable.toFixed(2) : '0.00'}
                    className="w-full h-10 px-3 text-sm font-bold font-mono rounded-xl border border-surface bg-surface-page text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Change to Return (₹)
                  </label>
                  <div
                    className={`h-10 px-3 flex items-center justify-end font-mono rounded-xl border transition-all ${
                      changeAmount > 0
                        ? 'bg-emerald-600 text-white border-emerald-500 font-black text-lg shadow-sm'
                        : 'bg-surface-card border-surface text-text-primary font-bold text-base md:text-lg shadow-2xs'
                    }`}
                  >
                    {formatCurrency(changeAmount)}
                  </div>
                </div>
              </div>

              {/* Quick Tender Chips */}
              {finalNetPayable > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
                  <span className="text-[11px] font-bold text-text-muted mr-1">Quick:</span>
                  <button
                    type="button"
                    onClick={() => setTenderedAmount(finalNetPayable.toFixed(2))}
                    className="px-2.5 py-1 rounded-lg bg-surface-muted hover:bg-surface-muted/80 text-text-primary font-bold border border-surface cursor-pointer text-[11.5px]"
                  >
                    Exact ({formatCurrency(finalNetPayable)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenderedAmount((Math.ceil(finalNetPayable / 50) * 50).toFixed(2))}
                    className="px-2.5 py-1 rounded-lg bg-surface-muted hover:bg-surface-muted/80 text-text-primary font-bold border border-surface cursor-pointer text-[11.5px]"
                  >
                    Round ₹50
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenderedAmount((Math.ceil(finalNetPayable / 100) * 100).toFixed(2))}
                    className="px-2.5 py-1 rounded-lg bg-surface-muted hover:bg-surface-muted/80 text-text-primary font-bold border border-surface cursor-pointer text-[11.5px]"
                  >
                    Round ₹100
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenderedAmount('500.00')}
                    className="px-2.5 py-1 rounded-lg bg-surface-muted hover:bg-surface-muted/80 text-text-primary font-bold border border-surface cursor-pointer text-[11.5px]"
                  >
                    ₹500
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Other Payment Inputs */}
          {paymentMethod === 'UPI' && (
            <div className="p-3 rounded-xl bg-surface-page border border-surface text-xs space-y-2">
              <p className="font-bold text-text-primary flex items-center gap-1.5 text-xs">
                <QrCode className="w-4 h-4 text-brand-primary" /> Scan UPI QR or Enter UTR / Ref No.
              </p>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="UPI Reference No. / Transaction ID (Optional)"
                className="w-full px-3 py-1.5 rounded-lg border border-surface bg-surface-card text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          )}

          {paymentMethod === 'CARD' && (
            <div className="p-3 rounded-xl bg-surface-page border border-surface text-xs space-y-2">
              <p className="font-bold text-text-primary flex items-center gap-1.5 text-xs">
                <CreditCard className="w-4 h-4 text-brand-primary" /> Card Swipe / POS Terminal
              </p>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Card Last 4 Digits / Auth Approval Code"
                className="w-full px-3 py-1.5 rounded-lg border border-surface bg-surface-card text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          )}

          {paymentMethod === 'CREDIT' && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1 text-amber-800 dark:text-amber-300">
              <p className="font-bold text-xs flex items-center gap-1.5">
                ⚠️ Customer Udhaar / Credit Ledger
              </p>
              <p className="text-[11.5px] leading-relaxed">
                This bill will post to <strong>{customerName}</strong>&apos;s outstanding balance ledger.
              </p>
            </div>
          )}

          {paymentMethod === 'SPLIT' && (
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="text-[11px] font-bold text-text-muted block mb-1">
                  Cash Amount (₹)
                </label>
                <input
                  type="number"
                  value={splitCashAmount}
                  onChange={(e) => setSplitCashAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 rounded-xl border border-surface bg-surface-page text-text-primary text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-muted block mb-1">
                  UPI / Card Amount (₹)
                </label>
                <input
                  type="number"
                  value={splitOnlineAmount}
                  onChange={(e) => setSplitOnlineAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 rounded-xl border border-surface bg-surface-page text-text-primary text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* E. Prominent, Clear Discount & Offers Section */}
        <div className="p-3 rounded-2xl border border-surface bg-surface-page/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-brand-primary" /> Bill Discount & Offers
            </span>

            {/* Mode Toggle: % vs Flat */}
            <div className="flex items-center p-0.5 rounded-lg bg-surface-muted border border-surface text-xs font-bold">
              <button
                type="button"
                onClick={() => setDiscountType('PERCENT')}
                className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer text-xs ${
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
                className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer text-xs ${
                  discountType === 'FLAT'
                    ? 'bg-brand-primary text-white shadow-xs font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                ₹ Flat Discount
              </button>
            </div>
          </div>

          {/* Main Large Discount Input */}
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">
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
                className="w-full h-10 pl-8 pr-14 text-sm font-bold text-text-primary rounded-xl border border-surface bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-2xs"
              />
              {discountValue && (
                <button
                  type="button"
                  onClick={() => setDiscountValue('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-text-muted mr-1">Presets:</span>
              {discountType === 'PERCENT' ? (
                <>
                  {[5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountValue(pct.toString())}
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
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
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
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

          {/* Savings Feedback Highlight */}
          {calculatedDiscount > 0 && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-card border border-brand-primary/40 text-xs shadow-2xs">
              <span className="font-bold text-brand-primary flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" /> Customer Discount Savings:
              </span>
              <span className="font-black text-xs text-brand-primary font-mono">
                -{formatCurrency(calculatedDiscount)}
              </span>
            </div>
          )}
        </div>

        {/* F. Financial Totals & Round Off */}
        <div className="space-y-2.5 pt-2 border-t border-surface">
          {/* Round Off Toggle Row */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-surface-page border border-surface text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary">Round Off to Nearest Rupee:</span>
              <span className="text-xs text-text-muted font-mono font-bold">
                {roundOffEnabled ? (roundOffAmount >= 0 ? `+${formatCurrency(roundOffAmount)}` : `-${formatCurrency(Math.abs(roundOffAmount))}`) : 'Disabled'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRoundOffEnabled((r) => !r)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                roundOffEnabled ? 'bg-brand-primary' : 'bg-surface-muted'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  roundOffEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Subtotal & Tax Breakdown */}
          <div className="space-y-1 text-xs text-text-muted py-0.5">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal (Gross Items):</span>
              <span className="font-bold text-text-primary">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tax (GST/VAT 12%):</span>
              <span className="font-bold text-text-primary">{formatCurrency(estimatedTax)}</span>
            </div>
            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                <span>Discount Savings:</span>
                <span>-{formatCurrency(calculatedDiscount)}</span>
              </div>
            )}
            {roundOffEnabled && roundOffAmount !== 0 && (
              <div className="flex justify-between text-text-muted font-medium">
                <span>Round-Off:</span>
                <span>{roundOffAmount > 0 ? `+${formatCurrency(roundOffAmount)}` : `-${formatCurrency(Math.abs(roundOffAmount))}`}</span>
              </div>
            )}
          </div>

          {/* Prominent Payable Amount Bar (Crisp, High Contrast) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-card border-2 border-brand-primary shadow-xs">
            <div>
              <span className="block text-[11px] font-black text-text-primary uppercase tracking-wider">
                Payable Amount
              </span>
              <span className="text-[11px] text-text-muted font-medium">
                Total net payable at counter
              </span>
            </div>
            <span className="font-black text-2xl md:text-3xl text-brand-primary tracking-tight font-mono">
              {formatCurrency(finalNetPayable)}
            </span>
          </div>
        </div>
      </div>

      {/* G. Complete Billing Checkout Button (Anchored Sticky Bottom) */}
      <div className="p-3 border-t border-surface bg-surface-card shrink-0">
        <Button
          onClick={handleCheckout}
          disabled={cart.length === 0 || isCheckingOut}
          className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 text-white font-black text-base rounded-xl shadow-md gap-2 transition-all cursor-pointer"
        >
          {isCheckingOut ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing Invoice...</span>
            </>
          ) : (
            <>
              <Printer className="w-5 h-5" />
              <span>Complete Billing (F6)</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
