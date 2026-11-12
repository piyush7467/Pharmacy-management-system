import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  ShoppingCart,
  ShieldCheck,
  LogOut,
  Bell,
  ChevronDown,
  Store,
  User,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';
import { Button } from '../ui/button.jsx';
import { NotificationsDropdown } from './NotificationsDropdown.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { clearCredentials } from '../../features/auth/authSlice.js';
import { setTheme } from '../../features/preferences/preferencesSlice.js';

export function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const activeTheme = useSelector((state) => state.preferences?.theme || 'system');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    : 'RX';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface bg-surface-card px-4 md:px-6 shrink-0">
      {/* Left: Brand Logo + Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-xs">
            <span className="text-lg font-black leading-none">+</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[16.5px] tracking-tight text-text-primary leading-tight group-hover:text-brand-primary transition-colors">
              PharmaFlow
            </span>
            <span className="text-[11px] font-medium text-text-muted leading-tight">
              Pharmacy Management
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: flex spacer */}
      <div className="flex-1" />

      {/* Right: Quick Tools, Notifications, Branch & User Profile */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Barcode scanner action — removed */}

        {/* Notifications Dropdown & Real-time Alerts */}
        <NotificationsDropdown />

        {/* Branch Selector Pill */}
        <Link
          to="/settings"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface bg-surface-page text-[13.5px] font-medium text-text-primary cursor-pointer hover:bg-surface-muted transition-colors"
          title="Manage Pharmacy Settings"
        >
          <Store className="w-4 h-4 text-brand-primary" />
          <span>Main Shop</span>
        </Link>

        <div className="h-5 w-px bg-surface hidden sm:block" />

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-surface-muted transition-colors text-left cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-white font-bold text-xs shadow-xs">
              {initials}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[13.5px] font-semibold text-text-primary leading-tight">
                {user?.fullName || 'Authorized Staff'}
              </span>
              <span className="text-[11px] text-text-muted leading-tight">
                {user?.role === 'ADMIN' ? 'Owner / Manager' : user?.role || 'Staff'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden md:block" />
          </button>

          {/* User Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-surface bg-surface-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-surface">
                <p className="text-[13.5px] font-semibold text-text-primary truncate">
                  {user?.fullName || 'Authorized Staff'}
                </p>
                <p className="text-[11.5px] text-text-muted truncate">
                  {user?.email || 'Active Session'}
                </p>
              </div>

              {/* Navigation Links */}
              <div className="py-1 px-1 border-b border-surface space-y-0.5">
                <Link
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4 text-brand-primary" />
                  Pharmacy Settings
                </Link>
                <Link
                  to="/account"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-brand-primary" />
                  Account &amp; Security
                </Link>
              </div>

              {/* Theme Options */}
              <div className="py-1.5 px-2">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block px-2 pb-1">
                  Theme
                </span>
                <div className="grid grid-cols-3 gap-1 bg-surface-page p-1 rounded-lg border border-surface">
                  <button
                    onClick={() => dispatch(setTheme('light'))}
                    className={`flex items-center justify-center py-1 rounded text-xs transition-colors ${
                      activeTheme === 'light' ? 'bg-surface-card font-semibold text-brand-primary shadow-xs' : 'text-text-muted'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 mr-1" /> Light
                  </button>
                  <button
                    onClick={() => dispatch(setTheme('dark'))}
                    className={`flex items-center justify-center py-1 rounded text-xs transition-colors ${
                      activeTheme === 'dark' ? 'bg-surface-card font-semibold text-brand-primary shadow-xs' : 'text-text-muted'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 mr-1" /> Dark
                  </button>
                  <button
                    onClick={() => dispatch(setTheme('system'))}
                    className={`flex items-center justify-center py-1 rounded text-xs transition-colors ${
                      activeTheme === 'system' ? 'bg-surface-card font-semibold text-brand-primary shadow-xs' : 'text-text-muted'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 mr-1" /> Auto
                  </button>
                </div>
              </div>

              <div className="pt-1 border-t border-surface">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}