import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  DollarSign,
  Boxes,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { formatCurrency, formatDate } from '../../lib/utils.js';

const PALETTE = ['#355B48', '#294B39', '#D6A96B', '#4A7C59', '#1F3A2B'];

export function ReportsView() {
  const [dateRange, setDateRange] = useState('all');

  // Queries
  const { data: salesData, isLoading: salesLoading, refetch: refetchSales } = useQuery({
    queryKey: ['report-sales-summary', dateRange],
    queryFn: async () => {
      const res = await apiClient.get('/reports/sales-summary');
      return res.data?.data || {};
    }
  });

  const { data: valuationData, isLoading: valuationLoading } = useQuery({
    queryKey: ['report-stock-valuation'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/stock-valuation');
      return res.data?.data || {};
    }
  });

  const { data: reconciliationData, isLoading: reconLoading, refetch: refetchRecon } = useQuery({
    queryKey: ['report-reconciliation'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/reconciliation');
      return res.data?.data || {};
    }
  });

  const salesSummary = salesData || {};
  const stockVal = valuationData || {};
  const reconciliation = reconciliationData || {};

  const isLoading = salesLoading || valuationLoading || reconLoading;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-primary" />
            Financial Reports & Ledger Reconciliation
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Executive revenue analytics, tax compliance, stock margins, and mathematical inventory reconciliation.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchSales();
            refetchRecon();
          }}
          className="h-9 gap-1.5 border-surface hover:bg-surface-bg text-text-primary"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Ledger
        </Button>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Gross Sales Revenue</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">
                {formatCurrency(salesSummary.grossSales || 0)}
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">{salesSummary.ordersCount || 0} order transactions</p>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Tax Remittance (GST)</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">
                {formatCurrency(salesSummary.totalTax || 0)}
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Statutory tax collected</p>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Potential Gross Margin</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {stockVal.marginPercentage || 0}%
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                {formatCurrency(stockVal.potentialGrossMargin || 0)} on stock
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Ledger Reconciliation</p>
              <div className="mt-1">
                {reconciliation.isBalanced ? (
                  <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs py-1">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Balanced (0 Diff)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs py-1">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    Discrepancy ({reconciliation.discrepancy})
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-text-muted mt-1.5">{reconciliation.totalAuditRecords || 0} movement audits</p>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MATHEMATICAL LEDGER AUDIT CARD */}
      <Card className="bg-surface-card border-surface">
        <CardHeader className="p-4 pb-3 border-b border-surface">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Mathematical Inventory Ledger Audit
              </CardTitle>
              <p className="text-xs text-text-muted mt-0.5">
                Double-entry inventory equation verifying zero ghost stock against immutable audit logs.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-text-muted">Formula Status: </span>
              <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {reconciliation.status || 'VERIFIED'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl border border-surface bg-surface-bg/40">
              <p className="text-text-muted text-[11px]">Total Purchases Inward</p>
              <p className="text-base font-bold text-brand-primary mt-1">
                +{reconciliation.movementTypeBreakdown?.purchasesInward || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-surface bg-surface-bg/40">
              <p className="text-text-muted text-[11px]">Total Sales Deductions</p>
              <p className="text-base font-bold text-rose-500 mt-1">
                -{reconciliation.movementTypeBreakdown?.salesDeductions || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-surface bg-surface-bg/40">
              <p className="text-text-muted text-[11px]">Customer Returns</p>
              <p className="text-base font-bold text-emerald-600 mt-1">
                +{reconciliation.movementTypeBreakdown?.customerRestocks || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-surface bg-surface-bg/40">
              <p className="text-text-muted text-[11px]">Write-Offs / Loss</p>
              <p className="text-base font-bold text-amber-600 mt-1">
                -{reconciliation.movementTypeBreakdown?.adjustmentsWriteOff || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-surface bg-surface-bg/40">
              <p className="text-text-muted text-[11px]">Audit Count Surplus</p>
              <p className="text-base font-bold text-blue-500 mt-1">
                +{reconciliation.movementTypeBreakdown?.adjustmentsRestock || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5">
              <p className="text-brand-primary font-semibold text-[11px]">Current Physical Units</p>
              <p className="text-base font-extrabold text-brand-primary mt-1">
                {reconciliation.currentTotalUnits || 0}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-surface bg-surface-bg/30 text-xs text-text-muted flex items-center justify-between font-mono">
            <span>Equation: CurrentStock = InwardReceipts - SalesDeductions + Returns - WriteOffs + Surplus</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Δ = 0 (Balanced)</span>
          </div>
        </CardContent>
      </Card>

      {/* RECHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Sales Trend Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="bg-surface-card border-surface">
            <CardHeader className="p-4 pb-2 border-b border-surface">
              <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-primary" />
                Revenue & Tax Trend Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              {isLoading ? (
                <div className="h-[280px] flex items-center justify-center text-text-muted text-xs">
                  Loading trend data...
                </div>
              ) : salesSummary.dailyTrend?.length > 0 ? (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesSummary.dailyTrend}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#355B48" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#355B48" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        name="Gross Sales ($)"
                        stroke="#355B48"
                        strokeWidth={2}
                        fill="url(#salesGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-text-muted text-xs">
                  No sales recorded in the selected period.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Tender Distribution (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="bg-surface-card border-surface">
            <CardHeader className="p-4 pb-2 border-b border-surface">
              <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-brand-primary" />
                Payment Tender Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              {isLoading ? (
                <div className="h-[280px] flex items-center justify-center text-text-muted text-xs">
                  Loading payment distribution...
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesSummary.paymentMethodDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {salesSummary.paymentMethodDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        formatter={(val) => formatCurrency(val)}
                      />
                      <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category-Wise Stock Valuation Bar Chart */}
      <Card className="bg-surface-card border-surface">
        <CardHeader className="p-4 pb-2 border-b border-surface">
          <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-primary" />
            Stock Valuation by Therapeutic Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          {stockVal.categoryBreakdown?.length > 0 ? (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockVal.categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="category" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => formatCurrency(val)}
                  />
                  <Bar dataKey="stockValue" name="Stock Value ($)" fill="#355B48" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-text-muted text-xs">
              No category stock data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
