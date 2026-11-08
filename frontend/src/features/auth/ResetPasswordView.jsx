import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Cross,
  Leaf,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Loader2,
  Boxes,
  BarChart3
} from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import bgPharmacy from '../../assets/bgPharmacy.png';

export function ResetPasswordView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid link', { description: 'Missing password reset token in URL.' });
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Weak password', { description: 'Password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mismatch', { description: 'Passwords do not match.' });
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/auth/reset-password', {
        token,
        newPassword
      });

      setSuccess(true);
      toast.success('Password updated!', {
        description: res.data?.message || 'Your password has been reset successfully.'
      });
    } catch (err) {
      toast.error('Reset failed', {
        description: err.message || 'The reset link may have expired or already been used.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-end overflow-hidden bg-[#F7F8F5] dark:bg-[#171C19]">
      {/* Background Pharmacy Illustration */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center lg:bg-left opacity-95 dark:opacity-40 transition-opacity duration-300"
        style={{ backgroundImage: `url(${bgPharmacy})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-white/70 dark:to-[#171C19]/90" />
      </div>

      {/* Top Controls: Theme Switcher */}
      <div className="absolute top-5 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Floating Card */}
      <div className="relative z-10 w-full max-w-[460px] mx-4 lg:mr-12 xl:mr-16 my-8">
        <div className="w-full rounded-[28px] bg-white dark:bg-[#222A25] p-8 md:p-10 shadow-2xl border border-white/70 dark:border-white/10 backdrop-blur-xl">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1c5236] text-white shadow-md">
              <Cross className="w-6 h-6 rotate-45" />
              <Leaf className="w-4 h-4 text-emerald-300 absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-[#1c5236] dark:text-emerald-400 font-sans leading-none">
                PharmaFlow
              </div>
              <div className="text-[11px] font-medium text-text-muted tracking-wide mt-1">
                Pharmacy Management System
              </div>
            </div>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-[#1c5236] dark:text-white">
              Create New Password
            </h1>
            <p className="text-xs text-text-muted mt-1.5">
              Enter and confirm your new secure password below to regain access.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-surface-page dark:bg-[#1a211c] p-5 text-xs text-text-primary leading-relaxed border border-surface text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold">Password Successfully Reset</p>
                <p className="text-text-muted">
                  All active sessions have been invalidated. Please sign in with your new password.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full h-11 rounded-xl bg-[#1c5236] hover:bg-[#153e29] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                Proceed to Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min. 8 characters)"
                  className="w-full h-11 pl-10 pr-11 text-xs rounded-xl border border-surface bg-surface-page dark:bg-[#1a211c] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#1c5236] dark:focus:ring-emerald-500 transition-all shadow-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-surface bg-surface-page dark:bg-[#1a211c] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#1c5236] dark:focus:ring-emerald-500 transition-all shadow-xs"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#1c5236] hover:bg-[#153e29] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    Save New Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* Bottom Feature Badges */}
          <div className="mt-8 pt-6 border-t border-surface/70 grid grid-cols-3 divide-x divide-surface text-center">
            <div className="flex flex-col items-center gap-1.5 px-2">
              <ShieldCheck className="w-4 h-4 text-[#1c5236] dark:text-emerald-400" />
              <span className="text-[10px] font-semibold text-text-primary">Secure Access</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-2">
              <Boxes className="w-4 h-4 text-[#1c5236] dark:text-emerald-400" />
              <span className="text-[10px] font-semibold text-text-primary">Inventory Control</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-2">
              <BarChart3 className="w-4 h-4 text-[#1c5236] dark:text-emerald-400" />
              <span className="text-[10px] font-semibold text-text-primary">Sales &amp; Billing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
