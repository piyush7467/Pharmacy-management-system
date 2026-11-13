import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient.js';
import { DashboardHeader } from './components/DashboardHeader.jsx';
import { DashboardKpiStrip } from './components/DashboardKpiStrip.jsx';
import { LowStockAlertCard } from './components/LowStockAlertCard.jsx';
import { NearExpiryAlertCard } from './components/NearExpiryAlertCard.jsx';
import { QuickActionsCard } from './components/QuickActionsCard.jsx';
import { SalesTrendChartCard } from './components/SalesTrendChartCard.jsx';
import { PaymentDistributionCard } from './components/PaymentDistributionCard.jsx';
import { RecentActivityHub } from './components/RecentActivityHub.jsx';

export function DashboardView() {
  const user = useSelector((state) => state.auth?.user);
  const alertSettings = useSelector((state) => state.preferences?.alertSettings) || {
    nearExpiryDays: 60,
    defaultLowStock: 10,
    enableLowStockAlert: true,
    enableNearExpiryAlert: true
  };

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
      return res.data || res || {};
    }
  });

  // 2. Fetch Inventory Overview & Alerts (with dynamic threshold query params)
  const {
    data: inventoryOverview,
    isLoading: inventoryLoading,
    refetch: refetchInventory
  } = useQuery({
    queryKey: ['dashboard-inventory-overview', alertSettings.nearExpiryDays, alertSettings.defaultLowStock],
    queryFn: async () => {
      const res = await apiClient.get('/inventory/overview', {
        params: {
          nearExpiryDays: alertSettings.nearExpiryDays || 60,
          lowStockThreshold: alertSettings.defaultLowStock || 10
        }
      });
      return res.data || res || {};
    }
  });

  // 3. Fetch Stock Valuation (Admin & Pharmacist only)
  const { data: stockValuation } = useQuery({
    queryKey: ['dashboard-stock-valuation'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/stock-valuation');
      return res.data || res || {};
    },
    enabled: user?.role !== 'CASHIER'
  });

  // 4. Fetch Customer Count
  const { data: customersTotal = 0 } = useQuery({
    queryKey: ['dashboard-customers-count'],
    queryFn: async () => {
      const res = await apiClient.get('/customers', { params: { limit: 1 } });
      return res.data?.meta?.pagination?.total ?? (Array.isArray(res.data) ? res.data.length : 0);
    }
  });

  // 5. Fetch Recent Sales
  const { data: recentSalesData } = useQuery({
    queryKey: ['dashboard-recent-sales'],
    queryFn: async () => {
      const res = await apiClient.get('/sales', { params: { limit: 5 } });
      return Array.isArray(res.data) ? res.data : (res.data?.sales || res.data?.data || res || []);
    }
  });

  // 6. Fetch Recent Purchases
  const { data: recentPurchasesData } = useQuery({
    queryKey: ['dashboard-recent-purchases'],
    queryFn: async () => {
      const res = await apiClient.get('/purchases', { params: { limit: 5 } });
      return Array.isArray(res.data) ? res.data : (res.data?.purchases || res.data?.data || res || []);
    }
  });

  const handleRefreshAll = () => {
    refetchSales();
    refetchInventory();
  };

  // Safe calculated metrics
  const netRevenue = Number(salesSummary?.netRevenue) || 0;
  const ordersCount = Number(salesSummary?.ordersCount) || 0;
  const stockValuationCost = Number(inventoryOverview?.totalActiveCostValuation || stockValuation?.totalCostValuation) || 0;
  const totalActiveUnits = Number(inventoryOverview?.totalActiveUnits) || 0;
  const nearExpiryCount = Number(inventoryOverview?.nearExpiryBatchesCount || inventoryOverview?.nearExpiryLotsCount) || 0;
  const lowStockCount = Number(inventoryOverview?.lowStockCount || inventoryOverview?.lowStockMedicinesCount) || 0;

  // Chart data from real daily trend or fallback single point
  const chartData = useMemo(() => {
    if (salesSummary?.dailyTrend && salesSummary.dailyTrend.length > 0) {
      return salesSummary.dailyTrend.map((d) => ({
        date: d.date.slice(5),
        sales: Number(d.sales) || 0,
        orders: Number(d.orders) || 0
      }));
    }
    return [
      { date: 'Today', sales: netRevenue, orders: ordersCount }
    ];
  }, [salesSummary, netRevenue, ordersCount]);

  // Payment Breakdown
  const paymentMethods = salesSummary?.paymentMethodDistribution || [];
  const totalPaymentValue = paymentMethods.reduce((sum, p) => sum + (Number(p.value) || 0), 0);

  const recentSales = Array.isArray(recentSalesData) ? recentSalesData : [];
  const recentPurchases = Array.isArray(recentPurchasesData) ? recentPurchasesData : [];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. Header & Fast Operational Controls */}
      <DashboardHeader
        user={user}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onRefresh={handleRefreshAll}
        isLoading={salesLoading || inventoryLoading}
      />

      {/* 2. Top 4 Metric KPI Cards (Reference Aligned) */}
      <DashboardKpiStrip
        netRevenue={netRevenue}
        ordersCount={ordersCount}
        stockValuationCost={stockValuationCost}
        totalActiveUnits={totalActiveUnits}
        customersCount={customersTotal}
        isCashier={user?.role === 'CASHIER'}
      />

      {/* 3. Middle 3-Column Dedicated Alert & Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <LowStockAlertCard
          items={inventoryOverview?.lowStockItems || []}
          count={lowStockCount}
          threshold={alertSettings.defaultLowStock || 10}
          isLoading={inventoryLoading}
        />
        <NearExpiryAlertCard
          items={inventoryOverview?.nearExpiryItems || []}
          count={nearExpiryCount}
          horizonDays={alertSettings.nearExpiryDays || 60}
          isLoading={inventoryLoading}
        />
        <QuickActionsCard />
      </div>

      {/* 4. Sales Revenue Trend & Tender Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesTrendChartCard chartData={chartData} dateRange={dateRange} />
        </div>
        <div>
          <PaymentDistributionCard
            paymentMethods={paymentMethods}
            totalPaymentValue={totalPaymentValue}
          />
        </div>
      </div>

      {/* 5. Recent Activity Hub (Sales vs Purchases Transactions) */}
      <RecentActivityHub
        activeTab={activeActivityTab}
        setActiveTab={setActiveActivityTab}
        recentSales={recentSales}
        recentPurchases={recentPurchases}
      />
    </div>
  );
}
