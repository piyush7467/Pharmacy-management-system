import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { apiClient } from '../../services/api/apiClient.js';
import { MedicinesHeader } from './components/MedicinesHeader.jsx';
import { MedicinesMetricsCards } from './components/MedicinesMetricsCards.jsx';
import { MedicinesFilters } from './components/MedicinesFilters.jsx';
import { MedicinesTable } from './components/MedicinesTable.jsx';
import { MedicineFormModal } from './components/MedicineFormModal.jsx';
import { MedicineBatchesModal } from './components/MedicineBatchesModal.jsx';
import { ImportMedicinesModal } from './components/ImportMedicinesModal.jsx';

export function MedicinesView() {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth?.user);
  const canManageMedicines = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [batchModalMedicine, setBatchModalMedicine] = useState(null);

  // Fetch Categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['categoriesList'],
    queryFn: async () => {
      const res = await apiClient.get('/categories?limit=100');
      return res.data?.categories || res.data || [];
    }
  });

  // Fetch Medicines
  const { data: medicinesData, isLoading } = useQuery({
    queryKey: ['medicines', searchTerm, categoryFilter, lowStockFilter],
    queryFn: async () => {
      const params = {};
      if (searchTerm) params.search = searchTerm.trim();
      if (categoryFilter) params.categoryId = categoryFilter;
      if (lowStockFilter) params.lowStockOnly = 'true';
      const res = await apiClient.get('/medicines', { params });
      return res.data;
    }
  });

  const medicines = medicinesData?.medicines || medicinesData?.data || [];

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (medData) => {
      if (editingMedicine) {
        return apiClient.patch(`/medicines/${editingMedicine.id}`, medData);
      }
      return apiClient.post('/medicines', medData);
    },
    onSuccess: (res) => {
      toast.success(editingMedicine ? 'Medicine updated successfully' : 'Medicine registered successfully');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-overview'] });
      setFormModalOpen(false);
      setEditingMedicine(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save medicine');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (medId) => apiClient.delete(`/medicines/${medId}`),
    onSuccess: () => {
      toast.success('Medicine formulation deleted');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-overview'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete medicine');
    }
  });

  const handleEdit = (med) => {
    setEditingMedicine(med);
    setFormModalOpen(true);
  };

  const handleDelete = (med) => {
    if (window.confirm(`Are you sure you want to delete "${med.name}"? If it has historical batches or sales, deletion will be blocked.`)) {
      deleteMutation.mutate(med.id);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setLowStockFilter(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Title & Action */}
      <MedicinesHeader
        onOpenAddModal={() => {
          setEditingMedicine(null);
          setFormModalOpen(true);
        }}
        onOpenImportModal={() => setImportModalOpen(true)}
        canManageMedicines={canManageMedicines}
      />

      {/* 2. Bento Metrics Grid */}
      <MedicinesMetricsCards medicines={medicines} />

      {/* 3. Search & Filter Bar */}
      <MedicinesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        lowStockFilter={lowStockFilter}
        setLowStockFilter={setLowStockFilter}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* 4. Master Index Table */}
      <MedicinesTable
        medicines={medicines}
        isLoading={isLoading}
        onEdit={handleEdit}
        onViewBatches={(med) => setBatchModalMedicine(med)}
        onDelete={handleDelete}
        canManageMedicines={canManageMedicines}
      />

      {/* 5. Add / Edit Formulation Modal */}
      <MedicineFormModal
        open={formModalOpen}
        onOpenChange={(open) => {
          setFormModalOpen(open);
          if (!open) setEditingMedicine(null);
        }}
        editingMedicine={editingMedicine}
        categories={categories}
        onSubmit={(payload, callback) => {
          saveMutation.mutate(payload, {
            onSuccess: () => callback()
          });
        }}
        isSubmitting={saveMutation.isPending}
      />

      {/* 6. Batch Lots Inspection Modal */}
      <MedicineBatchesModal
        medicine={batchModalMedicine}
        open={Boolean(batchModalMedicine)}
        onOpenChange={(open) => {
          if (!open) setBatchModalMedicine(null);
        }}
      />

      {/* 7. Bulk CSV Import Modal */}
      <ImportMedicinesModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['medicines'] });
          queryClient.invalidateQueries({ queryKey: ['categoriesList'] });
        }}
      />
    </div>
  );
}
