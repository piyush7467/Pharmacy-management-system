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

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/pos', label: 'Point of Sale (POS)', icon: ShoppingCart, highlight: true }
    ]
  },
  {
    title: 'Medicines & Stock',
    items: [
      { to: '/medicines', label: 'Medicines', icon: Pill },
      { to: '/categories', label: 'Categories', icon: Tags },
      { to: '/inventory', label: 'Batch Inventory', icon: Boxes }
    ]
  },
  {
    title: 'Procurement',
    items: [
      { to: '/suppliers', label: 'Suppliers', icon: Truck },
      { to: '/purchases', label: 'Purchases & Receiving', icon: PackageCheck }
    ]
  },
  {
    title: 'Sales & Billing',
    items: [
      { to: '/sales', label: 'Sales Invoices', icon: Receipt },
      { to: '/returns', label: 'Customer Returns', icon: RotateCcw }
    ]
  },
  {
    title: 'Analytics & Audit',
    items: [
      { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
      { to: '/audit', label: 'System Audit Trail', icon: ShieldAlert, adminOnly: true }
    ]
  },
  {
    title: 'Administration',
    items: [
      { to: '/staff', label: 'Staff Management', icon: Users, adminOnly: true },
      { to: '/settings', label: 'Settings & Shop', icon: Settings }
    ]
  }
];

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const dispatch = useDispatch();
  const collapsed = useSelector((state) => state.preferences.sidebarCollapsed);
  const user = useSelector((state) => state.auth?.user);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-surface bg-surface-card transition-all duration-300 md:static',
          collapsed ? 'w-20' : 'w-68',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-surface">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-xs">
              <Cross className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-[17px] tracking-tight text-text-primary">PharmaFlow</span>
                <span className="text-[12px] font-medium text-text-muted">Pharmacy Business Operations</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-surface text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Grouped Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (item.adminOnly && user?.role !== 'ADMIN') return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 pt-1 pb-1 text-[11px] font-semibold tracking-wider text-text-muted uppercase select-none">
                    {group.title}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[14.5px] font-medium transition-colors group relative',
                          isActive
                            ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                            : 'text-text-muted hover:text-text-primary hover:bg-surface-muted',
                          item.highlight && !isActive && 'text-text-primary font-semibold'
                        )
                      }
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 truncate">
                          <span className="truncate">{item.label}</span>
                          {item.highlight && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-brand-primary text-white">
                              POS
                            </span>
                          )}
                        </div>
                      )}
                      {collapsed && (
                        <div className="absolute left-full ml-3 hidden rounded-md bg-zinc-900 dark:bg-zinc-800 px-3 py-1.5 text-[13px] font-medium text-white shadow-xl group-hover:flex items-center gap-2 z-50 whitespace-nowrap">
                          {item.label}
                          {item.highlight && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-brand-primary text-white">
                              POS
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Operational Status Footer */}
        <div className="p-3 border-t border-surface">
          {!collapsed ? (
            <div className="rounded-lg bg-surface-muted/60 p-2.5 text-xs text-text-muted flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary text-[13px]">System Online</span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <span className="text-[12px]">PostgreSQL • FEFO Enabled</span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="h-3 w-3 rounded-full bg-emerald-500" title="System Online: FEFO Active"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
