import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Truck,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Plus,
  Edit2,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Package,
  Pill,
  DollarSign,
  Calendar,
  ExternalLink,
  Loader2,
  Copy,
  Receipt,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '../../components/ui/table.jsx';
import { TablePagination } from '../../components/ui/table-pagination.jsx';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '../../components/ui/popover.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { formatCurrency, formatDate } from '../../lib/utils.js';
import { PurchaseDetailsModal } from '../purchases/components/PurchaseDetailsModal.jsx';

export function SupplierProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'medicines'
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Pagination for PO table
  const [poCurrentPage, setPoCurrentPage] = useState(1);
  const [poPageSize, setPoPageSize] = useState(10);

  // Pagination for Medicines table
  const [medCurrentPage, setMedCurrentPage] = useState(1);
  const [medPageSize, setMedPageSize] = useState(10);

  // Fetch Supplier 360° Profile
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const res = await apiClient.get(`/suppliers/${id}`);
      return res.data?.supplier || res.data || null;
    },
    enabled: Boolean(id)
  });

  const supplier = data;

  const purchases = useMemo(() => {
    return Array.isArray(supplier?.purchases) ? supplier.purchases : [];
  }, [supplier?.purchases]);

  const suppliedMedicines = useMemo(() => {
    return Array.isArray(supplier?.suppliedMedicines) ? supplier.suppliedMedicines : [];
  }, [supplier?.suppliedMedicines]);

  // Paginated Purchases
  const paginatedPurchases = useMemo(() => {
    const start = (poCurrentPage - 1) * poPageSize;
    return purchases.slice(start, start + poPageSize);
  }, [purchases, poCurrentPage, poPageSize]);

  // Paginated Supplied Medicines
  const paginatedMedicines = useMemo(() => {
    const start = (medCurrentPage - 1) * medPageSize;
    return suppliedMedicines.slice(start, start + medPageSize);
  }, [suppliedMedicines, medCurrentPage, medPageSize]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleViewPurchaseDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setDetailsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Received
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Pending Delivery
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full line-through">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return <Badge variant="outline" className="text-[11px] font-medium text-slate-700 bg-slate-50 border-slate-200">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-text-muted flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        <p className="text-sm font-medium">Loading supplier dossier and contract ledger...</p>
      </div>
    );
  }

  if (isError || !supplier) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-600 inline-block">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Supplier Profile Unavailable</h2>
        <p className="text-xs text-text-muted">
          {error?.message || 'The requested distributor profile could not be found or has been archived.'}
        </p>
        <Button onClick={() => navigate('/suppliers')} variant="outline" className="gap-2 text-xs">
          <ArrowLeft className="w-4 h-4" /> Return to Suppliers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/suppliers')}
            className="h-9 px-3 gap-1.5 border-surface hover:bg-surface-muted text-text-secondary text-xs rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Suppliers</span>
          </Button>

          <div className="h-4 w-px bg-surface" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-text-primary">
                {supplier.name}
              </h1>
              {supplier.isActive ? (
                <span className="inline-block text-[11px] font-semibold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-0.5 rounded-full">
                  Active Vendor
                </span>
              ) : (
                <span className="inline-block text-[11px] font-medium text-text-muted border border-surface px-2.5 py-0.5 rounded-full line-through">
                  Suspended
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Registered Distributor ID: <span className="font-mono">{supplier.id.slice(0, 8)}...</span>
            </p>
          </div>
        </div>

        {/* Header Action CTAs */}
        <div className="flex items-center gap-2 flex-wrap">
          {supplier.phone && (
            <a
              href={`tel:${supplier.phone}`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-surface bg-surface-card hover:bg-surface-muted text-text-primary text-xs font-semibold transition-colors shadow-2xs"
              title="Call Supplier Phone"
            >
              <Phone className="w-3.5 h-3.5 text-brand-primary" />
              <span>Call</span>
            </a>
          )}

          {supplier.email && (
            <a
              href={`mailto:${supplier.email}`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-surface bg-surface-card hover:bg-surface-muted text-text-primary text-xs font-semibold transition-colors shadow-2xs"
              title="Send Procurement Email"
            >
              <Mail className="w-3.5 h-3.5 text-brand-primary" />
              <span>Email</span>
            </a>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}
            className="h-9 px-3 gap-1.5 border-surface hover:bg-surface-muted text-xs font-semibold rounded-lg cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate(`/purchases/new?supplier=${supplier.id}`)}
            className="h-9 px-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs gap-1.5 rounded-lg shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Order</span>
          </Button>
        </div>
      </div>

      {/* 2. Management KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="bg-surface-card border-surface shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
              PO Contracts Made
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-text-primary tabular-nums">
                {supplier.purchaseCount ?? purchases.length}
              </span>
              <span className="text-xs text-text-muted">orders</span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">Lifetime purchase contracts</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
              Total Spend Volume
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-brand-primary tabular-nums">
                {formatCurrency(supplier.totalSpend ?? 0)}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">Procurement ledger value</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
              Fulfilled & Received
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {supplier.receivedOrders ?? 0}
              </span>
              <span className="text-xs text-text-muted">GRNs stocked</span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">Completed shipments</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
              Pending Delivery
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                {supplier.pendingOrders ?? 0}
              </span>
              <span className="text-xs text-text-muted">draft orders</span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">Awaiting inward stock</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Content: Left Dossier Card + Right Detailed Ledgers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vendor Dossier & Contact Info */}
        <div className="space-y-4">
          <Card className="bg-surface-card border-surface shadow-xs">
            <CardHeader className="p-4 pb-3 border-b border-surface">
              <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-primary" />
                <span>Vendor Dossier & Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Representative */}
              <div>
                <span className="text-text-muted block text-[11px] font-medium uppercase tracking-wider">
                  Primary Representative
                </span>
                <span className="font-semibold text-text-primary text-sm mt-0.5 block">
                  {supplier.contactPerson || 'Not specified'}
                </span>
              </div>

              {/* Direct Phone with Click-to-Call */}
              <div>
                <span className="text-text-muted block text-[11px] font-medium uppercase tracking-wider">
                  Contact Phone (Click to Dial)
                </span>
                {supplier.phone ? (
                  <div className="flex items-center justify-between mt-0.5">
                    <a
                      href={`tel:${supplier.phone}`}
                      className="font-mono font-semibold text-text-primary hover:text-brand-primary hover:underline flex items-center gap-1.5 text-sm"
                      title="Direct click to call"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span>{supplier.phone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(supplier.phone, 'Phone number')}
                      className="text-text-muted hover:text-text-primary p-1 rounded cursor-pointer"
                      title="Copy phone"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-text-muted italic">No phone registered</span>
                )}
              </div>

              {/* Direct Email with Click-to-Email */}
              <div>
                <span className="text-text-muted block text-[11px] font-medium uppercase tracking-wider">
                  Procurement Email (Click to Mail)
                </span>
                {supplier.email ? (
                  <div className="flex items-center justify-between mt-0.5">
                    <a
                      href={`mailto:${supplier.email}`}
                      className="font-medium text-text-primary hover:text-brand-primary hover:underline flex items-center gap-1.5 truncate max-w-[200px]"
                      title="Direct click to write email"
                    >
                      <Mail className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(supplier.email, 'Email address')}
                      className="text-text-muted hover:text-text-primary p-1 rounded cursor-pointer"
                      title="Copy email"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-text-muted italic">No email registered</span>
                )}
              </div>

              {/* Facility Address */}
              <div>
                <span className="text-text-muted block text-[11px] font-medium uppercase tracking-wider">
                  Registered Facility / Warehouse
                </span>
                {supplier.address ? (
                  <div className="mt-1 p-2.5 rounded-lg bg-surface-muted border border-surface text-text-secondary leading-relaxed flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                    <span className="whitespace-pre-wrap">{supplier.address}</span>
                  </div>
                ) : (
                  <span className="text-text-muted italic mt-0.5 block">No address specified</span>
                )}
              </div>

              {/* Tax & GSTIN Compliance */}
              <div className="pt-2 border-t border-surface space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted font-medium">GSTIN / Tax ID:</span>
                  {supplier.taxNumber ? (
                    <code className="px-2 py-0.5 rounded bg-surface-muted border border-surface font-mono font-semibold text-xs text-text-primary">
                      {supplier.taxNumber}
                    </code>
                  ) : (
                    <span className="text-text-muted italic">Not registered</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted font-medium">Registered Since:</span>
                  <span className="font-mono text-text-primary">{formatDate(supplier.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Tabs for Orders Ledger and Supplied Medicines */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Selector Buttons */}
          <div className="flex items-center justify-between border-b border-surface pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Contracts & Orders Ledger ({purchases.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('medicines')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'medicines'
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Supplied Drugs Directory ({suppliedMedicines.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Purchase Orders Ledger */}
          {activeTab === 'orders' && (
            <Card className="bg-surface-card border-surface shadow-xs overflow-hidden">
              <CardContent className="p-0">
                {purchases.length === 0 ? (
                  <div className="py-16 text-center text-text-muted">
                    <Receipt className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
                    <p className="font-semibold text-base text-text-primary">No purchase orders on file</p>
                    <p className="text-xs text-text-muted mt-1">
                      Create a purchase order to record inward pharmaceutical stock from this vendor.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/purchases/new?supplier=${supplier.id}`)}
                      className="mt-4 bg-brand-primary text-white font-semibold text-xs gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Purchase Order
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-200 bg-slate-50/90 hover:bg-slate-50/90 text-slate-500">
                          <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-slate-500">PO Number</TableHead>
                          <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-500">Order Date</TableHead>
                          <TableHead className="min-w-[180px] text-xs font-semibold uppercase tracking-wider text-slate-500">Ordered Items</TableHead>
                          <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Grand Total</TableHead>
                          <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Status</TableHead>
                          <TableHead className="w-24 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-4">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedPurchases.map((po) => {
                          const items = Array.isArray(po.items) ? po.items : [];
                          const firstItem = items[0];
                          const hasMore = items.length > 1;

                          return (
                            <TableRow key={po.id} className="border-surface/60 hover:bg-surface-page/70 transition-colors">
                              {/* PO Number */}
                              <TableCell className="w-36 align-middle font-mono font-semibold text-xs text-brand-primary">
                                <code className="px-2 py-1 rounded bg-surface-page border border-surface font-mono font-medium text-xs text-text-primary block w-fit">
                                  {po.purchaseNumber}
                                </code>
                              </TableCell>

                              {/* Order Date */}
                              <TableCell className="w-32 align-middle text-xs text-text-muted font-medium">
                                {formatDate(po.orderedDate || po.createdAt)}
                              </TableCell>

                              {/* Items summary with popover */}
                              <TableCell className="min-w-[180px] align-middle">
                                {items.length > 0 ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-medium text-text-primary truncate max-w-[130px]" title={firstItem?.medicine?.name}>
                                      {firstItem?.medicine?.name || 'Line Item 1'}
                                    </span>
                                    <span className="text-[11px] font-mono text-text-muted">
                                      ({firstItem?.orderedQuantity} qty)
                                    </span>

                                    {hasMore && (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button
                                            type="button"
                                            className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/25 hover:bg-brand-primary/20 transition-colors cursor-pointer flex items-center gap-0.5"
                                          >
                                            +{items.length - 1} more
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-72 p-3 text-xs shadow-xl" align="start">
                                          <div className="font-semibold text-xs text-text-primary border-b border-surface pb-1.5 flex items-center justify-between">
                                            <span>PO Line Items ({items.length})</span>
                                            <span className="font-mono text-[10px] text-text-muted">{po.purchaseNumber}</span>
                                          </div>
                                          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                                            {items.map((it, idx) => (
                                              <div key={idx} className="p-1.5 rounded bg-surface-muted/60 border border-surface flex items-center justify-between text-[11px]">
                                                <span className="truncate max-w-[160px] font-medium text-text-primary">{it.medicine?.name}</span>
                                                <span className="font-mono text-text-muted">{it.orderedQuantity} qty</span>
                                              </div>
                                            ))}
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-text-muted font-mono">{po.itemsCount ?? 0} line item(s)</span>
                                )}
                              </TableCell>

                              {/* Grand Total */}
                              <TableCell className="w-32 align-middle text-right font-mono font-semibold text-sm text-text-primary tabular-nums">
                                {formatCurrency(po.grandTotal)}
                              </TableCell>

                              {/* Status */}
                              <TableCell className="w-32 align-middle text-center">
                                {getStatusBadge(po.status)}
                              </TableCell>

                              {/* Action */}
                              <TableCell className="w-24 align-middle text-right pr-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-text-muted hover:text-brand-primary hover:border-brand-primary/40 font-medium gap-1 cursor-pointer rounded-lg text-xs"
                                  onClick={() => handleViewPurchaseDetails(po)}
                                  title="Inspect purchase details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Purchases Table Pagination */}
                {purchases.length > 0 && (
                  <TablePagination
                    currentPage={poCurrentPage}
                    pageSize={poPageSize}
                    totalItems={purchases.length}
                    onPageChange={setPoCurrentPage}
                    onPageSizeChange={(newSize) => {
                      setPoPageSize(newSize);
                      setPoCurrentPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20]}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 2: Supplied Medicines Catalogue */}
          {activeTab === 'medicines' && (
            <Card className="bg-surface-card border-surface shadow-xs overflow-hidden">
              <CardContent className="p-0">
                {suppliedMedicines.length === 0 ? (
                  <div className="py-16 text-center text-text-muted">
                    <Pill className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
                    <p className="font-semibold text-base text-text-primary">No drug history recorded</p>
                    <p className="text-xs text-text-muted mt-1">
                      Received goods shipments from this supplier will register supplied products here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-200 bg-slate-50/90 hover:bg-slate-50/90 text-slate-500">
                          <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-slate-500">SKU Code</TableHead>
                          <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-slate-500">Medicine & Salt Formulation</TableHead>
                          <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Last Unit Cost</TableHead>
                          <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-500">Last Procured</TableHead>
                          <TableHead className="w-24 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-4">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedMedicines.map((med) => (
                          <TableRow key={med.id} className="border-surface/60 hover:bg-surface-page/70 transition-colors">
                            {/* SKU Code */}
                            <TableCell className="w-36 align-middle font-mono font-medium text-xs text-text-primary">
                              <code className="px-2 py-1 rounded bg-surface-page border border-surface block w-fit">
                                {med.sku}
                              </code>
                            </TableCell>

                            {/* Medicine Name & Salt */}
                            <TableCell className="min-w-[200px] align-middle">
                              <div className="font-semibold text-sm text-text-primary">{med.name}</div>
                              <div className="text-xs text-text-muted mt-0.5">
                                {med.genericName || 'Standard formula'}
                                {med.strength ? ` • ${med.strength}` : ''}
                                {med.dosageForm ? ` • ${med.dosageForm}` : ''}
                              </div>
                            </TableCell>

                            {/* Last Unit Cost */}
                            <TableCell className="w-32 align-middle text-right font-mono font-semibold text-sm text-text-primary tabular-nums">
                              {formatCurrency(med.lastUnitCost || 0)}
                            </TableCell>

                            {/* Last Procured Date */}
                            <TableCell className="w-32 align-middle text-xs text-text-muted font-medium">
                              {formatDate(med.lastPurchaseDate)}
                            </TableCell>

                            {/* Action: Open in catalogue */}
                            <TableCell className="w-24 align-middle text-right pr-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-text-muted hover:text-brand-primary hover:border-brand-primary/40 font-medium gap-1 cursor-pointer rounded-lg text-xs"
                                onClick={() => navigate(`/medicines?search=${encodeURIComponent(med.name)}`)}
                                title="Open medicine formulation in catalogue"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>View</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Medicines Table Pagination */}
                {suppliedMedicines.length > 0 && (
                  <TablePagination
                    currentPage={medCurrentPage}
                    pageSize={medPageSize}
                    totalItems={suppliedMedicines.length}
                    onPageChange={setMedCurrentPage}
                    onPageSizeChange={(newSize) => {
                      setMedPageSize(newSize);
                      setMedCurrentPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20]}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal: View Purchase Order Details */}
      {selectedPurchase && (
        <PurchaseDetailsModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          purchase={selectedPurchase}
        />
      )}
    </div>
  );
}

