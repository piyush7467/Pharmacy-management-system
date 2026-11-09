import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatCurrency } from '../../../lib/utils.js';

export function SalesTrendChartCard({ chartData, dateRange }) {
  return (
    <div className="rounded-2xl border border-surface bg-surface-card p-5 md:p-6 flex flex-col justify-between shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Sales Revenue Trend</h2>
          <p className="text-xs text-text-muted mt-0.5">Daily net billing across completed transactions</p>
        </div>
        <span className="text-xs font-bold text-text-muted px-2.5 py-1 rounded-lg bg-surface-page border border-surface uppercase">
          {dateRange}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl bg-surface-card border border-surface p-3 shadow-xl text-xs space-y-1">
                      <p className="font-bold text-text-primary">{data.date}</p>
                      <p className="text-brand-primary font-black font-mono">Sales: {formatCurrency(data.sales)}</p>
                      <p className="text-text-muted font-medium">Orders: {data.orders}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#salesGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
