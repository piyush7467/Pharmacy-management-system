import React from 'react';
import { Lock, Shield, EyeOff, Server, Database, UserCheck } from 'lucide-react';

export function PrivacyPolicyCard() {
  return (
    <div className="space-y-6">
      <div className="bg-surface-card border border-surface rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-surface">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Data Privacy & Information Security Policy</h2>
            <p className="text-xs text-text-muted">Commitment to minimal data collection and cryptographic security</p>
          </div>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-muted/60 border border-surface space-y-2">
            <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
              <EyeOff className="w-4 h-4" />
              Zero Third-Party Telemetry
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              PharmaPulse operates with zero third-party advertising scripts, external tracking pixels, or cross-site fingerprinting. All operational metrics remain strictly within your sovereign PostgreSQL instance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-muted/60 border border-surface space-y-2">
            <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
              <Shield className="w-4 h-4" />
              Argon2id Password Storage
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              User credentials are salted and hashed using state-of-the-art Argon2id algorithm, resistant to GPU-accelerated brute-force attacks and rainbow table compromises. Plaintext passwords are never logged or stored.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-muted/60 border border-surface space-y-2">
            <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
              <UserCheck className="w-4 h-4" />
              Role-Based Access Partitioning
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Customer phone numbers, purchase histories, and prescription notes are isolated. Cashiers are restricted from reviewing system administrative audits or financial margin reports.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-muted/60 border border-surface space-y-2">
            <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
              <Database className="w-4 h-4" />
              Session Token Ephemerality
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              JWT access tokens have short lifespans (15 minutes) and refresh tokens are stored in signed, httpOnly, sameSite cookies to protect against Cross-Site Scripting (XSS) and token theft.
            </p>
          </div>
        </div>

        {/* Detailed Legal Clauses */}
        <div className="space-y-4 pt-4 border-t border-surface text-xs text-text-secondary leading-relaxed">
          <h3 className="font-semibold text-sm text-text-primary">1. Collection and Storage of Patient Information</h3>
          <p>
            When processing point-of-sale transactions, customer names and contact numbers are collected exclusively for generating regulatory thermal tax invoices, tracking returns, and prescription verification. This information is never monetized, leased, or transmitted to insurance aggregators without explicit customer consent.
          </p>

          <h3 className="font-semibold text-sm text-text-primary">2. Data Subject Rights & Indian DPDPA / GDPR Alignment</h3>
          <p>
            Under the Digital Personal Data Protection Act (DPDPA 2023) and general data protection standards, data principals may request the erasure or anonymization of non-statutory records. Statutory dispensing logs and tax invoices must be retained for the minimum period mandated by drug control regulations (3 to 5 years depending on jurisdiction).
          </p>

          <h3 className="font-semibold text-sm text-text-primary">3. Database Backups & Encryption</h3>
          <p>
            All persistent storage volumes utilize AES-256 at-rest encryption via serverless PostgreSQL providers. In-transit traffic is strictly forced over TLS 1.3 with automated HSTS header enforcement.
          </p>
        </div>
      </div>
    </div>
  );
}
