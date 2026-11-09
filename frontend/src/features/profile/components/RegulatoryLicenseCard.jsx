import React from 'react';
import { ShieldCheck, Award, FileText, AlertCircle, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Label } from '../../../components/ui/label.jsx';
import { Button } from '../../../components/ui/button.jsx';

export function RegulatoryLicenseCard({ profile, setProfile, onSave }) {
  return (
    <Card className="bg-surface-card border-surface">
      <CardHeader className="p-5 sm:p-6 border-b border-surface">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Statutory Drug Licensing & Regulatory Compliance
            </CardTitle>
            <CardDescription className="text-xs text-text-muted mt-1">
              Official retail drug control licenses, registered pharmacist oversight, and GSTIN identifiers.
            </CardDescription>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Form 20B / 21B Active
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-text-primary">
              Retail Drug License Number (Form 20B / 21B) <span className="text-red-500">*</span>
            </Label>
            <Input
              value={profile.licenseNumber || ''}
              onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
              placeholder="e.g. DL-2026-98442-20B/21B"
              className="bg-surface-page border-surface text-sm font-mono"
            />
            <p className="text-[11px] text-text-muted">Issued under Drugs and Cosmetics Rules by State Drug Controller.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-text-primary">
              Drug License Expiration Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={profile.licenseExpiry || '2028-12-31'}
              onChange={(e) => setProfile({ ...profile, licenseExpiry: e.target.value })}
              className="bg-surface-page border-surface text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-text-primary">
              Registered Pharmacist-in-Charge (PIC) <span className="text-red-500">*</span>
            </Label>
            <Input
              value={profile.pharmacistInCharge || ''}
              onChange={(e) => setProfile({ ...profile, pharmacistInCharge: e.target.value })}
              placeholder="e.g. Dr. Arvind Sharma, M.Pharm"
              className="bg-surface-page border-surface text-sm"
            />
            <p className="text-[11px] text-text-muted">Certified supervising professional responsible for dispensation audits.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-text-primary">
              Pharmacy Council Registration Number <span className="text-red-500">*</span>
            </Label>
            <Input
              value={profile.pharmacistCouncilNo || ''}
              onChange={(e) => setProfile({ ...profile, pharmacistCouncilNo: e.target.value })}
              placeholder="e.g. KSPC-Reg-65201"
              className="bg-surface-page border-surface text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-semibold text-text-primary">
              Commercial Tax Identification Number (GSTIN / VAT ID) <span className="text-red-500">*</span>
            </Label>
            <Input
              value={profile.taxNumber || ''}
              onChange={(e) => setProfile({ ...profile, taxNumber: e.target.value })}
              placeholder="e.g. GSTIN-29AABCP1234D1ZK"
              className="bg-surface-page border-surface text-sm font-mono"
            />
            <p className="text-[11px] text-text-muted">Itemized on all customer tax invoices and supplier purchase manifests.</p>
          </div>
        </div>

        {/* Regulatory Banner */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-text-primary">Statutory Compliance Notice</h4>
            <p className="text-[11px] text-text-muted leading-relaxed">
              These registered drug credentials and Pharmacist-in-Charge declarations are automatically printed on fiscal receipts, patient tax invoices, and goods intake manifests to comply with retail drug distribution regulations.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button
            type="button"
            onClick={onSave}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Regulatory Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
