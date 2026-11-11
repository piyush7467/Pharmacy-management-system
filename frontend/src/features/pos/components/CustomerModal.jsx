import React, { useState } from 'react';
import { UserPlus, User, Phone, Building2, Percent, CreditCard, Tag } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { FormField, FormInput, FormSelect } from '../../../components/ui/form-system.jsx';
import { apiClient } from '../../../services/api/apiClient.js';

export function CustomerModal({ open, onOpenChange, onCustomerSet }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('REGULAR');
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [discountPct, setDiscountPct] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isB2B = ['HOSPITAL_CLINIC', 'WHOLESALE_BULK', 'CORPORATE_TPA'].includes(type);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/customers', {
        name: name.trim(),
        phone: phone.trim() || undefined,
        type,
        companyName: isB2B ? companyName.trim() || undefined : undefined,
        taxNumber: isB2B ? taxNumber.trim() || undefined : undefined,
        defaultDiscountPct: parseFloat(discountPct) || 0,
        creditLimit: isB2B ? parseFloat(creditLimit) || 0 : 0
      });

      const customer = res.data?.data || res.data;
      toast.success(`Customer registered: ${customer.name} (${customer.customerCode})`);
      onCustomerSet(customer);

      // Reset
      setName('');
      setPhone('');
      setType('REGULAR');
      setCompanyName('');
      setTaxNumber('');
      setDiscountPct('');
      setCreditLimit('');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to register customer', {
        description: err.response?.data?.message || err.message || 'Validation error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                Quick Customer Registration
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Register customer to auto-apply discounts and enable credit ledger settlement.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Customer Segment */}
          <FormField label="Customer Segment Type">
            <FormSelect
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="REGULAR">Regular Patient / Loyalty Member</option>
              <option value="GENERAL">Walk-in General Customer</option>
              <option value="HOSPITAL_CLINIC">Hospital / Nursing Home / Clinic (B2B)</option>
              <option value="WHOLESALE_BULK">Wholesale Bulk Buyer</option>
              <option value="CORPORATE_TPA">Corporate / TPA Insurance</option>
            </FormSelect>
          </FormField>

          {/* Full Name */}
          <FormField label="Full Name / Primary Contact" required>
            <FormInput
              leadingIcon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar or Dr. Verma"
              required
              autoFocus
            />
          </FormField>

          {/* Mobile Number */}
          <FormField label="Mobile Number" helperText="10-digit mobile number for POS invoices">
            <FormInput
              type="tel"
              leadingIcon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </FormField>

          {/* Contextual B2B Institutional Fields */}
          {isB2B && (
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
              <FormField label="Hospital / Company Legal Name" required>
                <FormInput
                  leadingIcon={Building2}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. City Life Hospital"
                  required
                />
              </FormField>

              <FormField label="GSTIN / Tax ID" helperText="For B2B Tax Invoicing">
                <FormInput
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value.toUpperCase())}
                  placeholder="07AAAAA0000A1Z5"
                />
              </FormField>

              <FormField label="Credit Limit (₹)">
                <FormInput
                  type="number"
                  leadingIcon={CreditCard}
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="e.g. 50000"
                />
              </FormField>
            </div>
          )}

          {/* Default Discount */}
          <FormField label="Default Customer Discount (%)">
            <FormInput
              type="number"
              min="0"
              max="100"
              step="0.5"
              trailing="%"
              value={discountPct}
              onChange={(e) => setDiscountPct(e.target.value)}
              placeholder="0"
            />
          </FormField>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface">
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
              className="h-10 px-6 text-sm font-semibold rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white shadow-sm gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register & Link'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
