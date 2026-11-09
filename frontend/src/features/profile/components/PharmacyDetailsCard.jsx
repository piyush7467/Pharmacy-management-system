import React from 'react';
import { Building2, Tag, Layers, CheckCircle2, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Label } from '../../../components/ui/label.jsx';
import { Button } from '../../../components/ui/button.jsx';

export function PharmacyDetailsCard({ profile, setProfile, onSave }) {
  const categories = [
    'Retail Community Pharmacy',
    'Hospital Outpatient Dispensary',
    'Clinical Compounding Pharmacy',
    'Specialty Pharmacy & Surgical Supplies',
    'Chain Dispensary Outpost'
  ];

  return (
    <Card className="bg-surface-card border-surface">
      <CardHeader className="p-5 sm:p-6 border-b border-surface">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-primary" />
              Enterprise Dispensary Identity
            </CardTitle>
            <CardDescription className="text-xs text-text-muted mt-1">
              Public branding, registered legal entity name, and dispensary classification.
            </CardDescription>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Profile
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-text-primary">
              Trading / Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={profile.pharmacyName || ''}
              onChange={(e) => setProfile({ ...profile, pharmacyName: e.target.value })}
              placeholder="e.g. PharmaFlow Central Pharmacy"
              className="bg-surface-page border-surface text-sm"
            />
            <p className="text-[11px] text-text-muted">Appears on patient invoices, POS screen headers, and customer receipts.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-text-primary">
              Registered Legal Entity Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={profile.legalName || ''}
              onChange={(e) => setProfile({ ...profile, legalName: e.target.value })}
              placeholder="e.g. PharmaPulse Healthcare Retail Solutions Pvt. Ltd."
              className="bg-surface-page border-surface text-sm"
            />
            <p className="text-[11px] text-text-muted">Mandatory corporate name used for statutory tax audits and purchase orders.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-text-primary">
              Tagline / Dispensary Subheader
            </Label>
            <Input
              value={profile.tagline || ''}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
              placeholder="e.g. Licensed Retail Dispensary & Clinical Supplies"
              className="bg-surface-page border-surface text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-text-primary">
              Pharmacy Classification Category
            </Label>
            <select
              value={profile.category || 'Retail Community Pharmacy'}
              onChange={(e) => setProfile({ ...profile, category: e.target.value })}
              className="w-full h-10 px-3 py-2 text-sm rounded-xl border border-surface bg-surface-page text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Operational Highlights Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-surface">
          <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-surface space-y-1">
            <span className="text-[11px] font-semibold text-text-muted block">Data Protection</span>
            <p className="font-bold text-sm text-text-primary">Cloud Synchronization</p>
            <p className="text-[11px] text-text-secondary">Automated real-time store backup</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-surface space-y-1">
            <span className="text-[11px] font-semibold text-text-muted block">Inventory Safeguard</span>
            <p className="font-bold text-sm text-text-primary">Expiry-First Issuance</p>
            <p className="text-[11px] text-text-secondary">Expired stock blocked automatically</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-surface space-y-1">
            <span className="text-[11px] font-semibold text-text-muted block">Financial Integrity</span>
            <p className="font-bold text-sm text-text-primary">Balanced Ledger Audit</p>
            <p className="text-[11px] text-text-secondary">Verified zero-discrepancy accounts</p>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button
            type="button"
            onClick={onSave}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Dispensary Identity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
