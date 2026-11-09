import React from 'react';
import { ShieldCheck, RefreshCw, Zap, Server, FileCode, CheckCircle2 } from 'lucide-react';

export function SecurityArchitectureCard() {
  const securityFeatures = [
    {
      title: 'Idempotency Protection',
      detail: 'Unique transaction keys on point-of-sale checkout prevent duplicate billing during network timeouts or double-clicks.',
      icon: Zap
    },
    {
      title: 'Atomic Transaction Boundaries',
      detail: 'Multi-table operations (Sale + Batch Deductions + Movements + Invoicing) execute within rollback boundaries to prevent partial data states.',
      icon: RefreshCw
    },
    {
      title: 'Reconciled Audit Ledger',
      detail: 'Automated verification guarantees that current physical stock strictly equals: Inward Receipts - Sales + Returns ± Adjustments with zero discrepancy.',
      icon: Server
    },
    {
      title: 'Standardized API Architecture',
      detail: 'All system endpoints follow structured contracts with complete schema validation, secure error envelopes, and automated request tracing.',
      icon: FileCode
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
            <h2 className="text-lg font-bold text-text-primary">System Security &amp; Audit Architecture</h2>
            <p className="text-xs text-text-muted">Enterprise-grade defensive controls, encryption, and operational integrity</p>
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

        {/* Technical Standards Summary */}
        <div className="p-4 rounded-xl bg-surface-muted/80 border border-surface space-y-3">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold text-text-primary">Security Implementation Standards</span>
            <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Continuous System Verification
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface">
              <div className="font-bold text-text-primary">Encrypted Auth</div>
              <div className="text-[11px] text-text-muted">Multi-layer KDF</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface">
              <div className="font-bold text-text-primary">TLS 1.3 / AES-256</div>
              <div className="text-[11px] text-text-muted">In-Transit &amp; At Rest</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface">
              <div className="font-bold text-text-primary">Role Guards</div>
              <div className="text-[11px] text-text-muted">Server-Side RBAC</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface">
              <div className="font-bold text-text-primary">Audit Correlation</div>
              <div className="text-[11px] text-text-muted">Request Trace IDs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
