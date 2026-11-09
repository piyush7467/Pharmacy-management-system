import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Terminal, HelpCircle } from 'lucide-react';

export function TermsOfServiceCard() {
  return (
    <div className="space-y-6">
      <div className="bg-surface-card border border-surface rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-surface">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Terms of Service & Evaluation Agreement</h2>
            <p className="text-xs text-text-muted">Assessment environment terms for ALGIONS AI LABS PRIVATE LIMITED</p>
          </div>
        </div>

        {/* Evaluation Banner */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-text-primary">Academic & Software Assessment Notice</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              PharmaPulse is developed exclusively as a full-stack technical assessment deliverable for ALGIONS AI LABS PRIVATE LIMITED. It is designed to prove production architecture, mathematical ledger accuracy, and software engineering rigor.
            </p>
          </div>
        </div>

        {/* Key Terms */}
        <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
          <div className="border-b border-surface pb-3 space-y-1">
            <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              1. Permitted Technical Evaluation Scope
            </h3>
            <p>
              The evaluation panel, engineering leads, and technical reviewers of ALGIONS AI LABS are granted full authorization to execute stress tests, review source code, seed mock inventory, invoke RESTful endpoints via Swagger UI, and audit database transaction rollbacks.
            </p>
          </div>

          <div className="border-b border-surface pb-3 space-y-1">
            <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              2. Simulation of Financial Settlements
            </h3>
            <p>
              Point-of-sale checkouts, cash tendering, UPI QR code generation, and card transactions simulated within this system represent sandbox calculations. No real-world monetary funds, bank accounts, or merchant gateways are debited or credited.
            </p>
          </div>

          <div className="border-b border-surface pb-3 space-y-1">
            <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              3. Clinical and Prescriptive Non-Reliance
            </h3>
            <p>
              Drug dosage formulations, interactions, and batch expiry alerts provided by this software are illustrative of FEFO inventory algorithms. They must not be relied upon as a substitute for professional clinical advice, physician prescriptions, or certified pharmacist dispensation in emergency healthcare settings.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              4. Intellectual Property & Assessment Delivery
            </h3>
            <p>
              The architecture, database schema, Prisma migrations, custom FEFO allocation algorithm, double-entry mathematical ledger, and React component modularization represent original candidate work submitted for technical evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
