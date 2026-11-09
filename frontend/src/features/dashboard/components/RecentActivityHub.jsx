import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, RotateCcw, Clock } from 'lucide-react';
import { Badge } from '../../../components/ui/badge.jsx';
import { formatCurrency, formatDate } from '../../../lib/utils.js';

export function RecentActivityHub({
  activeTab,
  setActiveTab,
  recentSales = [],
  recentPurchases = []
}) {
  return (
    <div className="rounded-2xl border border-surface bg-surface-card overflow-hidden shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface px-5 py-4 gap-3 bg-surface-card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('sales')}
            className={`text-sm font-bold pb-1 transition-colors relative cursor-pointer ${
              activeTab === 'sales'
                ? 'text-brand-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Recent Sales Invoices
            {activeTab === 'sales' && (
              <span className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-brand-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`text-sm font-bold pb-1 transition-colors relative cursor-pointer ${
              activeTab === 'purchases'
                ? 'text-brand-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Recent Purchase Invoices
            {activeTab === 'purchases' && (
              <span className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-brand-primary" />
            )}
          </button>
        </div>

        <Link
          to={activeTab === 'sales' ? '/sales' : '/purchases'}
          className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View All {activeTab === 'sales' ? 'Sales' : 'Purchases'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content Table */}
      <div className="overflow-x-auto">
        {activeTab === 'sales' ? (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface bg-surface-page/50 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                <th className="py-3 px-5">Invoice #</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Payment Mode</th>
                <th className="py-3 px-5">Date & Time</th>
                <th className="py-3 px-5 text-right">Amount</th>
                <th className="py-3 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-surface-page/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-text-primary">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-text-primary">
                      {sale.customerName || 'Walk-in Customer'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-text-muted">{sale.paymentMethod}</span>
                    </td>
                    <td className="py-3.5 px-5 text-text-muted font-medium">{formatDate(sale.createdAt)}</td>
                    <td className="py-3.5 px-5 text-right font-black font-mono text-text-primary">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <Badge variant="outline" className="border-brand-primary/30 text-brand-primary font-bold text-[10px]">
                        {sale.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted text-xs font-medium">
                    No recent sales recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface bg-surface-page/50 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                <th className="py-3 px-5">PO Number</th>
                <th className="py-3 px-5">Supplier</th>
                <th className="py-3 px-5">Order Date</th>
                <th className="py-3 px-5 text-right">PO Total</th>
                <th className="py-3 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {recentPurchases.length > 0 ? (
                recentPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-surface-page/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-brand-primary">
                      {po.purchaseNumber}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-text-primary">
                      {po.supplier?.name || 'Distributor'}
                    </td>
                    <td className="py-3.5 px-5 text-text-muted font-medium">{formatDate(po.createdAt)}</td>
                    <td className="py-3.5 px-5 text-right font-black font-mono text-text-primary">
                      {formatCurrency(po.grandTotal)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <Badge variant="outline" className="border-surface font-bold text-[10px]">
                        {po.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted text-xs font-medium">
                    No recent purchase orders logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
