import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { apiClient } from '../../services/api/apiClient.js';
import { PurchasesHeader } from './components/PurchasesHeader.jsx';
import { PurchasesMetricsCards } from './components/PurchasesMetricsCards.jsx';
import { PurchasesFilters } from './components/PurchasesFilters.jsx';
import { PurchasesTable } from './components/PurchasesTable.jsx';
import { CreatePurchaseModal } from './components/CreatePurchaseModal.jsx';
import { ReceiveGoodsModal } from './components/ReceiveGoodsModal.jsx';
import { PurchaseDetailsModal } from './components/PurchaseDetailsModal.jsx';

export function PurchasesView() {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth?.user);
  const canManagePurchases = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [receiveModalPurchase, setReceiveModalPurchase] = useState(null);
  const [detailModalPurchase, setDetailModalPurchase] = useState(null);

  // Queries
  const { data: purchasesData, isLoading } = useQuery({
    queryKey: ['purchases', searchTerm, statusFilter],
    queryFn: async () => {
      const params = {};
      if (searchTerm) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/purchases', { params });
      return res.data?.purchases || res.data || res || [];
    }
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-active'],
    queryFn: async () => {
      const res = await apiClient.get('/suppliers?isActive=true');
      return res.data?.suppliers || res.data || res || [];
    }
  });

  const { data: medicinesData } = useQuery({
    queryKey: ['medicines-active'],
    queryFn: async () => {
      const res = await apiClient.get('/medicines?isActive=true&limit=100');
      return res.data?.medicines || res.data || res || [];
    }
  });

  const purchases = Array.isArray(purchasesData)
    ? purchasesData
    : (purchasesData?.purchases || purchasesData?.data || []);
  const suppliers = Array.isArray(suppliersData) ? suppliersData : (suppliersData?.suppliers || suppliersData?.data || []);
  const medicines = Array.isArray(medicinesData) ? medicinesData : (medicinesData?.medicines || medicinesData?.data || []);

  // Summary Metrics
  const totalPurchases = purchases.length;
  const receivedPurchases = purchases.filter((p) => p.status === 'RECEIVED').length;
  const draftPurchases = purchases.filter((p) => p.status === 'DRAFT').length;
  const totalSpend = purchases
    .filter((p) => p.status === 'RECEIVED')
    .reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0);

  // Mutations
  const createPurchaseMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/purchases', payload);
      return res.data;
    },
    onSuccess: (data, variables, context) => {
      toast.success(data?.meta?.message || 'Purchase order created successfully');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-overview'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
    },
    onError: (err) => {
      toast.error(err?.message || err?.response?.data?.message || 'Failed to create purchase order');
    }
  });

  const receivePurchaseMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiClient.post(`/purchases/${id}/receive`, data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.meta?.message || 'Goods received and inventory batches updated!');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-overview'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
    },
    onError: (err) => {
      toast.error(err?.message || err?.response?.data?.message || 'Failed to receive goods');
    }
  });

  const cancelPurchaseMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.patch(`/purchases/${id}/cancel`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.meta?.message || 'Purchase order cancelled');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: (err) => {
      toast.error(err?.message || err?.response?.data?.message || 'Failed to cancel purchase order');
    }
  });

  const handleCreateSubmit = (payload, onSuccessCallback) => {
    createPurchaseMutation.mutate(payload, {
      onSuccess: () => onSuccessCallback()
    });
  };

  const handleReceiveConfirm = (purchaseId, payload, onSuccessCallback) => {
    receivePurchaseMutation.mutate(
      { id: purchaseId, data: payload },
      { onSuccess: () => onSuccessCallback() }
    );
  };

  const handleCancelPurchase = (purchaseId) => {
    if (window.confirm('Are you sure you want to cancel this pending purchase order?')) {
      cancelPurchaseMutation.mutate(purchaseId);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Title & Action */}
      <PurchasesHeader
        onOpenCreateModal={() => setCreateModalOpen(true)}
        canCreatePurchase={canManagePurchases}
      />

      {/* 2. Bento Metrics Grid */}
      <PurchasesMetricsCards
        totalPurchases={totalPurchases}
        receivedPurchases={receivedPurchases}
        draftPurchases={draftPurchases}
        totalSpend={totalSpend}
      />

      {/* 3. Search & Filters Bar */}
      <PurchasesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onReset={handleResetFilters}
      />

      {/* 4. Purchase Orders & GRN Register Table */}
      <PurchasesTable
        purchases={purchases}
        isLoading={isLoading}
        onViewDetails={(p) => setDetailModalPurchase(p)}
        onReceiveGoods={(p) => setReceiveModalPurchase(p)}
        onCancelPurchase={handleCancelPurchase}
        canManagePurchases={canManagePurchases}
      />

      {/* 5. Create Purchase Order Modal */}
      <CreatePurchaseModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        suppliers={suppliers}
        medicines={medicines}
        onSubmit={handleCreateSubmit}
        isSubmitting={createPurchaseMutation.isPending}
      />

      {/* 6. Goods Received Note (GRN) Intake Modal */}
      <ReceiveGoodsModal
        purchase={receiveModalPurchase}
        open={Boolean(receiveModalPurchase)}
        onOpenChange={(open) => {
          if (!open) setReceiveModalPurchase(null);
        }}
        onConfirmReceive={handleReceiveConfirm}
        isSubmitting={receivePurchaseMutation.isPending}
      />

      {/* 7. Purchase Details Inspection Modal */}
      <PurchaseDetailsModal
        purchase={detailModalPurchase}
        open={Boolean(detailModalPurchase)}
        onOpenChange={(open) => {
          if (!open) setDetailModalPurchase(null);
        }}
      />
    </div>
  );
}
