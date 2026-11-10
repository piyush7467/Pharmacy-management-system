import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  MapPin,
  FileText,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  Truck,
  CreditCard,
  Building
} from 'lucide-react';
import {
  Dialog,
  DialogContent
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import {
  FormField,
  FormInput,
  FormSelect,
  HorizontalSectionTabs,
  FormSectionHeader
} from '../../../components/ui/form-system.jsx';
import { toast } from 'sonner';

const TABS = [
  { id: 'company', label: 'Company Details', icon: Building2 },
  { id: 'contact', label: 'Contact Person', icon: User },
  { id: 'address', label: 'Address & Tax', icon: FileText },
  { id: 'additional', label: 'Additional', icon: Sparkles }
];

export function SupplierFormModal({
  open,
  onOpenChange,
  editingSupplier,
  onSubmit,
  isSubmitting
}) {
  const [activeTab, setActiveTab] = useState('company');

  const [formData, setFormData] = useState({
    name: '',
    businessType: 'Distributor',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    isActive: true,
    paymentTerms: 'Net 30 Days',
    notes: ''
  });

  useEffect(() => {
    if (editingSupplier) {
      setFormData({
        name: editingSupplier.name || '',
        businessType: editingSupplier.businessType || 'Distributor',
        contactPerson: editingSupplier.contactPerson || '',
        phone: editingSupplier.phone || '',
        email: editingSupplier.email || '',
        address: editingSupplier.address || '',
        taxNumber: editingSupplier.taxNumber || '',
        isActive: editingSupplier.isActive !== undefined ? editingSupplier.isActive : true,
        paymentTerms: 'Net 30 Days',
        notes: ''
      });
    } else {
      setFormData({
        name: '',
        businessType: 'Distributor',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        taxNumber: '',
        isActive: true,
        paymentTerms: 'Net 30 Days',
        notes: ''
      });
    }
    setActiveTab('company');
  }, [editingSupplier, open]);

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setActiveTab('company');
      toast.error('Company / Distributor Name must be at least 2 characters');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim() || null,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      taxNumber: formData.taxNumber.trim().toUpperCase() || null,
      isActive: formData.isActive
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[92vh] p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                  {editingSupplier ? 'Edit Supplier Profile' : 'Register Supplier'}
                </h2>
                <Badge
                  variant="outline"
                  className="font-medium bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 text-xs rounded-md"
                >
                  Vendor Master
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Add a new distributor or supplier for medicine procurement.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body with Horizontal Tabs */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Horizontal Tabs Navigation */}
            <HorizontalSectionTabs
              tabs={TABS}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
            />

            {/* TAB 1: Company Details */}
            {activeTab === 'company' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <FormSectionHeader
                  icon={Building2}
                  title="Company Details"
                  subtitle="Official registered distributor or manufacturer trading identity."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Company / Distributor Name" required>
                    <FormInput
                      placeholder="e.g. Apex Pharma Logistics Pvt. Ltd."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      autoFocus
                    />
                  </FormField>

                  <FormField label="Business Type" required>
                    <FormSelect
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    >
                      <option value="Distributor">Authorized Distributor</option>
                      <option value="Manufacturer">Pharmaceutical Manufacturer</option>
                      <option value="Wholesaler">Stockist / Wholesaler</option>
                      <option value="CNF">C&F Clearing Agent</option>
                    </FormSelect>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <FormField label="Procurement Email">
                    <FormInput
                      type="email"
                      leadingIcon={Mail}
                      placeholder="e.g. orders@apexpharma.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Phone / Mobile">
                    <FormInput
                      type="tel"
                      leadingIcon={Phone}
                      placeholder="e.g. +91 98200 11223"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <FormField label="GSTIN / Tax ID" helperText="15-character Goods and Services Tax ID">
                    <FormInput
                      leadingIcon={FileText}
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value.toUpperCase() })}
                      className="font-mono uppercase"
                    />
                  </FormField>

                  {/* Active Vendor Toggle Switch */}
                  <div className="space-y-1.5 flex flex-col justify-end pb-1">
                    <span className="block text-sm font-medium text-text-primary">
                      Supplier Status
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-surface bg-surface-page">
                      <span className="text-xs font-semibold text-text-primary">
                        Active Supplier
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Contact Person */}
            {activeTab === 'contact' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <FormSectionHeader
                  icon={User}
                  title="Designated Representative"
                  subtitle="Key account manager or order booking representative."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Representative Name" helperText="Account representative or sales manager">
                    <FormInput
                      leadingIcon={User}
                      placeholder="e.g. Sanjay Mehra"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Representative Direct Phone">
                    <FormInput
                      type="tel"
                      leadingIcon={Phone}
                      placeholder="e.g. +91 98210 55667"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* TAB 3: Address & Tax */}
            {activeTab === 'address' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <FormSectionHeader
                  icon={MapPin}
                  title="Warehouse & Registered Address"
                  subtitle="Billing and physical stock dispatch warehouse location."
                />

                <FormField label="Registered Warehouse Address" helperText="Include Plot number, Industrial Estate, City, State and PIN code">
                  <textarea
                    rows={3}
                    placeholder="e.g. Plot No. 45, Phase II, Okhla Industrial Area, New Delhi - 110020"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-surface bg-surface-card p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </FormField>
              </div>
            )}

            {/* TAB 4: Additional Information */}
            {activeTab === 'additional' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <FormSectionHeader
                  icon={CreditCard}
                  title="Procurement & Credit Terms"
                  subtitle="Agreed payment cycle and distributor delivery lead times."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Credit Payment Terms">
                    <FormSelect
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    >
                      <option value="Immediate / COD">Cash on Delivery (COD)</option>
                      <option value="Net 7 Days">Net 7 Days</option>
                      <option value="Net 15 Days">Net 15 Days</option>
                      <option value="Net 30 Days">Net 30 Days</option>
                      <option value="Net 45 Days">Net 45 Days</option>
                    </FormSelect>
                  </FormField>

                  <FormField label="Average Delivery Lead Time">
                    <FormSelect defaultValue="24-48 Hours">
                      <option value="Same Day">Same Day Delivery (&lt; 12 Hours)</option>
                      <option value="24-48 Hours">Standard (24 - 48 Hours)</option>
                      <option value="3-5 Days">Outstation (3 - 5 Days)</option>
                    </FormSelect>
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-surface bg-surface-card shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-10 px-5 text-sm font-medium rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving Supplier...'
                  : editingSupplier
                  ? 'Update Supplier'
                  : 'Register Supplier'}
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
