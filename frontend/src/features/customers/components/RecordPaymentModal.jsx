import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Receipt, CreditCard, Banknote, QrCode, FileText } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient.js';
import {
  FormDialog,
  FormField,
  FormInput,
  FormSelect,
  FormTextarea
} from '../../../components/ui/form-system.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function RecordPaymentModal({ open, onOpenChange, customer, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');

  const currentBalance = customer?.currentBalance || 0;

  const paymentMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post(`/customers/${customer.id}/payments`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Payment of ${formatCurrency(amount)} recorded! New Balance: ${formatCurrency(data?.data?.newBalance || 0)}`
      );
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error('Failed to record payment', {
        description: err.message || 'Server error recording ledger transaction.'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payNum = parseFloat(amount);
    if (!payNum || payNum <= 0) {
      toast.error('Please enter a valid payment amount greater than 0');
      return;
    }
    if (payNum > currentBalance) {
      if (!window.confirm(`Payment amount (${formatCurrency(payNum)}) is higher than current outstanding debt (${formatCurrency(currentBalance)}). Proceed?`)) {
        return;
      }
    }

    paymentMutation.mutate({
      amount: payNum,
      paymentMethod,
      notes: notes.trim() || undefined
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      icon={Receipt}
      title="Record Ledger Payment"
      subtitle={`Customer: ${customer?.name} (${customer?.customerCode})`}
      badgeText={`Debt: ${formatCurrency(currentBalance)}`}
      badgeVariant="warning"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Outstanding Summary Pill */}
        <div className="p-3.5 rounded-xl border border-surface bg-surface-page flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium block">Current Unsettled Balance</span>
            <span className="text-xl font-bold font-mono text-red-600 dark:text-red-400">
              {formatCurrency(currentBalance)}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmount(String(currentBalance))}
            className="text-xs font-semibold h-8 border-surface hover:bg-surface-card cursor-pointer"
          >
            Settle Full Debt
          </Button>
        </div>

        {/* Amount Input */}
        <FormField label="Payment Amount Received (₹)" required>
          <FormInput
            type="number"
            min="1"
            max={currentBalance * 2}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            autoFocus
          />
        </FormField>

        {/* Payment Mode */}
        <FormField label="Payment Tender Method" required>
          <FormSelect
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="CASH">Cash in Hand</option>
            <option value="UPI">UPI / QR Code Transfer</option>
            <option value="CARD">Debit / Credit Card POS</option>
            <option value="BANK_TRANSFER">Direct Bank NEFT / RTGS</option>
          </FormSelect>
        </FormField>

        {/* Notes */}
        <FormField label="Transaction Reference / Note (Optional)">
          <FormTextarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Cheque #492019 or NEFT Ref / Receipt issued"
          />
        </FormField>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 text-sm font-medium rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={paymentMutation.isPending}
            className="h-10 px-5 text-sm font-semibold rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white shadow-sm gap-2 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>{paymentMutation.isPending ? 'Recording...' : 'Record Payment'}</span>
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
