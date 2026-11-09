import React from 'react';
import { FileText, ShieldAlert, CheckCircle } from 'lucide-react';

export function TermsOfServiceCard() {
  return (
    <div className="space-y-6">
      <div className="bg-surface-card border border-surface rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-surface">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Terms of Service &amp; Operating Agreement</h2>
            <p className="text-xs text-text-muted">Standard operating terms governing pharmacy dispensing and software usage</p>
          </div>
        </div>

        {/* Operating Scope Banner */}
        <div className="p-4 rounded-xl bg-surface-muted/60 border border-surface flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-text-primary">Authorized Dispensary Operational Terms</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              This pharmacy management platform is licensed for operational inventory tracking, point-of-sale checkout, fiscal tax invoicing, and regulatory batch compliance. All transactions are logged in accordance with good distribution practices.
            </p>
          </div>
        </div>

        {/* Key Terms */}
        <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
          <div className="border-b border-surface pb-3 space-y-1">
            <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              1. Authorized User Accounts &amp; Access Controls
            </h3>
            <p>
              Access to this system is restricted to certified pharmacy personnel, registered pharmacists-in-charge, and authorized dispensary cashiers. Each user must operate strictly within their provisioned role boundaries. Sharing credentials or operating under another staff member's session is strictly prohibited.
            </p>
          </div>

          <div className="border-b border-surface pb-3 space-y-1">
            <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              2. Point-of-Sale Transactions &amp; Fiscal Invoicing
            </h3>
            <p>
              All checkouts processed via the POS terminal generate itemized fiscal invoices complying with commercial sales tax regulations. Cashiers must ensure customer payment tender matches invoice amounts before finalizing sales. Returns must be accompanied by the original transaction identifier and verified against valid batch receipts.
            </p>
          </div>

          <div className="border-b border-surface pb-3 space-y-1">
            <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              3. Clinical Responsibility &amp; Pharmacist Supervision
            </h3>
            <p>
              This software provides automated stock allocation, batch expiry tracking, and fiscal accounting tools. It does not replace professional clinical judgment. The certified Pharmacist-in-Charge remains solely responsible for verifying prescription validity, drug interactions, contraindications, and correct dosage dispensation.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              4. Data Retention &amp; Immutable Audit Logs
            </h3>
            <p>
              In compliance with drug control authorities, all stock intake manifests, sales deductions, batch write-offs, and customer returns are permanently recorded in an append-only transaction ledger. Audit logs cannot be deleted, altered, or expunged by store personnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
