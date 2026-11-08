import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  Cross,
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Boxes,
  BarChart3,
  Loader2,
  Pill,
  FileText,
  Heart,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { setCredentials } from './authSlice.js';
import bgPharmacy from '../../assets/bgPharmacy.png';

export function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Mode: 'login' | 'forgot'
  const [mode, setMode] = useState('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      const msg = 'Please enter both your email address and password.';
      setErrorMsg(msg);
      toast.error('Missing credentials', { description: msg });
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = res.data;

      dispatch(setCredentials({ user, accessToken }));
      toast.success('Signed in successfully', {
        description: `Welcome back, ${user.fullName} (${user.role})`
      });

      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.message ||
        err?.error?.message ||
        (typeof err === 'string' ? err : 'Invalid email or password. Please verify your credentials.');

      setErrorMsg(msg);
      toast.error('Sign In Failed', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      const msg = 'Please enter your registered staff email address.';
      setErrorMsg(msg);
      toast.error('Email required', { description: msg });
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/auth/forgot-password', { email });
      setForgotSubmitted(true);
      toast.success('Reset Instructions Dispatched', {
        description: res.data?.message || 'Check your inbox for password reset instructions.'
      });
    } catch (err) {
      const msg = err?.message || 'Unable to process reset request. Please try again.';
      setErrorMsg(msg);
      toast.error('Request failed', { description: msg });
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
        {/* Soft overlay gradient to ensure high readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-white/70 dark:to-[#171C19]/90" />
      </div>

      {/* Top Controls: Theme Switcher */}
      <div className="absolute top-5 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Center/Left Floating Operational Pillars (Visible on Desktop) */}
      <div className="hidden 2xl:flex flex-col gap-3.5 absolute right-[510px] top-1/2 -translate-y-1/2 z-10">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#222A25]/90 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm text-xs font-semibold text-[#1c5236] dark:text-emerald-400">
          <div className="p-1.5 rounded-lg bg-[#1c5236]/10 dark:bg-emerald-500/10">
            <Pill className="w-4 h-4 text-[#1c5236] dark:text-emerald-400" />
          </div>
          <span>Medicines</span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#222A25]/90 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm text-xs font-semibold text-[#1c5236] dark:text-emerald-400">
          <div className="p-1.5 rounded-lg bg-[#1c5236]/10 dark:bg-emerald-500/10">
            <FileText className="w-4 h-4 text-[#1c5236] dark:text-emerald-400" />
          </div>
          <span>Prescriptions</span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#222A25]/90 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm text-xs font-semibold text-[#1c5236] dark:text-emerald-400">
          <div className="p-1.5 rounded-lg bg-[#1c5236]/10 dark:bg-emerald-500/10">
            <Heart className="w-4 h-4 text-[#1c5236] dark:text-emerald-400" />
          </div>
          <span>Health Care</span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#222A25]/90 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm text-xs font-semibold text-[#1c5236] dark:text-emerald-400">
          <div className="p-1.5 rounded-lg bg-[#1c5236]/10 dark:bg-emerald-500/10">
            <Leaf className="w-4 h-4 text-[#1c5236] dark:text-emerald-400" />
          </div>
          <span>Wellness</span>
        </div>
      </div>

      {/* Floating Authentication Card (Matches Reference Image) */}
      <div className="relative z-10 w-full max-w-[460px] mx-4 lg:mr-12 xl:mr-16 my-8">
        <div className="w-full rounded-[28px] bg-white dark:bg-[#222A25] p-8 md:p-10 shadow-2xl border border-white/70 dark:border-white/10 backdrop-blur-xl">
          {/* Brand Header with Cross & Leaf Logo */}
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

          {mode === 'login' ? (
            /* ----------------- LOGIN FORM ----------------- */
            <>
              {/* Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-[#1c5236] dark:text-white">
                  Welcome Back
                </h1>
                <p className="text-xs text-text-muted mt-1.5">
                  Please sign in to your account and manage your pharmacy.
                </p>
              </div>

              {/* In-Card Error Banner */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-surface bg-surface-page dark:bg-[#1a211c] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#1c5236] dark:focus:ring-emerald-500 transition-all shadow-xs"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
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

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-1 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-text-primary select-none font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-surface text-[#1c5236] focus:ring-[#1c5236] focus:ring-offset-0 cursor-pointer accent-[#1c5236]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotSubmitted(false);
                    }}
                    className="font-semibold text-[#1c5236] dark:text-emerald-400 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#1c5236] hover:bg-[#153e29] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ----------------- FORGOT PASSWORD FORM ----------------- */
            <>
              <div className="mb-7">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c5236] dark:text-emerald-400 hover:underline mb-2 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-[#1c5236] dark:text-white">
                  Reset Password
                </h1>
                <p className="text-xs text-text-muted mt-1.5">
                  Enter your registered staff email and we will send instructions via Brevo.
                </p>
              </div>

              {/* In-Card Error Banner for Forgot Password */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {forgotSubmitted ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-surface-page dark:bg-[#1a211c] p-4 text-xs text-text-primary leading-relaxed border border-surface text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <p className="font-semibold">Reset Link Sent</p>
                    <p className="text-text-muted">
                      If an account matches <span className="font-semibold text-text-primary">{email}</span>, a secure reset link with a 1-hour expiration has been sent.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full h-11 rounded-xl bg-[#1c5236] hover:bg-[#153e29] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-surface bg-surface-page dark:bg-[#1a211c] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#1c5236] dark:focus:ring-emerald-500 transition-all shadow-xs"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-[#1c5236] hover:bg-[#153e29] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending Link...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Bottom 3-Column Feature Badges (Matches Reference Image) */}
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
