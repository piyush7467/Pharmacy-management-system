import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { setShopProfile, setReceiptFormat } from '../preferences/preferencesSlice.js';
import { ProfileHeader } from './components/ProfileHeader.jsx';
import { PharmacyDetailsCard } from './components/PharmacyDetailsCard.jsx';
import { RegulatoryLicenseCard } from './components/RegulatoryLicenseCard.jsx';
import { ContactLocationCard } from './components/ContactLocationCard.jsx';
import { BillingReceiptCard } from './components/BillingReceiptCard.jsx';
import { UserAccountCard } from './components/UserAccountCard.jsx';

export function PharmacyProfileView() {
  const dispatch = useDispatch();
  const savedProfile = useSelector((state) => state.preferences?.shopProfile);
  const savedFormat = useSelector((state) => state.preferences?.receiptFormat || '80mm');
  const currentUser = useSelector((state) => state.auth?.user);

  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState({ ...savedProfile });
  const [receiptFormat, setLocalReceiptFormat] = useState(savedFormat);

  const handleSave = () => {
    dispatch(setShopProfile(profile));
    dispatch(setReceiptFormat(receiptFormat));
    toast.success('Dispensary profile & system configuration updated', {
      description: 'Changes have been synchronized with your thermal invoice and reporting templates.'
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner and Navigation Tabs */}
      <ProfileHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        currentUser={currentUser}
      />

      {/* Main Tabbed Content Area */}
      <div className="transition-all duration-200">
        {activeTab === 'overview' && (
          <PharmacyDetailsCard
            profile={profile}
            setProfile={setProfile}
            onSave={handleSave}
          />
        )}

        {activeTab === 'regulatory' && (
          <RegulatoryLicenseCard
            profile={profile}
            setProfile={setProfile}
            onSave={handleSave}
          />
        )}

        {activeTab === 'contact' && (
          <ContactLocationCard
            profile={profile}
            setProfile={setProfile}
            onSave={handleSave}
          />
        )}

        {activeTab === 'billing' && (
          <BillingReceiptCard
            profile={profile}
            setProfile={setProfile}
            receiptFormat={receiptFormat}
            setReceiptFormat={setLocalReceiptFormat}
            onSave={handleSave}
          />
        )}

        {activeTab === 'account' && (
          <UserAccountCard currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}
