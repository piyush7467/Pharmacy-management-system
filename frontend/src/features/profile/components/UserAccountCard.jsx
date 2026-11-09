import React, { useState } from 'react';
import { User, Lock, KeyRound, Shield, CheckCircle, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Label } from '../../../components/ui/label.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { apiClient } from '../../../services/api/apiClient.js';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../auth/authSlice.js';

export function UserAccountCard({ currentUser }) {
  const dispatch = useDispatch();

  // Name update state
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [savingName, setSavingName] = useState(false);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
      toast.success('Account profile updated successfully');
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
    <div className="space-y-6">
      {/* Account Details Card */}
      <Card className="bg-surface-card border-surface">
        <CardHeader className="p-5 sm:p-6 border-b border-surface">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
                <User className="w-5 h-5 text-brand-primary" />
                Staff Member Credentials & Session Profile
              </CardTitle>
              <CardDescription className="text-xs text-text-muted mt-1">
                Personal staff credentials, role-based access level, and cryptographic session protection.
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              Role: {currentUser?.role || 'Staff'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-text-primary">Registered Staff Email Address</Label>
                <Input
                  value={currentUser?.email || ''}
                  disabled
                  className="bg-surface-muted/50 border-surface text-sm cursor-not-allowed opacity-80 font-mono"
                />
                <p className="text-[11px] text-text-muted">Primary identifier. Cannot be altered without system administrator authority.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-text-primary">Staff Full Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Piyush Shakya"
                    className="bg-surface-page border-surface text-sm"
                  />
                  <Button
                    type="submit"
                    disabled={savingName}
                    className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold shrink-0 cursor-pointer disabled:opacity-60"
                  >
                    {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Password Change Sub-section */}
          <div className="pt-6 border-t border-surface space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-primary" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Change Account Password
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-text-primary">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="bg-surface-page border-surface text-sm pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-text-primary">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="bg-surface-page border-surface text-sm pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-text-primary">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="bg-surface-page border-surface text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
