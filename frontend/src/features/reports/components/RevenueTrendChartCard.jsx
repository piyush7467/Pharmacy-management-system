import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function RevenueTrendChartCard({ dailyTrend = [], isLoading }) {
  return (
    <Card className="bg-surface-card border-surface shadow-xs h-full flex flex-col justify-between">
      <CardHeader className="p-4 pb-2 border-b border-surface">
        <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-primary" />
          <span>Revenue & Tax Trend Over Time</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-6">
        {isLoading ? (
          <div className="h-[280px] flex items-center justify-center text-text-muted text-xs">
            Loading trend data...
          </div>
        ) : dailyTrend.length > 0 ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="reportsSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-surface-card border border-surface p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-text-primary">{data.date}</p>
                          <p className="text-brand-primary font-black font-mono">Gross Sales: {formatCurrency(data.sales)}</p>
                          {data.orders !== undefined && (
                            <p className="text-text-muted font-medium">Orders: {data.orders}</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Gross Sales (₹)"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#reportsSalesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-text-muted text-xs">
            No sales recorded in the selected period.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
