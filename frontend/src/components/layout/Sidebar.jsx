import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Tags,
  Truck,
  PackageCheck,
  Boxes,
  Receipt,
  RotateCcw,
  BarChart3,
  ShieldAlert,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Cross
} from 'lucide-react';
import { toggleSidebar } from '../../features/preferences/preferencesSlice.js';
import { cn } from '../../lib/utils.js';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pos', label: 'Point of Sale (POS)', icon: ShoppingCart, highlight: true },
  { to: '/medicines', label: 'Medicines', icon: Pill },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/purchases', label: 'Purchases & Receiving', icon: PackageCheck },
  { to: '/inventory', label: 'Batch Inventory', icon: Boxes },
  { to: '/sales', label: 'Sales & Invoices', icon: Receipt },
  { to: '/returns', label: 'Customer Returns', icon: RotateCcw },
  { to: '/reports', label: 'Reports & Audit', icon: BarChart3 },
  { to: '/staff', label: 'Staff Management', icon: Users, adminOnly: true },
  { to: '/audit', label: 'System Audit Trail', icon: ShieldAlert },
  { to: '/settings', label: 'Settings & Legal', icon: Settings }
];

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const dispatch = useDispatch();
  const collapsed = useSelector((state) => state.preferences.sidebarCollapsed);
  const user = useSelector((state) => state.auth?.user);

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && user?.role !== 'ADMIN') return false;
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-surface bg-surface-card transition-all duration-300 md:static',
          collapsed ? 'w-18' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-surface">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-xs">
              <Cross className="w-5 h-5 rotate-45" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-base tracking-tight text-text-primary">PharmaPulse</span>
                <span className="text-[11px] font-medium text-text-muted">Operations & Inventory</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-surface text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative',
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-muted',
                    item.highlight && !isActive && 'text-text-primary font-medium'
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-2 hidden rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-md group-hover:block z-50 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Operational System Badge */}
        <div className="p-3 border-t border-surface">
          {!collapsed ? (
            <div className="rounded-lg bg-surface-muted p-2.5 text-xs text-text-muted flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary">System Online</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <span className="text-[11px]">PostgreSQL (Neon) • FEFO Active</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="System Online"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
