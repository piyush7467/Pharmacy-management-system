import React from 'react';
import { ShieldCheck, FileText, Scale, Lock, BookOpen } from 'lucide-react';

export function LegalHeader({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'regulatory', label: 'Regulatory Compliance', icon: Scale },
    { id: 'security', label: 'Security & Audit', icon: ShieldCheck }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surface">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Official Dispensary Governance
            </span>
            <span className="text-xs text-text-muted">Standard Operational Terms</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Privacy, Terms &amp; Regulatory Policies
          </h1>
          <p className="text-sm text-text-muted mt-1 max-w-2xl">
            Statutory drug dispensing standards, data privacy commitments, security controls, and operational terms governing the pharmacy management platform.
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
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
