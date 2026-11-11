import React from 'react';
import { PharmaFlowLogoIcon } from './PharmaFlowLogoIcon.jsx';

/**
 * GlobalLoadingScreen
 * Enterprise SaaS session verification and initial workspace loading screen.
 *
 * Implements clean, minimal styling with high legibility in both light and dark modes:
 * - Simple off-white background (#F8FAFC) in light mode, subtle dark slate/emerald (#121815) in dark mode.
 * - Distinctive PharmaFlow brand squircle emblem.
 * - Smooth, compact forest-green spinner.
 * - High-legibility typography and balanced enterprise vertical rhythm.
 * - Error state recovery if session check fails or times out.
 */
export function GlobalLoadingScreen({
  title = 'Verifying your session',
  subtitle = 'Please wait while we prepare your workspace.',
  error = null,
  onRetry = null,
  onGoToLogin = null
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC] dark:bg-[#121815] transition-colors duration-200 select-none"
    >
      <div className="flex flex-col items-center text-center max-w-sm sm:max-w-md w-full animate-in fade-in duration-300">
        {/* 1. App Emblem */}
        <PharmaFlowLogoIcon className="w-18 h-18 sm:w-20 sm:h-20" iconSize="w-10 h-10 sm:w-11 sm:h-11" />

        {/* 2. Brand Name & Subtitle */}
        <div className="mt-4 sm:mt-5">
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#166534] dark:text-emerald-400 font-sans leading-none">
            PharmaFlow
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide mt-1.5">
            Pharmacy Management System
          </p>
        </div>

        {/* 3. Spinner or Error State */}
        {error ? (
          <div className="mt-8 space-y-4 w-full">
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs sm:text-sm">
              <p className="font-semibold">{error}</p>
              <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">
                Your session could not be verified. You may need to sign in again.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#166534] hover:bg-[#14532D] text-white transition-colors shadow-sm"
                >
                  Retry Connection
                </button>
              )}
              {onGoToLogin && (
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 sm:mt-9 flex flex-col items-center">
            {/* Compact, smooth forest-green loading spinner */}
            <div
              className="h-9 w-9 rounded-full border-[2.5px] border-emerald-600/20 dark:border-emerald-400/20 border-t-[#166534] dark:border-t-emerald-400 animate-spin"
              aria-hidden="true"
            />

            {/* Status Heading */}
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight mt-5">
              {title}
            </h2>

            {/* Supporting Message */}
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs sm:max-w-sm">
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
