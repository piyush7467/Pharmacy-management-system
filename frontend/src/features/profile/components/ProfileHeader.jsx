import React from 'react';
import { Store, ShieldCheck, MapPin, Clock, CreditCard, User, Building2 } from 'lucide-react';

export function ProfileHeader({ activeTab, setActiveTab, profile, currentUser }) {
  const tabs = [
    { id: 'overview', label: 'Dispensary Identity', icon: Building2 },
    { id: 'regulatory', label: 'Licensing & Compliance', icon: ShieldCheck },
    { id: 'contact', label: 'Contact & Hours', icon: MapPin },
    { id: 'billing', label: 'POS & Settlement', icon: CreditCard },
    { id: 'account', label: 'My Account & Security', icon: User }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c5236] via-[#246845] to-[#123824] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Store className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  {profile.category || 'Retail Community Pharmacy'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/90">
                  License: {profile.licenseNumber || 'Active'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {profile.pharmacyName || 'Dispensary Profile'}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
                {profile.tagline || 'Manage your pharmacy registration details and licensing information below.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 text-xs text-emerald-100/90 bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
            <span className="font-semibold text-white">Logged in as: {currentUser?.fullName || 'Staff Member'}</span>
            <span className="text-[11px] text-emerald-200">Role: <strong className="uppercase">{currentUser?.role || 'Staff'}</strong></span>
            <span className="text-[11px] text-emerald-300/80">Dispensary: Main Store</span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-surface">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20'
                  : 'bg-surface-card border border-surface text-text-secondary hover:text-text-primary hover:bg-surface-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
