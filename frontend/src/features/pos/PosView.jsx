import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import { apiClient } from '../../services/api/apiClient.js';
import { PosHeader } from './components/PosHeader.jsx';
import { MedicineCatalog } from './components/MedicineCatalog.jsx';
import { ActiveCartPanel } from './components/ActiveCartPanel.jsx';
import { BillingSettlementView } from './components/BillingSettlementView.jsx';
import { CustomerModal } from './components/CustomerModal.jsx';
import { ShortcutsModal } from './components/ShortcutsModal.jsx';
import { ThermalInvoiceModal } from './components/ThermalInvoiceModal.jsx';

export function PosView() {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth?.user);
  const shopProfile = useSelector((state) => state.preferences?.shopProfile);

  // Workflow Step State: 'SELECTION' (Step 1) | 'SETTLEMENT' (Step 2)
  const [posStep, setPosStep] = useState('SELECTION');

  // Search & Filter State
  const [activeTab, setActiveTab] = useState('SEARCH');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('ALL');
  const [selectedDosageForm, setSelectedDosageForm] = useState('ALL');
  const [sortBy, setSortBy] = useState('RELEVANCE');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [expandedMedIds, setExpandedMedIds] = useState(new Set());
  const searchInputRef = useRef(null);

  // Cart & Customer State
  const [tempBillNumber] = useState(() => `TMP-${Math.floor(100000 + Math.random() * 900000)}`);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');

  // Payment Tender State
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [splitCashAmount, setSplitCashAmount] = useState('');
  const [splitOnlineAmount, setSplitOnlineAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  // Discount & Round-Off State
  const [discountType, setDiscountType] = useState('PERCENT');
  const [discountValue, setDiscountValue] = useState('');
  const [roundOffEnabled, setRoundOffEnabled] = useState(false);

  // Modals State
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // 1. Fetch active medicines from backend
  const { data: medicinesData, isLoading } = useQuery({
    queryKey: ['pos-medicines', searchTerm],
    queryFn: async () => {
      const res = await apiClient.get('/medicines', {
        params: {
          search: searchTerm,
          isActive: true,
          limit: 50
        }
      });
      return res.data?.medicines || res.data || [];
    }
  });

  const rawMedicines = Array.isArray(medicinesData) ? medicinesData : medicinesData?.medicines || [];

  // Filter & Sort medicines in memory
  const filteredMedicines = useMemo(() => {
    let result = [...rawMedicines];

    if (filterStock === 'IN_STOCK') {
      result = result.filter((m) => m.totalAvailableStock > 0);
    } else if (filterStock === 'LOW_STOCK') {
      result = result.filter((m) => m.isLowStock || (m.totalAvailableStock > 0 && m.totalAvailableStock <= 10));
    } else if (filterStock === 'NEAR_EXPIRY') {
      const ninetyDaysAhead = new Date();
      ninetyDaysAhead.setDate(ninetyDaysAhead.getDate() + 90);
      result = result.filter((m) => {
        if (!m.earliestExpiry) return false;
        return new Date(m.earliestExpiry) <= ninetyDaysAhead;
      });
    }

    if (selectedDosageForm !== 'ALL') {
      result = result.filter((m) => m.dosageForm?.toLowerCase() === selectedDosageForm.toLowerCase());
    }

    if (sortBy === 'NAME_ASC') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'PRICE_LOW') {
      result.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
    } else if (sortBy === 'PRICE_HIGH') {
      result.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
    } else if (sortBy === 'STOCK_HIGH') {
      result.sort((a, b) => (b.totalAvailableStock || 0) - (a.totalAvailableStock || 0));
    }

    return result;
  }, [rawMedicines, filterStock, selectedDosageForm, sortBy]);

  // Reset highlighted index on search/filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, filterStock, selectedDosageForm]);

  // 2. Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/sales', payload);
      return res?.data || res;
    },
    onSuccess: (resData) => {
      const sale = resData?.invoiceNumber ? resData : resData?.data || resData;
      if (sale && sale.invoiceNumber) {
        toast.success(`Invoice ${sale.invoiceNumber} processed successfully!`);
        setCompletedSale(sale);
        setInvoiceModalOpen(true);
      } else {
        toast.success('Sale processed successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-overview'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-sales-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-inventory-overview'] });
      queryClient.invalidateQueries({ queryKey: ['report-sales-summary'] });
      queryClient.invalidateQueries({ queryKey: ['report-stock-valuation'] });
      queryClient.invalidateQueries({ queryKey: ['report-reconciliation'] });
      clearCart();
      setPosStep('SELECTION');
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Checkout failed. Please check stock levels.';
      toast.error(message);
    }
  });

  // 3. Cart Actions
  const addToCart = useCallback((med, selectedBatch = null) => {
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

      const batchToUse = selectedBatch || med.batches?.[0];
      const actualPrice = Number(batchToUse?.salePrice ?? med.salePrice ?? 0);

      return [
        ...prevCart,
        {
          medicineId: med.id,
          name: med.name,
          sku: med.sku,
          strength: med.strength,
          dosageForm: med.dosageForm,
          packageUnit: med.packageUnit,
          availableStock: med.totalAvailableStock,
          earliestBatch: batchToUse?.batchNumber || med.earliestBatch || 'FEFO Auto',
          earliestExpiry: batchToUse?.expiryDate || med.earliestExpiry,
          unitPrice: actualPrice,
          taxRate: med.defaultTaxRate || 12,
          quantity: 1
        }
      ];
    });
  }, []);

  const updateQuantity = useCallback((medicineId, newQty) => {
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
  }, []);

  const removeFromCart = useCallback((medicineId) => {
    setCart((prev) => prev.filter((item) => item.medicineId !== medicineId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setTenderedAmount('');
    setSplitCashAmount('');
    setSplitOnlineAmount('');
    setDiscountValue('');
  }, []);

  const handleSelectCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone || '');
      if (customer.defaultDiscountPct > 0) {
        setDiscountType('PERCENT');
        setDiscountValue(String(customer.defaultDiscountPct));
        toast.info(`Applied ${customer.defaultDiscountPct}% customer tier discount`);
      }
    } else {
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
    }
  }, []);

  const toggleExpandMed = useCallback((medId) => {
    setExpandedMedIds((prev) => {
      const next = new Set(prev);
      if (next.has(medId)) {
        next.delete(medId);
      } else {
        next.add(medId);
      }
      return next;
    });
  }, []);

  // 4. Financial Calculations
  const subtotal = Math.round(
    cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * 100
  ) / 100;

  const estimatedTax = Math.round(
    cart.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100),
      0
    ) * 100
  ) / 100;

  const grossPayable = Math.round((subtotal + estimatedTax) * 100) / 100;

  const calculatedDiscount = useMemo(() => {
    if (!discountValue || isNaN(Number(discountValue))) return 0;
    const num = Math.max(0, Number(discountValue));
    if (discountType === 'PERCENT') {
      const validPercent = Math.min(100, num);
      return Math.round(grossPayable * (validPercent / 100) * 100) / 100;
    }
    return Math.min(grossPayable, Math.round(num * 100) / 100);
  }, [grossPayable, discountValue, discountType]);

  const basePayable = Math.max(0, Math.round((grossPayable - calculatedDiscount) * 100) / 100);

  const roundOffAmount = roundOffEnabled
    ? Math.round((Math.round(basePayable) - basePayable) * 100) / 100
    : 0;

  const finalNetPayable = Math.max(0, Math.round((basePayable + roundOffAmount) * 100) / 100);

  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'CASH' || !tenderedAmount) return 0;
    const received = parseFloat(tenderedAmount);
    if (isNaN(received) || received < finalNetPayable) return 0;
    return Math.round((received - finalNetPayable) * 100) / 100;
  }, [paymentMethod, tenderedAmount, finalNetPayable]);

  // 5. Checkout Handler
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod === 'CASH') {
      const received = parseFloat(tenderedAmount);
      if (received && received < finalNetPayable) {
        toast.error('Cash received cannot be less than payable total');
        return;
      }
    }

    if (paymentMethod === 'SPLIT') {
      const cash = parseFloat(splitCashAmount) || 0;
      const online = parseFloat(splitOnlineAmount) || 0;
      if (Math.abs(cash + online - finalNetPayable) > 0.5) {
        toast.error(`Split amounts (₹${cash + online}) must equal Payable Amount (₹${finalNetPayable})`);
        return;
      }
    }

    if (paymentMethod === 'CREDIT' || paymentMethod === 'CREDIT_LEDGER') {
      if (!selectedCustomer) {
        toast.error('A registered customer account is required for Credit / Udhaar settlement');
        return;
      }
      if (selectedCustomer.creditLimit > 0) {
        const currentBal = selectedCustomer.currentBalance || 0;
        if (currentBal + finalNetPayable > selectedCustomer.creditLimit) {
          toast.error(
            `Credit limit exceeded. Current Balance: ₹${currentBal.toFixed(2)}, Limit: ₹${selectedCustomer.creditLimit.toFixed(2)}, Order: ₹${finalNetPayable.toFixed(2)}`
          );
          return;
        }
      }
    }

    checkoutMutation.mutate({
      customerId: selectedCustomer?.id || undefined,
      customerName: selectedCustomer ? selectedCustomer.name : (customerName.trim() || 'Walk-in Customer'),
      customerPhone: selectedCustomer ? (selectedCustomer.phone || undefined) : (customerPhone.trim() || undefined),
      paymentMethod: paymentMethod === 'CREDIT' ? 'CREDIT_LEDGER' : paymentMethod,
      discountAmount: calculatedDiscount,
      roundOffAmount,
      items: cart.map((i) => ({
        medicineId: i.medicineId,
        quantity: i.quantity
      }))
    });
  };

  // 6. Voice Search
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.info('Voice search not supported in this browser. Please type to search.');
      return;
    }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'en-IN';
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSearchTerm(transcript);
      toast.success(`Voice: "${transcript}"`);
    };
    recognition.start();
  };

  // 7. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape handling
      if (invoiceModalOpen && e.key === 'Escape') {
        setInvoiceModalOpen(false);
        return;
      }
      if (shortcutsModalOpen && e.key === 'Escape') {
        setShortcutsModalOpen(false);
        return;
      }
      if (customerModalOpen && e.key === 'Escape') {
        setCustomerModalOpen(false);
        return;
      }
      if (posStep === 'SETTLEMENT' && e.key === 'Escape') {
        setPosStep('SELECTION');
        return;
      }

      // F1: Focus Search Bar or toggle Shortcuts
      if (e.key === 'F1') {
        e.preventDefault();
        if (e.shiftKey) {
          setShortcutsModalOpen((prev) => !prev);
        } else {
          if (posStep === 'SETTLEMENT') setPosStep('SELECTION');
          setTimeout(() => searchInputRef.current?.focus(), 50);
        }
        return;
      }

      // F2/F3/F4: Payment Mode hotkeys
      if (e.key === 'F2') {
        e.preventDefault();
        setPaymentMethod('CASH');
        toast.info('Payment mode: Cash (F2)');
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        setPaymentMethod('UPI');
        toast.info('Payment mode: UPI (F3)');
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setPaymentMethod('CARD');
        toast.info('Payment mode: Card (F4)');
        return;
      }

      // F6 or Ctrl+Enter: Proceed or Checkout
      if (e.key === 'F6' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        if (posStep === 'SELECTION') {
          if (cart.length > 0) {
            setPosStep('SETTLEMENT');
          } else {
            toast.warning('Please add medicines to cart first');
          }
        } else if (posStep === 'SETTLEMENT') {
          if (!checkoutMutation.isPending) {
            handleCheckout();
          }
        }
        return;
      }

      // Step 1: Search arrow navigation & enter to select
      if (posStep === 'SELECTION' && document.activeElement === searchInputRef.current && filteredMedicines.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(filteredMedicines.length - 1, prev + 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(0, prev - 1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const target = filteredMedicines[highlightedIndex];
          if (target && target.totalAvailableStock > 0) {
            addToCart(target);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [invoiceModalOpen, shortcutsModalOpen, customerModalOpen, posStep, filteredMedicines, highlightedIndex, cart, checkoutMutation.isPending]);

  return (
    <div className="h-full w-full flex flex-col space-y-3 overflow-hidden">
      {/* STEP 1: Medicine Selection & Cart Staging */}
      {posStep === 'SELECTION' ? (
        <>
          {/* Header */}
          <PosHeader
            onReset={() => {
              clearCart();
              toast.info('Billing cart cleared');
            }}
            onNewBill={() => {
              clearCart();
              searchInputRef.current?.focus();
              toast.success('Ready for new bill');
            }}
            onOpenShortcuts={() => setShortcutsModalOpen(true)}
            cartCount={cart.length}
          />

          {/* Side-By-Side Workspace */}
          <div className="w-full flex-1 min-h-0 flex flex-row flex-nowrap gap-4 overflow-hidden">
            {/* Left Panel: Medicine Search & Inventory */}
            <div className="flex-1 min-w-[360px] h-full overflow-hidden">
              <MedicineCatalog
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStock={filterStock}
                setFilterStock={setFilterStock}
                selectedDosageForm={selectedDosageForm}
                setSelectedDosageForm={setSelectedDosageForm}
                sortBy={sortBy}
                setSortBy={setSortBy}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                highlightedIndex={highlightedIndex}
                expandedMedIds={expandedMedIds}
                toggleExpandMed={toggleExpandMed}
                addToCart={addToCart}
                handleVoiceSearch={handleVoiceSearch}
                searchInputRef={searchInputRef}
                isLoading={isLoading}
                medicines={filteredMedicines}
              />
            </div>

            {/* Right Panel: Spacious Active Cart */}
            <div className="w-[420px] 2xl:w-[460px] shrink-0 h-full overflow-hidden">
              <ActiveCartPanel
                tempBillNumber={tempBillNumber}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={handleSelectCustomer}
                onOpenCustomerModal={() => setCustomerModalOpen(true)}
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
                subtotal={subtotal}
                estimatedTax={estimatedTax}
                grossPayable={grossPayable}
                onProceedToBilling={() => {
                  if (cart.length === 0) {
                    toast.warning('Please add at least 1 medicine to proceed');
                    return;
                  }
                  setPosStep('SETTLEMENT');
                }}
              />
            </div>
          </div>
        </>
      ) : (
        /* STEP 2: Dedicated Billing Settlement & Payment Screen */
        <BillingSettlementView
          onBackToSelection={() => setPosStep('SELECTION')}
          tempBillNumber={tempBillNumber}
          customerName={customerName}
          customerPhone={customerPhone}
          selectedCustomer={selectedCustomer}
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          tenderedAmount={tenderedAmount}
          setTenderedAmount={setTenderedAmount}
          splitCashAmount={splitCashAmount}
          setSplitCashAmount={setSplitCashAmount}
          splitOnlineAmount={splitOnlineAmount}
          setSplitOnlineAmount={setSplitOnlineAmount}
          paymentReference={paymentReference}
          setPaymentReference={setPaymentReference}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          calculatedDiscount={calculatedDiscount}
          grossPayable={grossPayable}
          roundOffEnabled={roundOffEnabled}
          setRoundOffEnabled={setRoundOffEnabled}
          roundOffAmount={roundOffAmount}
          subtotal={subtotal}
          estimatedTax={estimatedTax}
          finalNetPayable={finalNetPayable}
          changeAmount={changeAmount}
          handleCheckout={handleCheckout}
          isCheckingOut={checkoutMutation.isPending}
        />
      )}

      {/* Shared Dialog Modals */}
      <CustomerModal
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        onCustomerSet={handleSelectCustomer}
      />

      <ShortcutsModal
        open={shortcutsModalOpen}
        onOpenChange={setShortcutsModalOpen}
      />

      <ThermalInvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        completedSale={completedSale}
        shopProfile={shopProfile}
        user={user}
      />
    </div>
  );
}
