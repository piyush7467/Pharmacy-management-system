import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ShoppingCart,
  Boxes,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';
import { DataTable } from '../../components/ui/data-table.jsx';
import { formatCurrency } from '../../lib/utils.js';

// Seed-aligned operational trend data for Recharts (Sage / Warm Accent palette)
const ANALYTICS_DATA = [
  { day: 'Mon', sales: 12400, transactions: 42, units: 160 },
  { day: 'Tue', sales: 15800, transactions: 51, units: 195 },
  { day: 'Wed', sales: 14200, transactions: 48, units: 180 },
  { day: 'Thu', sales: 18900, transactions: 63, units: 230 },
  { day: 'Fri', sales: 21500, transactions: 72, units: 280 },
  { day: 'Sat', sales: 24800, transactions: 84, units: 320 },
  { day: 'Sun', sales: 19400, transactions: 60, units: 240 }
];

// Seeded batch records for TanStack Table demonstration
const BATCH_RECORDS = [
  {
    sku: 'MED-PCM-500',
    name: 'Paracetamol 500mg',
    batchNumber: 'BATCH-PCM-2026A',
    expiryDate: '2026-12-20',
    daysLeft: 42,
    stock: 80,
    cost: 15.0,
    mrp: 30.0,
    status: 'NEAR_EXPIRY'
  },
  {
    sku: 'MED-PCM-500',
    name: 'Paracetamol 500mg',
    batchNumber: 'BATCH-PCM-2026B',
    expiryDate: '2027-05-15',
    daysLeft: 188,
    stock: 150,
    cost: 14.5,
    mrp: 30.0,
    status: 'ACTIVE'
  },
  {
    sku: 'MED-AMX-250',
    name: 'Amoxicillin 250mg Capsules',
    batchNumber: 'BATCH-AMX-2026-01',
    expiryDate: '2027-02-01',
    daysLeft: 85,
    stock: 12,
    cost: 65.0,
    mrp: 110.0,
    status: 'LOW_STOCK'
  },
  {
    sku: 'MED-PCM-500',
    name: 'Paracetamol 500mg (Quarantined)',
    batchNumber: 'BATCH-PCM-EXPIRED',
    expiryDate: '2026-10-01',
    daysLeft: -38,
    stock: 20,
    cost: 12.0,
    mrp: 30.0,
    status: 'EXPIRED'
  }
];

export function DashboardView() {
  const tableColumns = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Medicine / Generic',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary">{row.original.name}</span>
            <span className="text-[11px] text-text-muted">{row.original.sku}</span>
          </div>
        )
      },
      {
        accessorKey: 'batchNumber',
        header: 'Batch Number',
        cell: ({ row }) => (
          <code className="text-xs font-mono font-medium text-text-primary px-1.5 py-0.5 rounded bg-surface-muted">
            {row.original.batchNumber}
          </code>
        )
      },
      {
        accessorKey: 'expiryDate',
        header: 'Expiry Date',
        cell: ({ row }) => {
          const days = row.original.daysLeft;
          return (
            <div className="flex flex-col">
              <span className="font-medium text-text-primary">{row.original.expiryDate}</span>
              <span
                className={`text-[11px] font-semibold ${
                  days < 0
                    ? 'text-red-600 dark:text-red-400'
                    : days <= 60
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-text-muted'
                }`}
              >
                {days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days} days remaining`}
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: 'stock',
        header: 'Available Units',
        cell: ({ row }) => (
          <span className="font-bold text-text-primary text-xs">{row.original.stock} units</span>
        )
      },
      {
        accessorKey: 'cost',
        header: 'Unit Cost',
        cell: ({ row }) => (
          <span className="text-text-muted">{formatCurrency(row.original.cost)}</span>
        )
      },
      {
        accessorKey: 'status',
        header: 'FEFO Status',
        cell: ({ row }) => {
          const s = row.original.status;
          if (s === 'ACTIVE') return <Badge variant="success">Active (FEFO Eligible)</Badge>;
          if (s === 'NEAR_EXPIRY') return <Badge variant="warning">Near-Expiry (Priority)</Badge>;
          if (s === 'LOW_STOCK') return <Badge variant="accent">Low Stock Warning</Badge>;
          if (s === 'EXPIRED') return <Badge variant="destructive">Expired (Blocked)</Badge>;
          return <Badge variant="outline">{s}</Badge>;
        }
      }
    ],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Pharmacy Operations Dashboard</h1>
            <Badge variant="success">Operational v1.0</Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Real-time batch tracking, First-Expiry-First-Out (FEFO) allocations, and PostgreSQL financial ledger.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button asChild variant="default">
            <Link to="/pos">
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Launch POS
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/purchases">
              <PackageCheck className="w-4 h-4 mr-1.5" />
              Receive PO
            </Link>
          </Button>
        </div>
      </div>

      {/* Bento Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[11px]">Total Stock Count</CardDescription>
            <Boxes className="w-4 h-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">242 Units</div>
            <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Reconciled</span> to Neon DB
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[11px]">Inventory Valuation</CardDescription>
            <span className="text-xs font-bold text-brand-accent">INR</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{formatCurrency(4155.00)}</div>
            <p className="text-[11px] text-text-muted mt-1">Batch purchase cost basis</p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border-amber-500/25 bg-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[11px] text-amber-700 dark:text-amber-400">
              Near-Expiry (&lt; 60d)
            </CardDescription>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">1 Batch</div>
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-1">
              Paracetamol (42d remaining)
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border-rose-500/25 bg-rose-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[11px] text-rose-700 dark:text-rose-400">
              Low Stock Warning
            </CardDescription>
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">1 Drug</div>
            <p className="text-[11px] font-medium text-rose-700 dark:text-rose-400 mt-1">
              Amoxicillin (12 / 30 reorder)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Analytics Chart & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Analytics Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm">Revenue & Dispensing Trend</CardTitle>
              <CardDescription>Daily sales volume and unit dispensing rate</CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-brand-primary" /> +14.2% vs Last Week
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ANALYTICS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#355B48" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#355B48" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D6A96B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D6A96B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#355B48"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    name="Revenue (₹)"
                  />
                  <Area
                    type="monotone"
                    dataKey="units"
                    stroke="#D6A96B"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorAccent)"
                    name="Units Dispensed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Operational Shortcuts & System Safeguards */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm">High-Frequency Actions</CardTitle>
            <CardDescription>Direct staff workflows with role guards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link
              to="/pos"
              className="flex items-center justify-between p-3 rounded-lg border border-surface hover:bg-surface-muted transition-colors text-xs font-medium text-text-primary group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-brand-primary/10 text-brand-primary">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary">Point of Sale (POS)</div>
                  <div className="text-[11px] text-text-muted">FEFO auto-allocation</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/purchases"
              className="flex items-center justify-between p-3 rounded-lg border border-surface hover:bg-surface-muted transition-colors text-xs font-medium text-text-primary group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-brand-accent/15 text-brand-accent">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary">Receive Supplier PO</div>
                  <div className="text-[11px] text-text-muted">Atomic stock intake</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/returns"
              className="flex items-center justify-between p-3 rounded-lg border border-surface hover:bg-surface-muted transition-colors text-xs font-medium text-text-primary group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary">Customer Return</div>
                  <div className="text-[11px] text-text-muted">Mandatory reason & audit</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </CardContent>

          <div className="p-4 mx-5 mb-5 rounded-lg bg-surface-muted/60 border border-surface text-[11px] text-text-muted flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>PostgreSQL row locks (<code className="font-mono text-[10px]">FOR UPDATE</code>) actively prevent checkout overselling.</span>
          </div>
        </Card>
      </div>

      {/* TanStack Table: Batch Inventory & Expiry Monitor */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm">Batch Inventory & Expiry Monitor</CardTitle>
            <CardDescription>
              Powered by TanStack Table: client-side sorting, global searching, and pagination.
            </CardDescription>
          </div>
          <Badge variant="outline">4 Demo Batches Active</Badge>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tableColumns}
            data={BATCH_RECORDS}
            searchPlaceholder="Filter medicines, SKU, or batch number..."
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
