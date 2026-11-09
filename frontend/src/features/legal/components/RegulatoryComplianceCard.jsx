import React from 'react';
import { Scale, CheckCircle2, ShieldAlert } from 'lucide-react';

export function RegulatoryComplianceCard() {
  const compliances = [
    {
      title: 'First-Expiry, First-Out (FEFO) Dispatch',
      agency: 'WHO-GMP & Good Distribution Practice (GDP)',
      description:
        'Enforces chronological sorting by expiry date during checkout. Prevents dispensing newly received stock while older batches remain on shelf, eliminating expired medicine risks.',
      status: 'Automated Expiry Safeguard'
    },
    {
      title: 'Immutable Movement Audit Log (21 CFR Part 11)',
      agency: 'Drug Regulatory Control Standards',
      description:
        'Every stock intake (GRN), point-of-sale deduction, customer return, and manual adjustment records immutable quantity deltas, batch ID, timestamp, and responsible user ID with required audit reasons.',
      status: 'Strict Append-Only Ledger'
    },
    {
      title: 'Restricted Batch Intake Verification',
      agency: 'State & Central Drug Regulatory Agencies',
      description:
        'Intake of already-expired shipments during Goods Received Note (GRN) processing is automatically rejected at the intake gate to safeguard customer health.',
      status: 'Intake Regulatory Gate'
    },
    {
      title: 'Itemized GST & Tax Transparency',
      agency: 'Commercial Sales Tax Compliance',
      description:
        'Itemized CGST/SGST/IGST tax rates are stored per line item and computed in high-precision currency values to ensure invoices conform to commercial tax billing audits.',
      status: 'Itemized POS Engine'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface-card border border-surface rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-surface">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Pharmaceutical Regulatory Framework</h2>
            <p className="text-xs text-text-muted">Statutory alignment with national and global healthcare dispensing standards</p>
          </div>
        </div>

        {/* Regulatory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compliances.map((comp, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-surface-muted/50 border border-surface flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-brand-primary">{comp.agency}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-text-primary">{comp.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{comp.description}</p>
              </div>
              <div className="pt-2 border-t border-surface/50 text-[11px] font-mono text-text-secondary">
                {comp.status}
              </div>
            </div>
          ))}
        </div>

        {/* Important Regulatory Disclaimer */}
        <div className="p-4 rounded-xl bg-surface-muted/80 border border-surface space-y-2">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Statutory Operational Notice
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Operating this retail dispensary management system in a clinical healthcare environment requires active drug authority licensing, certified cold-chain monitoring hardware, and registered Pharmacist-in-Charge supervision.
          </p>
        </div>
      </div>
    </div>
  );
}
