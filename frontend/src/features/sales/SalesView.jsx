import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../services/api/apiClient.js';
import { SalesHeader } from './components/SalesHeader.jsx';
import { SalesMetricsCards } from './components/SalesMetricsCards.jsx';
import { SalesFilters } from './components/SalesFilters.jsx';
import { SalesTable } from './components/SalesTable.jsx';
import { SaleDetailsModal } from './components/SaleDetailsModal.jsx';

export function SalesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Queries
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-ledger', searchTerm, paymentFilter, statusFilter],
    queryFn: async () => {
      const params = {};
      if (searchTerm) params.search = searchTerm.trim();
      if (paymentFilter) params.paymentMethod = paymentFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/sales', { params });
      return res.data;
    }
  });

  const sales = salesData?.data || [];

  // Summary Metrics
  const totalCount = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const totalTax = sales.reduce((sum, s) => sum + (Number(s.taxAmount) || 0), 0);
  const avgBasket = totalCount > 0 ? totalRevenue / totalCount : 0;

  const handleViewReceipt = async (saleId) => {
    try {
      const res = await apiClient.get(`/sales/${saleId}`);
      setSelectedSale(res.data.data);
      setDetailsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load invoice details');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setPaymentFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Title & POS Shortcut */}
      <SalesHeader />

      {/* 2. Bento Metrics Grid */}
      <SalesMetricsCards
        totalCount={totalCount}
        totalRevenue={totalRevenue}
        totalTax={totalTax}
        avgBasket={avgBasket}
      />

      {/* 3. Search & Filter Bar */}
      <SalesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onReset={handleResetFilters}
      />

      {/* 4. Interactive Sales Table */}
      <SalesTable
        sales={sales}
        isLoading={isLoading}
        onViewReceipt={handleViewReceipt}
      />

      {/* 5. Itemized Invoice Dialog */}
      <SaleDetailsModal
        sale={selectedSale}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </div>
  );
}
