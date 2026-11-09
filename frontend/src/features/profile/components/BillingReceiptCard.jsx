import React from 'react';
import { CreditCard, QrCode, Printer, FileText, Landmark, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Label } from '../../../components/ui/label.jsx';
import { Button } from '../../../components/ui/button.jsx';

export function BillingReceiptCard({ profile, setProfile, receiptFormat, setReceiptFormat, onSave }) {
  const formats = [
    { id: '80mm', label: '80mm Thermal Roll', desc: 'Standard POS thermal receipt printer' },
    { id: '58mm', label: '58mm Thermal Roll', desc: 'Compact portable POS bluetooth printer' },
    { id: 'A4', label: 'A4 / A5 Tax Invoice', desc: 'Full-page laser / inkjet clinical document' }
  ];

  return (
    <Card className="bg-surface-card border-surface">
      <CardHeader className="p-5 sm:p-6 border-b border-surface">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-primary" />
              Point-of-Sale Settlement & Receipt Customization
            </CardTitle>
            <CardDescription className="text-xs text-text-muted mt-1">
              Configure UPI payment handles, settlement bank accounts, thermal invoice templates, and return policies.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* UPI & Banking Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <QrCode className="w-4 h-4 text-brand-primary" /> Instant POS Settlement Channels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary">
                Dispensary UPI ID (VPA) for QR Code Generation <span className="text-red-500">*</span>
              </Label>
              <Input
                value={profile.upiId || ''}
                onChange={(e) => setProfile({ ...profile, upiId: e.target.value })}
                placeholder="e.g. pharmapulse.pay@okaxis"
                className="bg-surface-page border-surface text-sm font-mono"
              />
              <p className="text-[11px] text-text-muted">Used by POS terminal to generate dynamic BharatQR / UPI payment codes.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-brand-primary" /> Settlement Bank Name
              </Label>
              <Input
                value={profile.bankName || ''}
                onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank - Commercial Branch"
                className="bg-surface-page border-surface text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary">Bank Account Number</Label>
              <Input
                value={profile.bankAccountNumber || ''}
                onChange={(e) => setProfile({ ...profile, bankAccountNumber: e.target.value })}
                placeholder="e.g. 50200088991122"
                className="bg-surface-page border-surface text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary">IFSC / Routing Code</Label>
              <Input
                value={profile.bankIfsc || ''}
                onChange={(e) => setProfile({ ...profile, bankIfsc: e.target.value })}
                placeholder="e.g. HDFC0000123"
                className="bg-surface-page border-surface text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Receipt Formatting */}
        <div className="space-y-4 pt-4 border-t border-surface">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Printer className="w-4 h-4 text-brand-primary" /> Thermal Invoice Layout & Policy Text
          </h3>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-text-primary">Default Print Format</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {formats.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setReceiptFormat(fmt.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    receiptFormat === fmt.id
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-xs'
                      : 'border-surface bg-surface-page hover:bg-surface-muted text-text-primary'
                  }`}
                >
                  <p className="font-bold text-xs">{fmt.label}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{fmt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary">Receipt Footer Customer Greeting</Label>
              <Input
                value={profile.receiptFooter || ''}
                onChange={(e) => setProfile({ ...profile, receiptFooter: e.target.value })}
                placeholder="e.g. Thank you for choosing PharmaFlow! Wishing you good health."
                className="bg-surface-page border-surface text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary">Printed Return & Restock Policy</Label>
              <Input
                value={profile.returnPolicy || ''}
                onChange={(e) => setProfile({ ...profile, returnPolicy: e.target.value })}
                placeholder="e.g. Medicines once sold cannot be returned without original receipt within 7 days."
                className="bg-surface-page border-surface text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button
            type="button"
            onClick={onSave}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Billing & Receipt Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
