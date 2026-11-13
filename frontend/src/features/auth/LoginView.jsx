import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { setCredentials } from './authSlice.js';
import bgPharmacy from '../../assets/bgPharmacy.png';
import logoImg from '../../assets/logo.png';

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

  // Pre-warm backend when visitor lands on login page (wakes Render if cold)
  React.useEffect(() => {
    try {
      apiClient.get('/health').catch(() => {});
    } catch {}
  }, []);

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

  // Instant Guest / Demo Login Handler
  const handleGuestLogin = async () => {
    setErrorMsg('');
    const demoEmail = 'piyushshakya112@gmail.com';
    const demoPassword = 'Admin@uhdf*#ji#768gh';
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      setLoading(true);
      const res = await apiClient.post('/auth/login', {
        email: demoEmail,
        password: demoPassword
      });
      const { user, accessToken } = res.data;

      dispatch(setCredentials({ user, accessToken }));
      toast.success('Signed in as Guest Admin', {
        description: `Welcome to PharmaFlow live demo, ${user.fullName || 'Administrator'}!`
      });

      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.message ||
        err?.error?.message ||
        (typeof err === 'string' ? err : 'Unable to log in as guest. Please try again.');

      setErrorMsg(msg);
      toast.error('Guest Sign In Failed', { description: msg });
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
    <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-end overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Background Pharmacy Illustration */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center lg:bg-left opacity-95 dark:opacity-40 transition-opacity duration-300"
        style={{ backgroundImage: `url(${bgPharmacy})` }}
      >
        {/* Soft overlay gradient to ensure high readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-white/70 dark:to-slate-950/90" />
      </div>

      {/* Top Controls: Theme Switcher */}
      <div className="absolute top-5 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Floating Authentication Card */}
      <div className="relative z-10 w-full max-w-[460px] mx-4 lg:mr-12 xl:mr-16 my-8">
        <div className="w-full rounded-2xl bg-white dark:bg-slate-900 p-8 md:p-9 shadow-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
          {/* Brand Header with Official Circular Logo */}
          <div className="flex items-center gap-3.5 mb-6">
            <img
              src={logoImg}
              alt="PharmaFlow Logo"
              className="h-12 w-12 shrink-0 rounded-full object-cover shadow-xs border border-emerald-600/20"
            />
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans leading-none">
                PharmaFlow
              </div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide mt-1">
                Pharmacy Management System
              </div>
            </div>
          </div>

          {mode === 'login' ? (
            /* ----------------- LOGIN FORM ----------------- */
            <>
              {/* Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Welcome Back
                </h1>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                  Please sign in to your account and manage your pharmacy.
                </p>
              </div>

              {/* In-Card Error Banner */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all shadow-2xs font-medium"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-11 pl-10 pr-11 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all shadow-2xs font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-1 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 select-none font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700 cursor-pointer accent-emerald-700"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotSubmitted(false);
                    }}
                    className="font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

              {/* Divider: Or Quick Guest Access */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400 font-medium">
                    Or evaluate with one click
                  </span>
                </div>
              </div>

              {/* Instant Guest / Demo Login Button */}
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full h-11 rounded-xl border-2 border-emerald-700/30 bg-emerald-50/80 hover:bg-emerald-100/90 dark:bg-emerald-950/40 dark:border-emerald-600/40 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>Login as Guest (1-Click Demo)</span>
              </button>

              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
                Instant access with full Administrator privileges. No sign-up required.
              </p>
            </>
          ) : (
            /* ----------------- FORGOT PASSWORD FORM ----------------- */
            <>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline mb-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Reset Password
                </h1>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                  Enter your registered staff email and we will send reset instructions.
                </p>
              </div>

              {/* In-Card Error Banner for Forgot Password */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {forgotSubmitted ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-4 text-xs text-slate-900 dark:text-slate-100 leading-relaxed border border-slate-200 dark:border-slate-700 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <p className="font-bold text-sm">Reset Link Dispatched</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      If an account matches <span className="font-semibold text-slate-900 dark:text-white">{email}</span>, a secure reset link with a 1-hour expiration has been sent.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all shadow-2xs font-medium"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

          {/* Privacy & Legal Disclaimer Link */}
          <div className="mt-5 text-center">
            <Link
              to="/privacy"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline transition-colors"
            >
              Privacy Policy &bull; Terms of Service &bull; Legal Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
