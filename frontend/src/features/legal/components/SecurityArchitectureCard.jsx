import React from 'react';
import { ShieldCheck, Key, Lock, RefreshCw, Zap, Server, Code } from 'lucide-react';

export function SecurityArchitectureCard() {
  const securityFeatures = [
    {
      title: 'Idempotency Protection',
      detail: 'Client-supplied UUID idempotency keys on checkout prevent duplicate debits during network retries or double clicks.',
      icon: Zap
    },
    {
      title: 'Atomic Database Transactions',
      detail: 'Multi-table operations (Sale + SaleItems + Batches + StockMovements + Audit) execute inside Prisma $transaction rollback boundaries.',
      icon: RefreshCw
    },
    {
      title: 'Double-Entry Reconciliation Formula',
      detail: 'Mathematical proof audit verifies that physical batch stock matches cumulative movements: Opening + Purchases - Sales + Returns ± Adjustments.',
      icon: Server
    },
    {
      title: 'OpenAPI 3.0 Contract Verification',
      detail: 'All endpoints are documented and validated via OpenAPI 3.0 schema specs mounted at /api/v1/api-docs with zero mock data dependencies.',
      icon: Code
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface-card border border-surface rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-surface">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Security Architecture & Audit Integrity</h2>
            <p className="text-xs text-text-muted">Enterprise-grade defensive controls and cryptographic guarantees</p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityFeatures.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-surface-muted/50 border border-surface space-y-2">
                <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
                  <Icon className="w-4 h-4 text-emerald-500" />
                  {sec.title}
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {sec.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Technical Specification Summary */}
        <div className="p-4 rounded-xl bg-surface-muted/80 border border-surface space-y-3">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold text-text-primary">Defensive Implementation Standards</span>
            <span className="font-mono text-emerald-500">45 Passing Automated Test Suites</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface">
              <div className="font-bold text-text-primary">Argon2id</div>
              <div className="text-[11px] text-text-muted">Password KDF</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface">
              <div className="font-bold text-text-primary">AES-256 / TLS 1.3</div>
              <div className="text-[11px] text-text-muted">In-Transit & Rest</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface">
              <div className="font-bold text-text-primary">RBAC Guard</div>
              <div className="text-[11px] text-text-muted">Server-Side Gate</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface">
              <div className="font-bold text-text-primary">UUID v4</div>
              <div className="text-[11px] text-text-muted">Trace & Request ID</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
