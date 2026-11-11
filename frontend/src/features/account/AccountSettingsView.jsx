import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { User, Lock, Shield, Eye, EyeOff, Save, KeyRound, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../services/api/apiClient.js';
import { setCredentials } from '../auth/authSlice.js';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';

export function AccountSettingsView() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth?.user);

  // Profile fields state
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [savingName, setSavingName] = useState(false);
  const nameDirty = fullName.trim() !== (currentUser?.fullName || '').trim();

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const passwordDirty = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error('Validation error', { description: 'Full name must be at least 2 characters.' });
      return;
    }

    try {
      setSavingName(true);
      const res = await apiClient.patch('/auth/profile', { fullName: fullName.trim() });
      if (res.data?.user) {
        dispatch(setCredentials({ user: { ...currentUser, ...res.data.user } }));
      }
      toast.success('Account profile updated', {
        description: 'Your display name has been updated across system audit logs.'
      });
    } catch (err) {
      toast.error('Update failed', {
        description: err.response?.data?.error?.message || err.message || 'Could not update profile.'
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Validation error', { description: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Validation error', { description: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Validation error', { description: 'New password and confirmation do not match.' });
      return;
    }

    try {
      setSavingPassword(true);
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully', {
        description: 'Your account is secured with the new password.'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Password change failed', {
        description: err.response?.data?.error?.message || err.message || 'Could not update password.'
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-text-primary">
            Account & Security
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your personal staff credentials, authorization role, and session password.
          </p>
        </div>

        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto rounded-full"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Staff Session</span>
        </Badge>
      </div>

      {/* 2. Personal Credentials Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg sm:text-[20px] font-bold text-text-primary">
            Personal Information
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Your name is attributed to POS invoices, stock movements, and compliance audit trails.
          </p>
        </div>

        <form onSubmit={handleUpdateName} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-text-primary block">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. System Administrator"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Address (Read-only) */}
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-text-primary block">
                Registered Work Email
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-page text-[15px] sm:text-[16px] text-text-muted cursor-not-allowed"
              />
              <p className="text-[12px] text-text-muted">Email is managed by your system administrator.</p>
            </div>

            {/* Role & Access Tier */}
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-text-primary block">
                System Role & Permissions
              </label>
              <div className="h-11 px-3.5 rounded-xl border border-surface bg-surface-page flex items-center justify-between">
                <span className="text-[15px] font-bold text-text-primary">
                  {currentUser?.role === 'ADMIN'
                    ? 'Owner / Manager (Administrator)'
                    : currentUser?.role === 'PHARMACIST'
                    ? 'Registered Pharmacist'
                    : 'Cashier / Retail Staff'}
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
                  {currentUser?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={!nameDirty || savingName}
              onClick={() => setFullName(currentUser?.fullName || '')}
              className="h-10 px-4 text-xs font-semibold rounded-xl border-surface"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!nameDirty || savingName}
              className="h-10 px-5 text-xs font-bold rounded-xl bg-[#166534] hover:bg-[#14532D] text-white shadow-sm gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingName ? 'Saving...' : 'Save Profile'}</span>
            </Button>
          </div>
        </form>
      </div>

      <div className="border-t border-surface my-8" />

      {/* 3. Password & Security Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg sm:text-[20px] font-bold text-text-primary">
            Password & Security
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Ensure your account uses a strong, unique password to safeguard pharmacy prescription records.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-text-primary block">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 text-text-muted hover:text-text-primary p-1"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-text-primary block">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 text-text-muted hover:text-text-primary p-1"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-text-primary block">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-11 px-3.5 rounded-xl border border-surface bg-surface-card text-[15px] sm:text-[16px] text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={!passwordDirty || savingPassword}
              onClick={() => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="h-10 px-4 text-xs font-semibold rounded-xl border-surface"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!passwordDirty || savingPassword}
              className="h-10 px-5 text-xs font-bold rounded-xl bg-[#166534] hover:bg-[#14532D] text-white shadow-sm gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
