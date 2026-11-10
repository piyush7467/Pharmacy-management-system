import React, { useState } from 'react';
import { UserPlus, User, Phone } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { FormField, FormInput } from '../../../components/ui/form-system.jsx';

export function CustomerModal({ open, onOpenChange, onCustomerSet }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    onCustomerSet(name.trim(), phone.trim());
    toast.success(`Customer set to ${name.trim()}`);
    setName('');
    setPhone('');
    onOpenChange(false);
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
                Customer Information
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Attach patient or customer profile for fiscal invoice and credit history.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <FormField label="Customer Full Name" required helperText="e.g. Ramesh Kumar">
            <FormInput
              leadingIcon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              required
              autoFocus
            />
          </FormField>

          <FormField label="Mobile Number (Optional)" helperText="10-digit mobile number for digital invoice SMS / WhatsApp">
            <FormInput
              type="tel"
              leadingIcon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 text-sm font-medium rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Link Customer</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
