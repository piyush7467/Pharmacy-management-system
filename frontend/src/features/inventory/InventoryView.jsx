import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { apiClient } from '../../services/api/apiClient.js';
import { InventoryHeader } from './components/InventoryHeader.jsx';
import { InventoryMetricsCards } from './components/InventoryMetricsCards.jsx';
import { InventoryFilters } from './components/InventoryFilters.jsx';
import { BatchesTable } from './components/BatchesTable.jsx';
import { StockAdjustmentModal } from './components/StockAdjustmentModal.jsx';

export function InventoryView() {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth?.user);
  const canAdjustStock = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');
  const [selectedBatchForAdjustment, setSelectedBatchForAdjustment] = useState(null);

  // Queries
  const { data: overviewData } = useQuery({
    queryKey: ['inventory-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/inventory/overview');
      return res.data || res || {};
    }
  });

  const { data: batchesData, isLoading } = useQuery({
    queryKey: ['inventory-batches', searchTerm, statusFilter, expiryFilter],
    queryFn: async () => {
      const params = {};
      if (searchTerm) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (expiryFilter) params.expiringWithinDays = expiryFilter;
      const res = await apiClient.get('/inventory/batches', { params });
      return res.data?.batches || res.data || res || [];
    }
  });

  const batches = Array.isArray(batchesData) ? batchesData : (batchesData?.batches || batchesData?.data || []);
  const overview = overviewData?.data || overviewData || {};

  // Mutation: Record Stock Adjustment
  const adjustMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/inventory/adjustments', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.meta?.message || 'Stock adjustment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-overview'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
    },
    onError: (err) => {
      toast.error(err.message || err.response?.data?.message || 'Failed to record stock adjustment');
    }
  });

  const handleAdjustmentSubmit = (payload, onSuccessCallback) => {
    adjustMutation.mutate(payload, {
      onSuccess: () => {
        onSuccessCallback();
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setExpiryFilter('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <InventoryHeader />

      {/* 2. Bento Metrics Grid */}
      <InventoryMetricsCards overview={overview} />

      {/* 3. Search & Filter Bar */}
      <InventoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        expiryFilter={expiryFilter}
        setExpiryFilter={setExpiryFilter}
        onReset={handleResetFilters}
      />

      {/* 4. Batches & FEFO Ledger Table */}
      <BatchesTable
        batches={batches}
        isLoading={isLoading}
        onOpenAdjustment={(b) => setSelectedBatchForAdjustment(b)}
        canAdjustStock={canAdjustStock}
      />

      {/* 5. Stock Adjustment Modal */}
      <StockAdjustmentModal
        batch={selectedBatchForAdjustment}
        open={Boolean(selectedBatchForAdjustment)}
        onOpenChange={(open) => {
          if (!open) setSelectedBatchForAdjustment(null);
        }}
        onSubmitAdjustment={handleAdjustmentSubmit}
        isSubmitting={adjustMutation.isPending}
      />
    </div>
  );
}
