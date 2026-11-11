import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  Building2,
  Package,
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import { apiClient } from '../../services/api/apiClient.js';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { formatCurrency, formatDate } from '../../lib/utils.js';
import { CustomerModal } from './components/CustomerModal.jsx';
import { RecordPaymentModal } from './components/RecordPaymentModal.jsx';

const CUSTOMER_TYPES = [
  { id: 'ALL', label: 'All Segments' },
  { id: 'GENERAL', label: 'General Walk-in' },
  { id: 'REGULAR', label: 'Regular / Loyalty' },
  { id: 'HOSPITAL_CLINIC', label: 'Hospital / Clinic' },
  { id: 'WHOLESALE_BULK', label: 'Wholesale Bulk' },
  { id: 'CORPORATE_TPA', label: 'Corporate / TPA' }
];

const TYPE_CONFIG = {
  GENERAL: {
    label: 'Walk-in',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: Users
  },
  REGULAR: {
    label: 'Regular Patient',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: UserCheck
  },
  HOSPITAL_CLINIC: {
    label: 'Hospital / Clinic',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: Building2
  },
  WHOLESALE_BULK: {
    label: 'Wholesale Bulk',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Package
  },
  CORPORATE_TPA: {
    label: 'Corporate TPA',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: ShieldCheck
  }
};

export function CustomersView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [onlyBalance, setOnlyBalance] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [customerForPayment, setCustomerForPayment] = useState(null);

  // Fetch Customers
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['customers', { search: searchTerm, type: selectedType, onlyBalance }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (onlyBalance) params.append('hasBalance', 'true');
      params.append('limit', '50');

      const res = await apiClient.get(`/customers?${params.toString()}`);
      return res.data;
    }
  });

  const customers = Array.isArray(data) ? data : data?.data || [];

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/customers/${id}`),
    onSuccess: () => {
      toast.success('Customer profile archived');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => {
      toast.error('Failed to remove customer', {
        description: err.message || 'Cannot delete customer with historical transactions.'
      });
    }
  });

  // Calculate Metrics from Current List
  const totalCount = customers.length;
  const regularCount = customers.filter((c) => c.type === 'REGULAR').length;
  const hospitalCount = customers.filter((c) => c.type === 'HOSPITAL_CLINIC').length;
  const bulkCount = customers.filter((c) => c.type === 'WHOLESALE_BULK').length;
  const totalCreditBalance = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleOpenPayment = (customer) => {
    setCustomerForPayment(customer);
    setPaymentModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate and archive ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Unboxed Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-text-primary">
              Customer Accounts
            </h1>
            <Badge variant="outline" className="font-semibold px-2 py-0.5 text-xs">
              {totalCount} Profiles
            </Badge>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Manage retail patients, loyalty members, hospital institutions, and bulk wholesale accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 px-3.5 gap-2 border-surface cursor-pointer text-text-secondary hover:text-text-primary"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="h-10 px-4 text-sm font-semibold rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white shadow-sm gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Summary Strip (Restrained, Unboxed) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-surface bg-surface-card">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider">
            <span>Total Profiles</span>
            <Users className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-2xl font-bold text-text-primary mt-2">
            {totalCount}
          </div>
          <p className="text-xs text-text-muted mt-0.5">Active client registry</p>
        </div>

        <div className="p-4 rounded-xl border border-surface bg-surface-card">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider">
            <span>Loyalty / Regular</span>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {regularCount}
          </div>
          <p className="text-xs text-text-muted mt-0.5">Chronic care patients</p>
        </div>

        <div className="p-4 rounded-xl border border-surface bg-surface-card">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider">
            <span>Hospitals & Clinics</span>
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {hospitalCount}
          </div>
          <p className="text-xs text-text-muted mt-0.5">B2B Institutional</p>
        </div>

        <div className="p-4 rounded-xl border border-surface bg-surface-card">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider">
            <span>Wholesale Bulk</span>
            <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {bulkCount}
          </div>
          <p className="text-xs text-text-muted mt-0.5">Commercial buyers</p>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl border border-surface bg-surface-card">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider">
            <span>Ledger Outstanding</span>
            <CreditCard className="w-4 h-4 text-red-500" />
          </div>
          <div className={`text-2xl font-bold mt-2 ${totalCreditBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}>
            {formatCurrency(totalCreditBalance)}
          </div>
          <p className="text-xs text-text-muted mt-0.5">Unsettled credit debt</p>
        </div>
      </div>

      {/* 3. Filters & Search Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, customer code, phone, GSTIN..."
            className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-surface bg-surface-card text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        {/* Toggle Balance Only */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyBalance}
              onChange={(e) => setOnlyBalance(e.target.checked)}
              className="rounded border-surface text-brand-primary focus:ring-brand-primary w-4 h-4"
            />
            <span>With Outstanding Balance Only</span>
          </label>
        </div>
      </div>

      {/* 4. Type Segment Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
        {CUSTOMER_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedType(type.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedType === type.id
                ? 'bg-brand-primary text-white font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-card border border-transparent'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* 5. Main Customer Table (Unboxed Linear/Stripe Table) */}
      <div className="border border-surface rounded-xl overflow-hidden bg-surface-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-page/60 border-b border-surface text-xs font-semibold text-text-muted uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Profile</th>
                <th className="py-3 px-4">Segment Type</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Tax & License</th>
                <th className="py-3 px-4">Terms & Discount</th>
                <th className="py-3 px-4 text-right">Credit Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-primary" />
                    <span>Loading customers directory...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="h-12 w-12 rounded-2xl bg-surface-page border border-surface flex items-center justify-center text-text-muted mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-base text-text-primary">No customers found</h3>
                      <p className="text-xs text-text-muted mt-1 text-center">
                        {searchTerm
                          ? 'No customer records match your search filter.'
                          : 'Register your first customer or hospital account to begin tracking sales and credit.'}
                      </p>
                      <Button
                        onClick={handleOpenAdd}
                        className="mt-4 h-9 px-4 text-xs font-semibold rounded-lg bg-brand-primary text-white cursor-pointer"
                      >
                        <Plus className="w-4 h-4 mr-1.5" /> New Customer
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((cust) => {
                  const typeCfg = TYPE_CONFIG[cust.type] || TYPE_CONFIG.GENERAL;
                  const TypeIcon = typeCfg.icon;
                  const balance = cust.currentBalance || 0;
                  const limit = cust.creditLimit || 0;
                  const hasCredit = limit > 0;
                  const isHighBalance = hasCredit && balance >= limit * 0.8;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-surface-page/50 transition-colors group"
                    >
                      {/* Customer Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-xl bg-surface-page border border-surface flex items-center justify-center shrink-0 text-brand-primary font-bold text-xs uppercase">
                            {cust.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-text-primary text-[15px]">
                                {cust.name}
                              </span>
                              <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-surface-page border border-surface text-text-muted">
                                {cust.customerCode}
                              </span>
                            </div>
                            {cust.companyName && (
                              <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-text-muted" />
                                <span>{cust.companyName}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Segment Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`font-medium gap-1 text-xs py-0.5 px-2 border ${typeCfg.badgeClass}`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          <span>{typeCfg.label}</span>
                        </Badge>
                      </td>

                      {/* Contact Details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {cust.phone ? (
                            <p className="text-xs font-mono text-text-primary flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-text-muted" />
                              <span>{cust.phone}</span>
                            </p>
                          ) : (
                            <span className="text-xs text-text-muted italic">No phone</span>
                          )}
                          {cust.email && (
                            <p className="text-xs text-text-muted flex items-center gap-1.5 truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-text-muted" />
                              <span>{cust.email}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Tax & License */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          {cust.taxNumber ? (
                            <p className="text-xs font-mono text-text-primary">
                              <span className="text-text-muted font-sans text-[11px]">GSTIN: </span>
                              {cust.taxNumber}
                            </p>
                          ) : null}
                          {cust.drugLicenseNo ? (
                            <p className="text-xs font-mono text-text-muted">
                              <span className="text-[11px] font-sans">DL: </span>
                              {cust.drugLicenseNo}
                            </p>
                          ) : null}
                          {!cust.taxNumber && !cust.drugLicenseNo && (
                            <span className="text-xs text-text-muted">—</span>
                          )}
                        </div>
                      </td>

                      {/* Terms & Discount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          {cust.defaultDiscountPct > 0 ? (
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              {cust.defaultDiscountPct}% Off
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted">Standard MRP</span>
                          )}
                          {cust.paymentTermsDays > 0 && (
                            <p className="text-xs text-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Net {cust.paymentTermsDays} Days
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Credit Balance */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div>
                          <div className={`font-bold font-mono text-[14px] ${balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}>
                            {formatCurrency(balance)}
                          </div>
                          {hasCredit ? (
                            <p className="text-[11px] text-text-muted">
                              Limit: {formatCurrency(limit)}
                            </p>
                          ) : (
                            <p className="text-[11px] text-text-muted">No credit line</p>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {balance > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenPayment(cust)}
                              className="h-8 px-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                              title="Record Ledger Payment"
                            >
                              <Receipt className="w-3.5 h-3.5 mr-1" />
                              Pay
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(cust)}
                            className="h-8 w-8 p-0 text-text-muted hover:text-text-primary cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(cust.id, cust.name)}
                            className="h-8 w-8 p-0 text-text-muted hover:text-red-600 cursor-pointer"
                            title="Deactivate Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Form Modal */}
      {modalOpen && (
        <CustomerModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          initialData={editingCustomer}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setModalOpen(false);
          }}
        />
      )}

      {/* Ledger Payment Modal */}
      {paymentModalOpen && customerForPayment && (
        <RecordPaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          customer={customerForPayment}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setPaymentModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
