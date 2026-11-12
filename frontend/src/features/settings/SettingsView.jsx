import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  Store,
  Building2,
  ShieldCheck,
  Clock,
  CreditCard,
  CheckCircle2,
  Save,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Landmark,
  Printer,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { setShopProfile, setReceiptFormat } from '../preferences/preferencesSlice.js';
import { Button } from '../../components/ui/button.jsx';

const DEFAULT_PROFILE = {
  pharmacyName: 'PharmaFlow Central Pharmacy',
  legalName: 'PharmaPulse Healthcare Pvt. Ltd.',
  tagline: 'Licensed Retail Dispensary & Clinical Supplies',
  category: 'Retail Community Pharmacy',
  licenseNumber: 'DL-2026-98442-20B/21B',
  pharmacistInCharge: 'Dr. Arvind Sharma, M.Pharm',
  pharmacistCouncilNo: 'KSPC-Reg-65201',
  licenseExpiry: '2028-12-31',
  taxNumber: '29AABCP1234D1ZK',
  phone: '+91 80 4123 4567',
  emergencyHelpline: '+91 80 4123 9999',
  email: 'dispensary@pharmaflow.demo',
  address: '42 Brigade Road, Commercial District, Bengaluru, Karnataka 560001',
  operatingHours: 'Mon - Sat: 8:00 AM - 10:30 PM | Sun: 9:00 AM - 6:00 PM',
  is24Hours: false,
  upiId: 'pharmapulse.pay@okaxis',
  bankName: 'HDFC Bank - Commercial Branch',
  bankAccountNumber: '50200088991122',
  bankIfsc: 'HDFC0000123',
  receiptFooter: 'Thank you for your visit. Wishing you good health!',
  returnPolicy: 'Medicines once sold can only be returned with original invoice within 7 days. Refrigerated items are non-returnable.'
};

const CATEGORIES = [
  'Retail Community Pharmacy',
  'Hospital Outpatient Dispensary',
  'Clinical Compounding Pharmacy',
  'Specialty Pharmacy & Surgical Supplies',
  'Chain Dispensary Outpost'
];

const PRINT_FORMATS = [
  { id: '80mm', label: '80mm Thermal Roll', desc: 'Standard POS thermal receipt printer' },
  { id: '58mm', label: '58mm Thermal Roll', desc: 'Compact portable bluetooth printer' },
  { id: 'A4', label: 'A4 / A5 Tax Invoice', desc: 'Full-page laser / clinical document' }
];

export function SettingsView() {
  const dispatch = useDispatch();
  const savedProfile = useSelector((state) => state.preferences?.shopProfile) || {};
  const savedFormat = useSelector((state) => state.preferences?.receiptFormat) || '80mm';

  // Active section tab: 'details' | 'licenses' | 'contact' | 'billing'
  const [activeTab, setActiveTab] = useState('details');

  // Merged initial profile with defaults so fields never render blank
  const [profile, setProfile] = useState(() => ({
    ...DEFAULT_PROFILE,
    ...savedProfile
  }));

  const [receiptFormat, setLocalReceiptFormat] = useState(savedFormat);

  // Sync state if saved profile in Redux changes externally
  useEffect(() => {
    setProfile((prev) => ({
      ...DEFAULT_PROFILE,
      ...savedProfile,
      ...prev
    }));
  }, [savedProfile]);

  // Dirty state tracking: enables Save Changes only when values genuinely changed
  const isDirty = (
    JSON.stringify(profile) !== JSON.stringify({ ...DEFAULT_PROFILE, ...savedProfile }) ||
    receiptFormat !== savedFormat
  );

  const handleFieldChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setProfile({
      ...DEFAULT_PROFILE,
      ...savedProfile
    });
    setLocalReceiptFormat(savedFormat);
    toast.info('Changes reverted to saved pharmacy configuration');
  };

  const handleSave = (e) => {
    e?.preventDefault();
    dispatch(setShopProfile(profile));
    dispatch(setReceiptFormat(receiptFormat));
    toast.success('Pharmacy Settings Saved', {
      description: 'Dispensary identity, compliance licenses, and invoice formatting synchronized.'
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header (Linear / Stripe Inspired) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Pharmacy Settings
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your pharmacy information and operations.
          </p>
        </div>
      </div>

      {/* 2. Main Settings Grid: Left Unboxed Nav, Right Unboxed Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Compact, Unboxed Vertical Navigation */}
        <nav className="lg:col-span-3 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] transition-all text-left cursor-pointer ${
              activeTab === 'details'
                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-muted/60 font-medium'
            }`}
          >
            <Store className={`w-4 h-4 shrink-0 ${activeTab === 'details' ? 'text-emerald-700 dark:text-emerald-400' : 'text-text-muted'}`} />
            <span>Pharmacy Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('licenses')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] transition-all text-left cursor-pointer ${
              activeTab === 'licenses'
                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-muted/60 font-medium'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 shrink-0 ${activeTab === 'licenses' ? 'text-emerald-700 dark:text-emerald-400' : 'text-text-muted'}`} />
            <span>Licenses &amp; Compliance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] transition-all text-left cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-muted/60 font-medium'
            }`}
          >
            <Phone className={`w-4 h-4 shrink-0 ${activeTab === 'contact' ? 'text-emerald-700 dark:text-emerald-400' : 'text-text-muted'}`} />
            <span>Contact &amp; Hours</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] transition-all text-left cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-muted/60 font-medium'
            }`}
          >
            <CreditCard className={`w-4 h-4 shrink-0 ${activeTab === 'billing' ? 'text-emerald-700 dark:text-emerald-400' : 'text-text-muted'}`} />
            <span>POS &amp; Billing</span>
          </button>
        </nav>

        {/* Right Column: Unboxed Form Content Area */}
        <div className="lg:col-span-9 space-y-8">
          <form onSubmit={handleSave}>
            {/* ========================================================================= */}
            {/* SECTION 1: PHARMACY DETAILS                                              */}
            {/* ========================================================================= */}
            {activeTab === 'details' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl sm:text-[22px] font-bold text-text-primary tracking-tight">
                    Pharmacy Details
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted mt-1">
                    Basic information used across your pharmacy.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Dispensary Trading Name */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Dispensary Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Store className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={profile.pharmacyName || ''}
                        onChange={(e) => handleFieldChange('pharmacyName', e.target.value)}
                        placeholder="e.g. PharmaFlow Central Pharmacy"
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Registered Legal Name */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Registered Legal Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Building2 className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={profile.legalName || ''}
                        onChange={(e) => handleFieldChange('legalName', e.target.value)}
                        placeholder="e.g. PharmaPulse Healthcare Pvt. Ltd."
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Pharmacy Classification Category */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Pharmacy Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={profile.category || 'Retail Community Pharmacy'}
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer transition-all"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tagline / Subheader */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Tagline / Dispensary Subheader
                    </label>
                    <input
                      type="text"
                      value={profile.tagline || ''}
                      onChange={(e) => handleFieldChange('tagline', e.target.value)}
                      placeholder="e.g. Licensed Retail Dispensary & Clinical Supplies"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 2: LICENSES & COMPLIANCE                                          */}
            {/* ========================================================================= */}
            {activeTab === 'licenses' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl sm:text-[22px] font-bold text-text-primary tracking-tight">
                    Licenses &amp; Compliance
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted mt-1">
                    Official retail drug control licenses, pharmacist oversight, and statutory tax identifiers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Drug License Number */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Retail Drug License Number (Form 20B / 21B) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profile.licenseNumber || ''}
                      onChange={(e) => handleFieldChange('licenseNumber', e.target.value)}
                      placeholder="e.g. DL-2026-98442-20B/21B"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] font-mono text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                      required
                    />
                    <p className="text-[12px] text-text-muted">Issued under Drugs and Cosmetics Rules by State Drug Controller.</p>
                  </div>

                  {/* Drug License Expiry Date */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Drug License Expiration Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={profile.licenseExpiry || ''}
                      onChange={(e) => handleFieldChange('licenseExpiry', e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                      required
                    />
                  </div>

                  {/* Registered Pharmacist-in-Charge */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Registered Pharmacist-in-Charge (PIC) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profile.pharmacistInCharge || ''}
                      onChange={(e) => handleFieldChange('pharmacistInCharge', e.target.value)}
                      placeholder="e.g. Dr. Arvind Sharma, M.Pharm"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                      required
                    />
                    <p className="text-[12px] text-text-muted">Certified supervising professional responsible for dispensation audits.</p>
                  </div>

                  {/* Pharmacy Council Registration Number */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Pharmacy Council Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profile.pharmacistCouncilNo || ''}
                      onChange={(e) => handleFieldChange('pharmacistCouncilNo', e.target.value)}
                      placeholder="e.g. KSPC-Reg-65201"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] font-mono text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                      required
                    />
                  </div>

                  {/* GSTIN / Tax ID */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Commercial Tax Identification Number (GSTIN / VAT ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profile.taxNumber || ''}
                      onChange={(e) => handleFieldChange('taxNumber', e.target.value)}
                      placeholder="e.g. 29AABCP1234D1ZK"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] font-mono text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                      required
                    />
                    <p className="text-[12px] text-text-muted">Itemized on all customer tax invoices and supplier purchase manifests.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 3: CONTACT & HOURS                                                */}
            {/* ========================================================================= */}
            {activeTab === 'contact' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl sm:text-[22px] font-bold text-text-primary tracking-tight">
                    Contact &amp; Hours
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted mt-1">
                    Registered premises address, primary contact lines, emergency hotline, and store hours.
                  </p>
                </div>

                <div className="space-y-6 pt-2">
                  {/* Physical Address */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Registered Physical Premises Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={profile.address || ''}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        placeholder="e.g. 42 Brigade Road, Commercial District, Bengaluru, Karnataka 560001"
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                        required
                      />
                    </div>
                    <p className="text-[12px] text-text-muted">Must correspond with physical address approved on drug distribution license.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Primary Phone */}
                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-text-primary block">
                        Primary Phone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
                        <input
                          type="text"
                          value={profile.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          placeholder="e.g. +91 80 4123 4567"
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Emergency Helpline */}
                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-text-primary block">
                        24/7 Emergency Helpline
                      </label>
                      <div className="relative flex items-center">
                        <AlertTriangle className="absolute left-3.5 h-4 w-4 text-amber-600 pointer-events-none" />
                        <input
                          type="text"
                          value={profile.emergencyHelpline || ''}
                          onChange={(e) => handleFieldChange('emergencyHelpline', e.target.value)}
                          placeholder="e.g. +91 80 4123 9999"
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Official Inquiries Email */}
                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-text-primary block">
                        Official Inquiries Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
                        <input
                          type="email"
                          value={profile.email || ''}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          placeholder="e.g. dispensary@pharmaflow.demo"
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Operating Hours */}
                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-text-primary block">
                        Operating Schedule
                      </label>
                      <div className="relative flex items-center">
                        <Clock className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
                        <input
                          type="text"
                          value={profile.operatingHours || ''}
                          onChange={(e) => handleFieldChange('operatingHours', e.target.value)}
                          placeholder="e.g. Mon - Sat: 8:00 AM - 10:30 PM | Sun: 9:00 AM - 6:00 PM"
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* 24 Hours Toggle */}
                    <div className="space-y-2 flex flex-col justify-end">
                      <label className="flex items-center gap-3 h-11 px-4 rounded-xl border border-surface bg-surface-card cursor-pointer hover:bg-surface-muted/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={profile.is24Hours || false}
                          onChange={(e) => handleFieldChange('is24Hours', e.target.checked)}
                          className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
                        />
                        <span className="text-[14px] font-semibold text-text-primary">
                          24/7 Emergency Dispensary Counter Active
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 4: POS & BILLING                                                  */}
            {/* ========================================================================= */}
            {activeTab === 'billing' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl sm:text-[22px] font-bold text-text-primary tracking-tight">
                    POS &amp; Billing
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted mt-1">
                    Instant settlement UPI handles, settlement bank accounts, and thermal invoice formatting.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* UPI ID */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Dispensary UPI ID (VPA) for Dynamic QR Codes <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <QrCode className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={profile.upiId || ''}
                        onChange={(e) => handleFieldChange('upiId', e.target.value)}
                        placeholder="e.g. pharmapulse.pay@okaxis"
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] font-mono text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                        required
                      />
                    </div>
                    <p className="text-[12px] text-text-muted">Used by POS terminal to generate dynamic UPI QR payment codes.</p>
                  </div>

                  {/* Settlement Bank Name */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Settlement Bank Name
                    </label>
                    <div className="relative flex items-center">
                      <Landmark className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={profile.bankName || ''}
                        onChange={(e) => handleFieldChange('bankName', e.target.value)}
                        placeholder="e.g. HDFC Bank - Commercial Branch"
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Bank Account Number */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={profile.bankAccountNumber || ''}
                      onChange={(e) => handleFieldChange('bankAccountNumber', e.target.value)}
                      placeholder="e.g. 50200088991122"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] font-mono text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      IFSC / Routing Code
                    </label>
                    <input
                      type="text"
                      value={profile.bankIfsc || ''}
                      onChange={(e) => handleFieldChange('bankIfsc', e.target.value)}
                      placeholder="e.g. HDFC0000123"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] font-mono text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                    />
                  </div>

                  {/* Thermal Printer Format Selection */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Default Thermal Receipt Format
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {PRINT_FORMATS.map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setLocalReceiptFormat(fmt.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            receiptFormat === fmt.id
                              ? 'border-emerald-600 bg-emerald-500/10 ring-1 ring-emerald-600'
                              : 'border-surface bg-surface-card hover:bg-surface-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[14px] font-bold text-text-primary">{fmt.label}</span>
                            {receiptFormat === fmt.id && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[12px] text-text-muted mt-1 leading-snug">{fmt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Return Policy / Disclaimer */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[14px] font-semibold text-text-primary block">
                      Invoice Return Policy / Disclaimer
                    </label>
                    <textarea
                      rows={2}
                      value={profile.returnPolicy || ''}
                      onChange={(e) => handleFieldChange('returnPolicy', e.target.value)}
                      placeholder="e.g. Please bring original invoice for returns within 7 days. Refrigerated items are non-returnable."
                      className="w-full p-3 rounded-xl border border-surface bg-surface-card text-[15px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar (Subtle Divider, Right Aligned) */}
            <div className="border-t border-surface pt-6 mt-10 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!isDirty}
                onClick={handleCancel}
                className="h-11 px-6 text-[14px] font-semibold rounded-xl border-surface hover:bg-surface-muted text-text-primary disabled:opacity-40 transition-all cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isDirty}
                className="h-11 px-6 text-[14px] font-bold rounded-xl bg-[#166534] hover:bg-[#14532D] text-white shadow-sm flex items-center gap-2 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Re-export as PharmacyProfileView for complete backward compatibility
export { SettingsView as PharmacyProfileView };
