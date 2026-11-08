import React from 'react';
import { Menu, Search, Bell, ShieldCheck, User } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';

export function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface bg-surface-card px-4 md:px-6">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="search"
            placeholder="Quick search medicines, batches, SKU (Press /)"
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-surface bg-surface-page text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Right: Actions, Theme, and Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Selector */}
        <ThemeToggle />

        {/* Alerts Notification Button */}
        <button
          className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
          aria-label="System notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500"></span>
        </button>

        <div className="h-5 w-px bg-surface" />

        {/* Current Active Staff Badge */}
        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-semibold text-xs border border-brand-primary/20">
            AP
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-text-primary leading-tight">Aarav Patel</span>
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> ADMIN
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
