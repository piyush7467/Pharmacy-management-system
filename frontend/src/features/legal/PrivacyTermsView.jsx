import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ExternalLink, Printer } from 'lucide-react';
import { LegalHeader } from './components/LegalHeader.jsx';
import { PrivacyPolicyCard } from './components/PrivacyPolicyCard.jsx';
import { TermsOfServiceCard } from './components/TermsOfServiceCard.jsx';
import { RegulatoryComplianceCard } from './components/RegulatoryComplianceCard.jsx';
import { SecurityArchitectureCard } from './components/SecurityArchitectureCard.jsx';

export function PrivacyTermsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'privacy';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['privacy', 'terms', 'regulatory', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header with Nav Pills */}
      <LegalHeader activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Action Bar */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>Dispensary operational policies and statutory compliance documentation</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Copy
          </button>
          <a
            href="http://localhost:5000/api/v1/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-brand-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Swagger 3.0 API Docs
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="transition-all duration-200">
        {activeTab === 'privacy' && <PrivacyPolicyCard />}
        {activeTab === 'terms' && <TermsOfServiceCard />}
        {activeTab === 'regulatory' && <RegulatoryComplianceCard />}
        {activeTab === 'security' && <SecurityArchitectureCard />}
      </div>
    </div>
  );
}
