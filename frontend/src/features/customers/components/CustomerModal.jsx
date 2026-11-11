import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  Building2,
  Package,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Calendar,
  Percent,
  MapPin,
  Save,
  X
} from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient.js';
import {
  FormDialog,
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  FormSectionHeader
} from '../../../components/ui/form-system.jsx';
import { Button } from '../../../components/ui/button.jsx';

const TYPE_OPTIONS = [
  { value: 'GENERAL', label: 'Walk-in / General Customer' },
  { value: 'REGULAR', label: 'Regular / Loyalty Patient' },
  { value: 'HOSPITAL_CLINIC', label: 'Hospital, Nursing Home or Clinic (B2B)' },
  { value: 'WHOLESALE_BULK', label: 'Wholesale Bulk Commercial Buyer' },
  { value: 'CORPORATE_TPA', label: 'Corporate / TPA Insurance Account' }
];

export function CustomerModal({ open, onOpenChange, initialData, onSuccess }) {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    type: 'REGULAR',
    name: '',
    phone: '',
    email: '',
    companyName: '',
    taxNumber: '',
    drugLicenseNo: '',
    defaultDiscountPct: 0,
    creditLimit: 0,
    paymentTermsDays: 0,
    address: '',
    notes: '',
    isActive: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'REGULAR',
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        companyName: initialData.companyName || '',
        taxNumber: initialData.taxNumber || '',
        drugLicenseNo: initialData.drugLicenseNo || '',
        defaultDiscountPct: initialData.defaultDiscountPct || 0,
        creditLimit: initialData.creditLimit || 0,
        paymentTermsDays: initialData.paymentTermsDays || 0,
        address: initialData.address || '',
        notes: initialData.notes || '',
        isActive: initialData.isActive !== false
      });
    } else {
      setFormData({
        type: 'REGULAR',
        name: '',
        phone: '',
        email: '',
        companyName: '',
        taxNumber: '',
        drugLicenseNo: '',
        defaultDiscountPct: 0,
        creditLimit: 0,
        paymentTermsDays: 0,
        address: '',
        notes: '',
        isActive: true
      });
    }
  }, [initialData, open]);

  const isInstitutional = ['HOSPITAL_CLINIC', 'WHOLESALE_BULK', 'CORPORATE_TPA'].includes(formData.type);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        return await apiClient.patch(`/customers/${initialData.id}`, payload);
      }
      return await apiClient.post('/customers', payload);
    },
    onSuccess: (res) => {
      toast.success(
        isEditing
          ? 'Customer details updated successfully'
          : `Customer registered successfully (${res.data?.data?.customerCode || 'Active'})`
      );
      onSuccess?.(res.data?.data);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(isEditing ? 'Failed to update customer' : 'Failed to register customer', {
        description: err.message || 'Please check the entered fields.'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const payload = {
      type: formData.type,
      name: formData.name.trim(),
      phone: formData.phone?.trim() || null,
      email: formData.email?.trim() || null,
      companyName: isInstitutional ? formData.companyName?.trim() || null : null,
      taxNumber: isInstitutional ? formData.taxNumber?.trim() || null : null,
      drugLicenseNo: isInstitutional ? formData.drugLicenseNo?.trim() || null : null,
      defaultDiscountPct: Number(formData.defaultDiscountPct) || 0,
      creditLimit: isInstitutional ? Number(formData.creditLimit) || 0 : 0,
      paymentTermsDays: isInstitutional ? Number(formData.paymentTermsDays) || 0 : 0,
      address: formData.address?.trim() || null,
      notes: formData.notes?.trim() || null,
      isActive: formData.isActive
    };

    mutation.mutate(payload);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      icon={isInstitutional ? Building2 : UserCheck}
      title={isEditing ? 'Edit Customer Account' : 'Register New Customer'}
      subtitle={
        isEditing
          ? `Editing account: ${initialData?.customerCode}`
          : 'Define customer segment, credit limits, discount terms, and statutory GSTIN details.'
      }
      badgeText={isEditing ? initialData?.customerCode : formData.type}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Customer Segment Selection */}
        <div>
          <FormField
            label="Customer Segment Type"
            required
            helperText="Select the commercial tier for default pricing, credit limits, and tax invoicing."
          >
            <FormSelect
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>

        {/* 2. Primary Contact & Identity */}
        <div>
          <FormSectionHeader
            icon={Users}
            title="Primary Information"
            subtitle="Contact persona, phone, and account status."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name / Primary Contact" required>
              <FormInput
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={isInstitutional ? 'Dr. Rajesh Sharma / Procurement In-charge' : 'Ramesh Kumar'}
                required
              />
            </FormField>

            <FormField label="Mobile Number" helperText="10-digit number for SMS / POS billing">
              <FormInput
                type="tel"
                leadingIcon={Phone}
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </FormField>

            <FormField label="Email Address (Optional)">
              <FormInput
                type="email"
                leadingIcon={Mail}
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="accounts@hospital.org"
              />
            </FormField>

            <FormField label="Default Order Discount (%)" helperText="Automatically applied in POS cart">
              <FormInput
                type="number"
                min="0"
                max="100"
                step="0.5"
                trailing="%"
                value={formData.defaultDiscountPct}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    defaultDiscountPct: parseFloat(e.target.value) || 0
                  }))
                }
                placeholder="0"
              />
            </FormField>
          </div>
        </div>

        {/* 3. Progressive Disclosure: Institutional / B2B Commercial Fields */}
        {isInstitutional && (
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-4">
            <FormSectionHeader
              icon={Building2}
              title="Institutional & Compliance Information"
              subtitle="Hospital / nursing home registration, GSTIN, and credit controls."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Hospital / Company Legal Name" required={isInstitutional}>
                <FormInput
                  value={formData.companyName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="e.g. Apollo Multi-Speciality Clinic Pvt Ltd"
                />
              </FormField>

              <FormField label="GSTIN / Tax ID Number" helperText="Mandatory for B2B Input Tax Credit (ITC)">
                <FormInput
                  value={formData.taxNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, taxNumber: e.target.value.toUpperCase() }))}
                  placeholder="e.g. 07AAAAA0000A1Z5"
                />
              </FormField>

              <FormField label="Drug License Number" helperText="Form 20B/21B statutory drug license">
                <FormInput
                  value={formData.drugLicenseNo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, drugLicenseNo: e.target.value }))}
                  placeholder="e.g. DL-20B-12345/21B-12345"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-2">
                <FormField label="Credit Limit (₹)" helperText="Max outstanding balance">
                  <FormInput
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.creditLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, creditLimit: parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0"
                  />
                </FormField>

                <FormField label="Payment Terms" helperText="In days">
                  <FormSelect
                    value={formData.paymentTermsDays}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, paymentTermsDays: parseInt(e.target.value, 10) || 0 }))
                    }
                  >
                    <option value={0}>Immediate (Net 0)</option>
                    <option value={7}>Net 7 Days</option>
                    <option value={15}>Net 15 Days</option>
                    <option value={30}>Net 30 Days</option>
                    <option value={45}>Net 45 Days</option>
                    <option value={60}>Net 60 Days</option>
                  </FormSelect>
                </FormField>
              </div>
            </div>
          </div>
        )}

        {/* 4. Address & Notes */}
        <div>
          <FormSectionHeader
            icon={MapPin}
            title="Address & Internal Notes"
            subtitle="Physical delivery address and pharmacist remarks."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Street Address">
              <FormTextarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Unit / Ward / Street address..."
              />
            </FormField>

            <FormField label="Notes & Special Terms">
              <FormTextarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Preferred delivery slot, chronic medication reminders, doctor reference..."
              />
            </FormField>
          </div>
        </div>

        {/* 5. Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
            className="h-10 px-5 text-sm font-medium rounded-xl cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="h-10 px-6 text-sm font-semibold rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white shadow-sm gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{mutation.isPending ? 'Saving...' : isEditing ? 'Update Customer' : 'Create Customer'}</span>
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
