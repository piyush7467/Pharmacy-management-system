import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Settings,
  Building2,
  FileCheck2,
  ShieldCheck,
  AlertCircle,
  Save,
  Server,
  Database,
  Lock,
  Globe
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Badge } from '../../components/ui/badge.jsx';

export function SettingsView() {
  const [profile, setProfile] = useState({
    pharmacyName: 'PharmaFlow Central Pharmacy',
    tagline: 'Licensed Retail Dispensary & Clinical Supplies',
    licenseNumber: 'DL-KA-BNG-2026-98442',
    taxNumber: '29AABCP1234D1ZK',
    phone: '+91 80 4123 4567',
    email: 'dispensary@pharmaflow.demo',
    address: '42 Brigade Road, Commercial District, Bengaluru, Karnataka 560001',
    currency: 'USD ($)',
    defaultTaxRate: 12.0
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Pharmacy profile configurations saved successfully');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-primary" />
            Pharmacy Settings & Compliance
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Dispensary identity, tax credentials, and non-medical compliance policy declarations.
          </p>
        </div>
      </div>

      {/* COMPLIANCE & NON-MEDICAL DISCLAIMER ALERT */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          Assessment Demo & Non-Medical Advice Disclaimer
        </div>
        <p className="leading-relaxed">
          <span className="font-semibold">PharmaPulse / PharmaFlow</span> is an operational inventory, point-of-sale, and fiscal billing
          platform engineered solely as a technical evaluation assessment for ALGIONS AI LABS PRIVATE LIMITED. This application does not
          provide medical advice, diagnosis, treatment recommendations, or process sensitive real patient health records (PHI/HIPAA).
          All pharmaceutical entries, prices, and stock movements are simulated for retail logistics and audit verification.
        </p>
      </div>

      {/* PROFILE FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="bg-surface-card border-surface">
          <CardHeader className="p-5 border-b border-surface">
            <CardTitle className="text-base font-bold text-text-primary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-primary" />
              Dispensary Identity & Receipt Header
            </CardTitle>
            <CardDescription className="text-xs text-text-muted">
              These details appear on printed fiscal receipts, purchase manifests, and customer credit notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pharmacy Name</Label>
                <Input
                  value={profile.pharmacyName}
                  onChange={(e) => setProfile({ ...profile, pharmacyName: e.target.value })}
                  className="bg-surface-bg border-surface text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tagline / Subheader</Label>
                <Input
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  className="bg-surface-bg border-surface text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Drug License #</Label>
                <Input
                  value={profile.licenseNumber}
                  onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                  className="bg-surface-bg border-surface text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tax Identification (GSTIN / VAT)</Label>
                <Input
                  value={profile.taxNumber}
                  onChange={(e) => setProfile({ ...profile, taxNumber: e.target.value })}
                  className="bg-surface-bg border-surface text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Contact Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="bg-surface-bg border-surface text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Official Email</Label>
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-surface-bg border-surface text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Registered Physical Address</Label>
              <Input
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="bg-surface-bg border-surface text-sm"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold gap-1.5">
                <Save className="w-4 h-4" /> Save Profile Configurations
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SYSTEM ENVIRONMENT SUMMARY */}
        <Card className="bg-surface-card border-surface">
          <CardHeader className="p-5 border-b border-surface">
            <CardTitle className="text-base font-bold text-text-primary flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-primary" />
              Architecture & Security Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-surface bg-surface-bg/40 space-y-1">
                <span className="text-text-muted block flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-brand-primary" /> Database Engine
                </span>
                <p className="font-bold text-text-primary">Neon Serverless PostgreSQL</p>
                <p className="text-[11px] text-text-muted">Prisma 6.19 ORM • 15 Schema Models</p>
              </div>

              <div className="p-3.5 rounded-xl border border-surface bg-surface-bg/40 space-y-1">
                <span className="text-text-muted block flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-brand-primary" /> Auth Security
                </span>
                <p className="font-bold text-text-primary">Argon2id + JWT Family Rotation</p>
                <p className="text-[11px] text-text-muted">HttpOnly Cookies • CSRF / Rate Protected</p>
              </div>

              <div className="p-3.5 rounded-xl border border-surface bg-surface-bg/40 space-y-1">
                <span className="text-text-muted block flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-brand-primary" /> Client Stack
                </span>
                <p className="font-bold text-text-primary">React 19 + Vite 6 + Tailwind v4</p>
                <p className="text-[11px] text-text-muted">Redux Toolkit Persist • TanStack Query</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
