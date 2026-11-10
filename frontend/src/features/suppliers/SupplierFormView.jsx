import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Mail,
  Phone,
  FileCheck,
  UserCheck,
  MapPin,
  FileText,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import {
  FormField,
  FormInput,
  FormSelect
} from '../../components/ui/form-system.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  'Distributor',
  'Wholesaler',
  'Pharmaceutical Manufacturer',
  'Direct Importer',
  'Authorized Stockist'
];

export function SupplierFormView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    businessType: 'Distributor',
    contactPerson: '',
    phone: '',
    email: '',
    taxNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
    isActive: true
  });

  // If editing, load supplier details
  const { data: existingData, isLoading: loadingExisting } = useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const res = await apiClient.get(`/suppliers/${id}`);
      return res.data?.supplier || res.data || res;
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (existingData) {
      setFormData({
        name: existingData.name || '',
        businessType: existingData.businessType || 'Distributor',
        contactPerson: existingData.contactPerson || '',
        phone: existingData.phone || '',
        email: existingData.email || '',
        taxNumber: existingData.taxNumber || '',
        address: existingData.address || '',
        city: existingData.city || '',
        state: existingData.state || '',
        postalCode: existingData.postalCode || '',
        notes: existingData.notes || '',
        isActive: existingData.isActive ?? true
      });
    }
  }, [existingData]);

  const saveMutation = useMutation({
    mutationFn: (supData) => {
      if (isEditing) {
        return apiClient.patch(`/suppliers/${id}`, supData);
      }
      return apiClient.post('/suppliers', supData);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Supplier updated successfully' : 'Supplier registered successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-active'] });
      navigate('/suppliers');
    },
    onError: (err) => {
      toast.error(err?.message || err?.response?.data?.message || 'Failed to save supplier');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Company / Distributor Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Primary Contact Phone number is required');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      contactPerson: formData.contactPerson?.trim() || null,
      phone: formData.phone.trim(),
      email: formData.email?.trim() || null,
      taxNumber: formData.taxNumber?.trim() || null,
      address: [formData.address, formData.city, formData.state, formData.postalCode]
        .filter(Boolean)
        .join(', ') || null,
      isActive: formData.isActive
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/suppliers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-surface-card"
        >
          <ArrowLeft className="h-4 w-4 text-brand-primary" />
          <span>Back to Suppliers Directory</span>
        </Link>

        <Badge
          variant="outline"
          className={
            formData.isActive
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20'
          }
        >
          {formData.isActive ? 'Active Vendor' : 'Inactive / Blocked'}
        </Badge>
      </div>

      {/* 2. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary shrink-0 shadow-2xs">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {isEditing ? 'Edit Supplier Details' : 'Register Supplier'}
            </h1>
            <p className="text-sm text-text-muted">
              Add a new distributor or supplier for medicine procurement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/suppliers')}
            className="border-surface hover:bg-surface-card"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saveMutation.isPending || loadingExisting}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold px-5 shadow-sm"
          >
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Supplier' : 'Register Supplier'}
          </Button>
        </div>
      </div>

      {/* 3. Form Cards */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Company Details */}
        <div className="rounded-xl border border-surface bg-surface-card p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface">
            <Building2 className="h-5 w-5 text-brand-primary" />
            <h2 className="text-base font-semibold text-text-primary">1. Company Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Company / Distributor Name" required helper="Legal entity name for billing">
              <FormInput
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apex Pharma Logistics Pvt. Ltd."
                autoFocus
              />
            </FormField>

            <FormField label="Business Type" required>
              <FormSelect
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              >
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </FormSelect>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email" helper="For automated PO and GRN dispatch">
              <FormInput
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. orders@apexpharma.com"
              />
            </FormField>

            <FormField label="Phone / Mobile" required helper="Primary procurement contact number">
              <FormInput
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98200 11223"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <FormField label="GSTIN / Tax ID" helper="Required for input tax credit claims">
              <FormInput
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                placeholder="e.g. 27ABCDE1234F1Z5"
                className="font-mono uppercase"
              />
            </FormField>

            <FormField label="Vendor Status">
              <div className="flex items-center h-10 px-3.5 rounded-lg border border-surface bg-surface/30">
                <label className="flex items-center gap-2 text-sm font-medium text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-surface text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Active Supplier for Purchases</span>
                </label>
              </div>
            </FormField>
          </div>
        </div>

        {/* Card 2: Contact Person */}
        <div className="rounded-xl border border-surface bg-surface-card p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface">
            <UserCheck className="h-5 w-5 text-brand-primary" />
            <h2 className="text-base font-semibold text-text-primary">2. Key Account Manager / Representative</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Contact Person Name" helper="Direct sales manager or medical rep">
              <FormInput
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Rajesh Kumar"
              />
            </FormField>

            <FormField label="Designation / Territory" helper="e.g. Area Sales Executive">
              <FormInput
                placeholder="e.g. Regional Key Accounts Manager"
              />
            </FormField>
          </div>
        </div>

        {/* Card 3: Address & Logistics */}
        <div className="rounded-xl border border-surface bg-surface-card p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface">
            <MapPin className="h-5 w-5 text-brand-primary" />
            <h2 className="text-base font-semibold text-text-primary">3. Warehouse & Shipping Address</h2>
          </div>

          <FormField label="Street Address">
            <FormInput
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot No. 42, GIDC Industrial Estate, Phase 2"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="City">
              <FormInput
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Mumbai"
              />
            </FormField>

            <FormField label="State">
              <FormInput
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Maharashtra"
              />
            </FormField>

            <FormField label="Postal / ZIP Code">
              <FormInput
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="e.g. 400001"
              />
            </FormField>
          </div>
        </div>

        {/* 4. Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/suppliers')}
            className="border-surface hover:bg-surface-card"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending || loadingExisting}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold px-6 shadow-sm"
          >
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Supplier' : 'Register Supplier'}
          </Button>
        </div>
      </form>
    </div>
  );
}
