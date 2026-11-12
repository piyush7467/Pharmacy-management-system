import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient.js';
import { ReportsHeader } from './components/ReportsHeader.jsx';
import { LedgerReconciliationAuditCard } from './components/LedgerReconciliationAuditCard.jsx';
import { RevenueTrendChartCard } from './components/RevenueTrendChartCard.jsx';
import { StockValuationCard } from './components/StockValuationCard.jsx';

export function ReportsView() {
  // Queries
  const { data: salesData, isLoading: salesLoading, refetch: refetchSales } = useQuery({
    queryKey: ['report-sales-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/sales-summary');
      return res.data || res || {};
    }
  });

  const { data: valuationData, isLoading: valuationLoading } = useQuery({
    queryKey: ['report-stock-valuation'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/stock-valuation');
      return res.data || res || {};
    }
  });

  const { data: reconciliationData, isLoading: reconLoading, refetch: refetchRecon } = useQuery({
    queryKey: ['report-reconciliation'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/reconciliation');
      return res.data || res || {};
    }
  });

  const salesSummary = salesData || {};
  const stockVal = valuationData || {};
  const reconciliation = reconciliationData || {};
  const isLoading = salesLoading || valuationLoading || reconLoading;

  const handleRefreshAll = () => {
    refetchSales();
    refetchRecon();
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. Header with inline metrics */}
      <ReportsHeader
        onRefresh={handleRefreshAll}
        isLoading={isLoading}
        grossSales={salesSummary.grossSales || salesSummary.netRevenue || 0}
        ordersCount={salesSummary.ordersCount || 0}
        totalTax={salesSummary.totalTax || 0}
        marginPercentage={stockVal.marginPercentage || 0}
      />

      {/* 3. Mathematical Double-Entry Ledger Audit Card */}
      <LedgerReconciliationAuditCard reconciliation={reconciliation} />

      {/* 4. Analytics Grid (Sales Trend + Stock Valuation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RevenueTrendChartCard
            dailyTrend={salesSummary.dailyTrend || []}
            isLoading={salesLoading}
          />
        </div>
        <div className="lg:col-span-5">
          <StockValuationCard
            stockVal={stockVal}
            isLoading={valuationLoading}
          />
        </div>
      </div>
    </div>
  );
}
