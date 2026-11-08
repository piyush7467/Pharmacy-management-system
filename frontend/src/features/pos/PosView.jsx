import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  User,
  Phone
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { formatCurrency, formatDate } from '../../lib/utils.js';

export function PosView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Success Invoice Modal state
  const [completedSale, setCompletedSale] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const printRef = useRef(null);

  // Fetch active medicines with stock
  const { data: medicinesData, isLoading } = useQuery({
    queryKey: ['pos-medicines', searchTerm],
    queryFn: async () => {
      const res = await apiClient.get('/medicines', {
        params: {
          search: searchTerm,
          isActive: true,
          limit: 30
        }
      });
      return res.data?.medicines || res.data || [];
    }
  });

  const medicines = Array.isArray(medicinesData) ? medicinesData : medicinesData?.medicines || [];

  // Mutation to process checkout
  const checkoutMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/sales', payload);
      return res.data;
    },
    onSuccess: (data) => {
      const sale = data.data;
      toast.success(`Invoice ${sale.invoiceNumber} processed successfully!`);
      setCompletedSale(sale);
      setInvoiceModalOpen(true);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      clearCart();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Checkout failed. Please check stock levels.');
    }
  });

  // Cart operations
  const addToCart = (med) => {
    if (med.totalAvailableStock <= 0) {
      toast.error(`${med.name} is out of stock!`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.medicineId === med.id);
      if (existing) {
        if (existing.quantity >= med.totalAvailableStock) {
          toast.warning(`Cannot exceed available stock (${med.totalAvailableStock} units)`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.medicineId === med.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Read earliest batch price as estimate (server FEFO determines exact amount)
      const estimatedPrice = med.batches?.[0]?.salePrice || 10;
      return [
        ...prevCart,
        {
          medicineId: med.id,
          name: med.name,
          sku: med.sku,
          strength: med.strength,
          dosageForm: med.dosageForm,
          availableStock: med.totalAvailableStock,
          earliestBatch: med.batches?.[0]?.batchNumber || 'FEFO Auto',
          earliestExpiry: med.earliestExpiryDate,
          unitPrice: estimatedPrice,
          taxRate: med.defaultTaxRate || 10,
          quantity: 1
        }
      ];
    });
  };

  const updateQuantity = (medicineId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.medicineId === medicineId) {
          if (newQty > item.availableStock) {
            toast.warning(`Maximum available stock is ${item.availableStock}`);
            return { ...item, quantity: item.availableStock };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (medicineId) => {
    setCart((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setTenderedAmount('');
    setDiscountAmount(0);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const estimatedTax = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100),
    0
  );
  const numericDiscount = Math.max(0, parseFloat(discountAmount) || 0);
  const grandTotal = Math.max(0, subtotal + estimatedTax - numericDiscount);

  const tendered = parseFloat(tenderedAmount) || 0;
  const changeDue = Math.max(0, tendered - grandTotal);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod === 'CASH' && tendered > 0 && tendered < grandTotal) {
      toast.error('Tendered cash is less than payable amount');
      return;
    }

    checkoutMutation.mutate({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || undefined,
      paymentMethod,
      discountAmount: numericDiscount,
      items: cart.map((i) => ({
        medicineId: i.medicineId,
        quantity: i.quantity
      }))
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-brand-primary" />
            Point of Sale (POS) Checkout
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Real-time automated FEFO inventory deduction and instant fiscal billing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-brand-primary border-brand-primary/20 bg-brand-primary/5 py-1 px-3">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Active FEFO Engine
          </Badge>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-text-muted hover:text-rose-500 h-8">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Cart
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Medication Catalog / Barcode Search */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-surface-card border-surface">
            <CardHeader className="p-4 pb-3 border-b border-surface">
              <div className="relative">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Scan barcode or type medication name / SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-surface-bg border-surface text-sm"
                  autoFocus
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="py-12 text-center text-text-muted">Loading available medications...</div>
              ) : medicines.length === 0 ? (
                <div className="py-12 text-center text-text-muted">
                  <AlertCircle className="w-8 h-8 mx-auto text-text-muted/40 mb-2" />
                  <p className="font-medium text-text-primary">No matching medications found</p>
                  <p className="text-xs text-text-muted mt-1">Check spelling or create a purchase intake.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
                  {medicines.map((med) => {
                    const inStock = med.totalAvailableStock > 0;
                    return (
                      <div
                        key={med.id}
                        onClick={() => inStock && addToCart(med)}
                        className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                          inStock
                            ? 'border-surface bg-surface-bg/40 hover:bg-surface-card hover:border-brand-primary/40 cursor-pointer shadow-sm hover:shadow'
                            : 'border-surface/40 bg-surface-bg/10 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm text-text-primary line-clamp-1">{med.name}</h3>
                            <span className="font-bold text-xs text-brand-primary shrink-0">
                              {formatCurrency(med.batches?.[0]?.salePrice || 10)}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted font-mono">{med.sku}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                            <span>{med.dosageForm}</span>
                            <span>•</span>
                            <span>{med.strength}</span>
                          </div>
                        </div>

                        <div className="pt-3 mt-2 border-t border-surface/50 flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              inStock
                                ? med.isLowStock
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            {inStock ? `${med.totalAvailableStock} in stock` : 'Out of Stock'}
                          </span>

                          {inStock && (
                            <span className="text-xs text-text-muted flex items-center gap-1">
                              <Plus className="w-3.5 h-3.5 text-brand-primary" />
                              Add
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Active Cart & Fast Checkout */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-surface-card border-surface flex flex-col h-full">
            <CardHeader className="p-4 pb-3 border-b border-surface">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-brand-primary" />
                  Current Checkout Bill
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} items
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
              {/* Customer Inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px] text-text-muted flex items-center gap-1">
                    <User className="w-3 h-3" /> Customer Name
                  </Label>
                  <Input
                    placeholder="Walk-in Customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-8 text-xs bg-surface-bg border-surface"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-text-muted flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone (Optional)
                  </Label>
                  <Input
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-8 text-xs bg-surface-bg border-surface"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 border-t border-b border-surface py-2">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-text-muted">
                    <ShoppingCart className="w-8 h-8 mx-auto text-text-muted/40 mb-2" />
                    <p className="text-sm font-medium">Cart is currently empty</p>
                    <p className="text-xs text-text-muted mt-0.5">Select items from the catalog on the left.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.medicineId}
                      className="p-2.5 rounded-xl border border-surface bg-surface-bg/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text-primary truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                          <span className="font-mono">{formatCurrency(item.unitPrice)}</span>
                          <span>•</span>
                          <span className="text-brand-primary flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> FEFO: {item.earliestBatch}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1 bg-surface-card border border-surface rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-bold text-text-primary text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-text-primary">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.medicineId)}
                          className="text-[10px] text-rose-500 hover:text-rose-600 mt-0.5"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] font-medium text-text-muted">Payment Tender</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'CASH'
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm'
                        : 'border-surface bg-surface-bg text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" /> Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm'
                        : 'border-surface bg-surface-bg text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm'
                        : 'border-surface bg-surface-bg text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" /> UPI
                  </button>
                </div>
              </div>

              {/* Cash change calculator */}
              {paymentMethod === 'CASH' && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-text-muted">Cash Tendered ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={tenderedAmount}
                      onChange={(e) => setTenderedAmount(e.target.value)}
                      className="h-8 text-xs bg-surface-bg border-surface font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-text-muted">Change Return ($)</Label>
                    <div className="h-8 px-3 rounded-md bg-surface-bg/80 border border-surface flex items-center justify-end font-bold text-brand-primary text-xs">
                      {formatCurrency(changeDue)}
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Totals Box */}
              <div className="p-3.5 rounded-xl border border-surface bg-surface-bg/60 space-y-2 text-xs">
                <div className="flex items-center justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-text-primary">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-text-primary">{formatCurrency(estimatedTax)}</span>
                </div>
                {numericDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(numericDiscount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-surface flex items-center justify-between">
                  <span className="font-bold text-sm text-text-primary">Net Total</span>
                  <span className="font-extrabold text-lg text-brand-primary">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                type="button"
                onClick={handleCheckout}
                disabled={cart.length === 0 || checkoutMutation.isPending}
                className="w-full bg-brand-primary hover:bg-brand-secondary text-white py-5 text-sm font-bold shadow-md flex items-center justify-center gap-2"
              >
                {checkoutMutation.isPending ? (
                  'Allocating Batches & Billing...'
                ) : (
                  <>
                    Complete Checkout <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PRINTABLE FISCAL INVOICE MODAL */}
      <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
        <DialogContent className="max-w-xl bg-surface-card border-surface">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Transaction Completed
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Fiscal tax receipt and FEFO batch distribution slip.
            </DialogDescription>
          </DialogHeader>

          {completedSale && (
            <div className="space-y-4 pt-2">
              {/* Receipt Body (Print Target) */}
              <div
                ref={printRef}
                className="p-5 rounded-xl border border-surface bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs space-y-3"
              >
                <div className="text-center pb-3 border-b border-dashed border-zinc-300 dark:border-zinc-700 space-y-1">
                  <h2 className="text-base font-bold tracking-tight uppercase">PharmaFlow Pharmacy</h2>
                  <p className="text-[11px] text-zinc-500">Licensed Retail Dispensary • Demo Suite</p>
                  <p className="text-[11px] text-zinc-500 font-semibold">TAX INVOICE #{completedSale.invoiceNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
                  <div>
                    <span className="block text-zinc-400">Date:</span>
                    <span>{formatDate(completedSale.createdAt)}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-zinc-400">Cashier:</span>
                    <span>{completedSale.cashier?.fullName || 'Staff'}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-400">Customer:</span>
                    <span className="font-semibold">{completedSale.customerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-zinc-400">Payment:</span>
                    <span className="font-semibold">{completedSale.paymentMethod}</span>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="space-y-2 py-1">
                  <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span className="col-span-6">Item (Batch #)</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                    <span className="col-span-2 text-right">Total</span>
                  </div>
                  {completedSale.items?.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 text-[11px] py-0.5">
                      <div className="col-span-6">
                        <span className="font-semibold block truncate">{item.medicine?.name}</span>
                        <span className="text-[9px] text-zinc-500">
                          Lot: {item.batch?.batchNumber} • Exp: {formatDate(item.batch?.expiryDate)}
                        </span>
                      </div>
                      <span className="col-span-2 text-center">{item.quantity}</span>
                      <span className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</span>
                      <span className="col-span-2 text-right font-bold">{formatCurrency(item.totalAmount)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals Breakdown */}
                <div className="pt-2 border-t border-dashed border-zinc-300 dark:border-zinc-700 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(completedSale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST/VAT):</span>
                    <span>{formatCurrency(completedSale.taxAmount)}</span>
                  </div>
                  {completedSale.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(completedSale.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <span>GRAND TOTAL:</span>
                    <span>{formatCurrency(completedSale.totalAmount)}</span>
                  </div>
                </div>

                <div className="text-center pt-2 text-[10px] text-zinc-400">
                  <p>Medicines once sold cannot be returned without original receipt.</p>
                  <p className="mt-0.5">Thank you for choosing PharmaFlow!</p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setInvoiceModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={handlePrint} className="bg-brand-primary text-white gap-2">
                  <Printer className="w-4 h-4" /> Print Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
