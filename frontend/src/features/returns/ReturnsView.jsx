import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../services/api/apiClient.js';
import { ReturnsHeader } from './components/ReturnsHeader.jsx';
import { ReturnsMetricsCards } from './components/ReturnsMetricsCards.jsx';
import { ReturnsTable } from './components/ReturnsTable.jsx';
import { ProcessReturnModal } from './components/ProcessReturnModal.jsx';
import { ReturnDetailsModal } from './components/ReturnDetailsModal.jsx';

export function ReturnsView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  // Query: Returns list
  const { data: returnsData, isLoading } = useQuery({
    queryKey: ['returns-ledger', searchTerm],
    queryFn: async () => {
      const params = {};
      if (searchTerm) params.search = searchTerm.trim();
      const res = await apiClient.get('/returns', { params });
      return res.data?.returns || res.data || [];
    }
  });

  const returns = Array.isArray(returnsData) ? returnsData : (returnsData?.returns || returnsData?.data || []);

  // Summary Metrics
  const totalReturnsCount = returns.length;
  const totalRefundAmount = returns.reduce((sum, r) => sum + (Number(r.refundAmount) || 0), 0);

  // Mutation: Process Return
  const createReturnMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/returns', payload);
      return res.data;
    },
    onSuccess: (data, variables, context) => {
      toast.success(data?.meta?.message || 'Return processed and inventory adjusted successfully');
      queryClient.invalidateQueries({ queryKey: ['returns-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['sales-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-sales-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-overview'] });
    },
    onError: (err) => {
      toast.error(err.message || err.response?.data?.message || 'Failed to process return');
    }
  });

  const handleProcessReturn = (payload, onSuccessCallback) => {
    createReturnMutation.mutate(payload, {
      onSuccess: () => {
        onSuccessCallback();
      }
    });
  };

  const handleViewReturnDetails = async (returnId) => {
    try {
      const res = await apiClient.get(`/returns/${returnId}`);
      setSelectedReturn(res.data.data || res.data);
      setDetailsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load return details');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Title & Permission Check */}
      <ReturnsHeader onOpenProcessModal={() => setProcessModalOpen(true)} />

      {/* 2. Bento Metrics Grid */}
      <ReturnsMetricsCards
        totalReturnsCount={totalReturnsCount}
        totalRefundAmount={totalRefundAmount}
      />

      {/* 3. Returns Ledger Table */}
      <ReturnsTable
        returns={returns}
        isLoading={isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onViewReturnDetails={handleViewReturnDetails}
      />

      {/* 4. Process Return Wizard Modal */}
      <ProcessReturnModal
        open={processModalOpen}
        onOpenChange={setProcessModalOpen}
        onSubmitReturn={handleProcessReturn}
        isSubmitting={createReturnMutation.isPending}
      />

      {/* 5. Inspection Credit Note Modal */}
      <ReturnDetailsModal
        returnData={selectedReturn}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </div>
  );
}
