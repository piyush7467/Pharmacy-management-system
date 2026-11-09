import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  Receipt,
  PackageCheck,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { apiClient } from '../../services/api/apiClient.js';
import { formatCurrency, formatDate } from '../../lib/utils.js';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';

export function DashboardView() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const [dateRange, setDateRange] = useState('7d');
  const [activeActivityTab, setActiveActivityTab] = useState('sales');

  // Compute ISO date range params for backend query
  const dateParams = useMemo(() => {
    const now = new Date();
    if (dateRange === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      return { startDate: start };
    }
    if (dateRange === '7d') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      return { startDate: start };
    }
    if (dateRange === '30d') {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      return { startDate: start };
    }
    return {};
  }, [dateRange]);

  // 1. Fetch Sales Summary
  const {
    data: salesSummary,
    isLoading: salesLoading,
    refetch: refetchSales
  } = useQuery({
    queryKey: ['dashboard-sales-summary', dateRange],
    queryFn: async () => {
      const res = await apiClient.get('/reports/sales-summary', { params: dateParams });
      return res.data?.data || {};
    }
  });

  // 2. Fetch Inventory Overview & Alerts
  const {
    data: inventoryOverview,
    isLoading: inventoryLoading,
    refetch: refetchInventory
  } = useQuery({
    queryKey: ['dashboard-inventory-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/inventory/overview');
      return res.data?.data || {};
    }
  });

  // 3. Fetch Stock Valuation (Admin & Pharmacist only)
  const { data: stockValuation } = useQuery({
    queryKey: ['dashboard-stock-valuation'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/stock-valuation');
      return res.data?.data || {};
    },
    enabled: user?.role !== 'CASHIER'
  });

  // 4. Fetch Recent Sales
  const { data: recentSalesData } = useQuery({
    queryKey: ['dashboard-recent-sales'],
    queryFn: async () => {
      const res = await apiClient.get('/sales', { params: { limit: 5 } });
      return res.data?.data || [];
    }
  });

  // 5. Fetch Recent Purchases
  const { data: recentPurchasesData } = useQuery({
    queryKey: ['dashboard-recent-purchases'],
    queryFn: async () => {
      const res = await apiClient.get('/purchases', { params: { limit: 5 } });
      return res.data?.data || [];
    }
  });

  const handleRefreshAll = () => {
    refetchSales();
    refetchInventory();
  };

  // Safe calculated metrics
  const netRevenue = salesSummary?.netRevenue || 0;
  const ordersCount = salesSummary?.ordersCount || 0;
  const stockValuationCost = inventoryOverview?.totalActiveCostValuation || stockValuation?.totalCostValuation || 0;
  const totalActiveUnits = inventoryOverview?.totalActiveUnits || 0;
  const nearExpiryCount = inventoryOverview?.nearExpiryBatchesCount || 0;
  const expiredCount = inventoryOverview?.expiredBatchesCount || 0;
  const lowStockCount = inventoryOverview?.lowStockCount || 0;

  // Chart data from real daily trend or fallback single point
  const chartData = useMemo(() => {
    if (salesSummary?.dailyTrend && salesSummary.dailyTrend.length > 0) {
      return salesSummary.dailyTrend.map((d) => ({
        date: d.date.slice(5),
        sales: d.sales,
        orders: d.orders
      }));
    }
    return [
      { date: 'Today', sales: netRevenue, orders: ordersCount }
    ];
  }, [salesSummary, netRevenue, ordersCount]);

  // Payment Breakdown
  const paymentMethods = salesSummary?.paymentMethodDistribution || [];
  const totalPaymentValue = paymentMethods.reduce((sum, p) => sum + (p.value || 0), 0);

  const recentSales = Array.isArray(recentSalesData) ? recentSalesData : [];
  const recentPurchases = Array.isArray(recentPurchasesData) ? recentPurchasesData : [];

  return (
    <div className="space-y-7 pb-10">
      {/* Top Header & Executive Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">
              Pharmacy Operations
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              {user?.role || 'Staff'}
            </span>
          </div>
          <p className="text-[14.5px] text-text-muted mt-1">
            Welcome back, <strong className="text-text-primary font-semibold">{user?.fullName || 'Operator'}</strong>. Real-time overview of sales, batch health, and transactions.
          </p>
        </div>

        {/* Date Filter & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center p-1 rounded-lg bg-surface-muted border border-surface text-xs font-medium">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Time' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setDateRange(btn.id)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                  dateRange === btn.id
                    ? 'bg-surface-card text-brand-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="h-9 px-3 text-[13px] gap-1.5"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${salesLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/pos')}
            className="h-9 px-3.5 text-[13.5px] font-semibold bg-brand-primary text-white hover:opacity-90 gap-1.5 shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>New Sale (POS)</span>
          </Button>
        </div>
      </div>

      {/* Critical Stock Warning Strip (Appears only when alerts exist) */}
      {(expiredCount > 0 || nearExpiryCount > 0 || lowStockCount > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-text-primary">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[14.5px] font-semibold text-text-primary">
                Inventory Alerts Requiring Attention
              </p>
              <p className="text-[13px] text-text-muted">
                {expiredCount > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-semibold mr-2">
                    {expiredCount} expired {expiredCount === 1 ? 'batch' : 'batches'} quarantined
                  </span>
                )}
                {nearExpiryCount > 0 && (
                  <span className="mr-2">
                    • {nearExpiryCount} near-expiry (&lt; 60 days)
                  </span>
                )}
                {lowStockCount > 0 && (
                  <span>
                    • {lowStockCount} medicines below minimum reorder level
                  </span>
                )}
              </p>
            </div>
          </div>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
          >
            Manage Batch Stock <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Primary KPI Strip — Clean, fluid, and NOT boxy */}
      <div className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-surface bg-surface-card divide-y sm:divide-y-0 sm:divide-x divide-surface overflow-hidden shadow-xs">
        {/* Metric 1: Net Revenue */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-medium text-text-muted">Net Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              {formatCurrency(netRevenue)}
            </div>
            <p className="text-[12.5px] text-text-muted mt-1 flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{ordersCount}</span> completed sales in period
            </p>
          </div>
        </div>

        {/* Metric 2: Completed Transactions */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-medium text-text-muted">Invoices Issued</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              {ordersCount}
            </div>
            <p className="text-[12.5px] text-text-muted mt-1">
              FEFO batch auto-allocation
            </p>
          </div>
        </div>

        {/* Metric 3: Active Stock Valuation */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-medium text-text-muted">Stock Valuation (Cost)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              {user?.role === 'CASHIER' ? 'Protected' : formatCurrency(stockValuationCost)}
            </div>
            <p className="text-[12.5px] text-text-muted mt-1">
              <span className="font-semibold text-text-primary">{totalActiveUnits}</span> total active units in shelf
            </p>
          </div>
        </div>

        {/* Metric 4: Stock Integrity Status */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-medium text-text-muted">Stock Health</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {expiredCount > 0 ? (
                <span className="text-red-600 dark:text-red-400">{expiredCount} Expired</span>
              ) : nearExpiryCount > 0 ? (
                <span className="text-amber-600 dark:text-amber-400">{nearExpiryCount} Near Expiry</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">Optimal</span>
              )}
            </div>
            <p className="text-[12.5px] text-text-muted mt-1">
              {lowStockCount > 0 ? `${lowStockCount} items need restock` : 'All items above reorder level'}
            </p>
          </div>
        </div>
      </div>

      {/* Sales Analytics & Tender Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sales Trend (Takes 2 columns) */}
        <div className="lg:col-span-2 rounded-2xl border border-surface bg-surface-card p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-bold text-text-primary">Sales Revenue Trend</h2>
              <p className="text-[13px] text-text-muted">Daily net billing across completed transactions</p>
            </div>
            <span className="text-[12px] font-medium text-text-muted px-2.5 py-1 rounded bg-surface-muted">
              {dateRange.toUpperCase()}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg bg-surface-card border border-surface p-3 shadow-lg text-xs">
                          <p className="font-bold text-text-primary mb-1">{data.date}</p>
                          <p className="text-brand-primary font-semibold">Sales: {formatCurrency(data.sales)}</p>
                          <p className="text-text-muted">Orders: {data.orders}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Payment Method Breakdown */}
        <div className="rounded-2xl border border-surface bg-surface-card p-5 md:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-text-primary">Payment Tender Distribution</h2>
            <p className="text-[13px] text-text-muted">Settlement modes for sales in period</p>
          </div>

          <div className="space-y-4 my-auto py-4">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((pm) => {
                const pct = totalPaymentValue > 0 ? Math.round((pm.value / totalPaymentValue) * 100) : 0;
                const Icon = pm.name === 'Cash' ? Banknote : pm.name === 'Card' ? CreditCard : QrCode;
                return (
                  <div key={pm.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[13.5px]">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-brand-primary" />
                        <span className="font-semibold text-text-primary">{pm.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">{formatCurrency(pm.value)}</span>
                        <span className="text-text-muted text-[12px] font-mono">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-text-muted text-sm">
                No recorded sales in selected period.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-surface flex items-center justify-between text-[12.5px] text-text-muted">
            <span>Gross Collection:</span>
            <span className="font-bold text-text-primary text-[14px]">{formatCurrency(totalPaymentValue)}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Hub — Unified Tabs (Sales vs Purchases) */}
      <div className="rounded-2xl border border-surface bg-surface-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface px-5 py-4 gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveActivityTab('sales')}
              className={`text-[15px] font-bold pb-1 transition-colors relative ${
                activeActivityTab === 'sales'
                  ? 'text-brand-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Recent Sales Invoices
              {activeActivityTab === 'sales' && (
                <span className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-brand-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveActivityTab('purchases')}
              className={`text-[15px] font-bold pb-1 transition-colors relative ${
                activeActivityTab === 'purchases'
                  ? 'text-brand-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Recent Purchase Invoices
              {activeActivityTab === 'purchases' && (
                <span className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-brand-primary" />
              )}
            </button>
          </div>

          <Link
            to={activeActivityTab === 'sales' ? '/sales' : '/purchases'}
            className="text-[13px] font-semibold text-brand-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            View All {activeActivityTab === 'sales' ? 'Sales' : 'Purchases'} <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Activity Table Content */}
        <div className="overflow-x-auto">
          {activeActivityTab === 'sales' ? (
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-surface bg-surface-muted/30 text-[12px] font-semibold uppercase tracking-wider text-text-muted">
                  <th className="py-3 px-5">Invoice #</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Payment Mode</th>
                  <th className="py-3 px-5">Date & Time</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface">
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-text-primary">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-5 text-text-primary">
                        {sale.customerName || 'Walk-in Customer'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-surface-muted text-text-primary">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-text-muted text-[13px]">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold text-text-primary">
                        {formatCurrency(Number(sale.totalAmount))}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Badge
                          variant={sale.status === 'COMPLETED' ? 'default' : 'secondary'}
                          className="text-[11.5px]"
                        >
                          {sale.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted text-[14px]">
                      No recent sales found. Start a new checkout via POS.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-surface bg-surface-muted/30 text-[12px] font-semibold uppercase tracking-wider text-text-muted">
                  <th className="py-3 px-5">PO Number</th>
                  <th className="py-3 px-5">Supplier</th>
                  <th className="py-3 px-5">Invoice Date</th>
                  <th className="py-3 px-5 text-right">Grand Total</th>
                  <th className="py-3 px-5 text-center">Intake Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface">
                {recentPurchases.length > 0 ? (
                  recentPurchases.map((po) => (
                    <tr key={po.id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-text-primary">
                        {po.purchaseNumber}
                      </td>
                      <td className="py-3.5 px-5 text-text-primary font-medium">
                        {po.supplier?.name || 'Authorized Distributor'}
                      </td>
                      <td className="py-3.5 px-5 text-text-muted text-[13px]">
                        {formatDate(po.createdAt)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold text-text-primary">
                        {formatCurrency(Number(po.grandTotal))}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Badge
                          variant={po.status === 'RECEIVED' ? 'default' : 'outline'}
                          className="text-[11.5px]"
                        >
                          {po.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted text-[14px]">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Action Footer Pills */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/medicines')}
            className="text-[13px] gap-1.5 h-9"
          >
            <Boxes className="w-4 h-4 text-brand-primary" />
            <span>Medicine Catalogue</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/purchases')}
            className="text-[13px] gap-1.5 h-9"
          >
            <PackageCheck className="w-4 h-4 text-brand-primary" />
            <span>Receive Purchases</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/returns')}
            className="text-[13px] gap-1.5 h-9"
          >
            <Receipt className="w-4 h-4 text-brand-primary" />
            <span>Customer Return</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
            className="text-[13px] gap-1.5 h-9"
          >
            <TrendingUp className="w-4 h-4 text-brand-primary" />
            <span>Financial Reports</span>
          </Button>
        </div>

        <p className="text-[12px] text-text-muted font-mono">
          PharmaFlow v1.0 • Connected to Neon DB
        </p>
      </div>
    </div>
  );
}
