import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, ShoppingCart, ShieldCheck, LogOut } from 'lucide-react';
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface bg-surface-card/95 backdrop-blur-md px-4 md:px-7">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="search"
            placeholder="Search medicines, SKU, batch, or invoices..."
            className="w-full pl-10 pr-4 py-2 text-[13.5px] rounded-lg border border-surface bg-surface-page text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
          />
        </div>
      </div>

      {/* Right: Quick POS, Theme, and Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Quick POS Button */}
        <Link
          to="/pos"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-primary text-white text-[13.5px] font-semibold hover:opacity-90 shadow-xs transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">New Sale (POS)</span>
        </Link>

        <ThemeToggle />

        <div className="h-5 w-px bg-surface" />

        {/* Current Active Staff Badge & Logout */}
        {user ? (
          <div className="flex items-center gap-3 pl-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm border border-brand-primary/20">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[13.5px] font-semibold text-text-primary leading-tight truncate max-w-[130px]">
                {user.fullName}
              </span>
              <span className="text-[11.5px] text-text-muted flex items-center gap-1 font-medium mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {user.role}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-text-muted hover:text-red-600 hover:bg-red-500/10 ml-1 rounded-lg"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
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
