import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ShieldCheck, LogOut } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';
import { Button } from '../ui/button.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { clearCredentials } from '../../features/auth/authSlice.js';

export function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network failure on logout
    } finally {
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

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
            placeholder="Search medicines, SKU, or invoices... (Press /)"
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-surface bg-surface-page text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Right: Actions, Theme, and Profile */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <button
          className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
          aria-label="System notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500"></span>
        </button>

        <div className="h-5 w-px bg-surface" />

        {/* Current Active Staff Badge & Logout */}
        {user ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-semibold text-xs border border-brand-primary/20">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-text-primary leading-tight truncate max-w-[120px]">
                {user.fullName}
              </span>
              <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> {user.role}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-muted hover:text-red-600 ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={() => navigate('/login')} size="sm" variant="default">
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
