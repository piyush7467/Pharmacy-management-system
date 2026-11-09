import React from 'react';
import { Boxes, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card.jsx';
import { formatCurrency } from '../../../lib/utils.js';

export function StockValuationCard({ stockVal = {}, isLoading }) {
  const costVal = Number(stockVal.totalCostValuation) || 0;
  const retailVal = Number(stockVal.totalRetailValuation) || 0;
  const marginAmt = Number(stockVal.potentialGrossMargin) || 0;
  const marginPct = Number(stockVal.marginPercentage) || 0;

  return (
    <Card className="bg-surface-card border-surface shadow-xs h-full flex flex-col justify-between">
      <CardHeader className="p-4 pb-2 border-b border-surface">
        <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Boxes className="w-4 h-4 text-brand-primary" />
          <span>Inventory Valuation & Margin Health</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {isLoading ? (
          <div className="h-[240px] flex items-center justify-center text-text-muted text-xs">
            Loading valuation data...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Total Cost Valuation
                </span>
                <p className="text-xl font-black text-text-primary font-mono">
                  {formatCurrency(costVal)}
                </p>
                <span className="text-[10px] text-text-muted block">Wholesale purchase capital</span>
              </div>

              <div className="p-4 rounded-xl border border-surface bg-surface-page space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Total Retail Valuation
                </span>
                <p className="text-xl font-black text-brand-primary font-mono">
                  {formatCurrency(retailVal)}
                </p>
                <span className="text-[10px] text-text-muted block">Max realizable MRP value</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-brand-primary/20 bg-brand-primary/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-brand-primary">
                <span>Potential Gross Margin:</span>
                <span className="text-base font-black font-mono">+{formatCurrency(marginAmt)} ({marginPct}%)</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Mathematical delta between wholesale procurement capital and retail MRP on shelf.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
