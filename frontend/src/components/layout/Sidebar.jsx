import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Cross,
  Wallet,
  UserCheck,
  Scale
} from 'lucide-react';
import { toggleSidebar } from '../../features/preferences/preferencesSlice.js';
import { cn } from '../../lib/utils.js';
import logoImg from '../../assets/logo.png';

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/pos', label: 'POS', icon: ShoppingCart }
    ]
  },
  {
    title: 'Sales & Customers',
    items: [
      { to: '/sales', label: 'Sales', icon: Receipt },
      { to: '/returns', label: 'Returns', icon: RotateCcw },
      { to: '/customers', label: 'Customers', icon: UserCheck }
    ]
  },
  {
    title: 'Medicines & Inventory',
    items: [
      { to: '/medicines', label: 'Medicines', icon: Pill },
      { to: '/inventory', label: 'Inventory', icon: Boxes },
      { to: '/categories', label: 'Categories', icon: Tags }
    ]
  },
  {
    title: 'Purchases',
    items: [
      { to: '/purchases', label: 'Purchases', icon: PackageCheck },
      { to: '/suppliers', label: 'Suppliers', icon: Truck }
    ]
  },
  {
    title: 'Reports & Analytics',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/audit', label: 'Audit Trail', icon: ShieldAlert, adminOnly: true }
    ]
  },
  {
    title: 'Administration',
    items: [
      { to: '/staff', label: 'Administration', icon: Users, adminOnly: true }
    ]
  }
];

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const collapsed = useSelector((state) => state.preferences?.sidebarCollapsed);
  const user = useSelector((state) => state.auth?.user);

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
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Sidebar Header with Brand Mark & Collapse Button */}
        <div className="flex h-12 items-center justify-between px-3 border-b border-surface">
          {collapsed ? (
            <img
              src={logoImg}
              alt="PharmaFlow"
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={logoImg}
                alt="PharmaFlow"
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <span className="text-[13px] font-bold text-text-primary tracking-tight truncate">
                PharmaFlow
              </span>
            </div>
          )}

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-surface text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5 scrollbar-thin">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (item.adminOnly && user?.role !== 'ADMIN') return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 pt-1 pb-0.5 text-[10.5px] font-bold tracking-wider text-text-muted uppercase select-none">
                    {group.title}
                  </div>
                )}

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14.5px] font-medium transition-all group relative',
                        isActive
                          ? 'bg-brand-primary text-white font-semibold shadow-xs'
                          : 'text-text-primary hover:bg-surface-muted hover:text-text-primary'
                      )}
                    >
                      <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-text-muted group-hover:text-text-primary')} />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}

                      {/* Tooltip for Collapsed Mode */}
                      {collapsed && (
                        <div className="absolute left-full ml-3 hidden rounded-lg bg-zinc-900 dark:bg-zinc-800 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-xl group-hover:flex items-center gap-1.5 z-50 whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Settings Navigation Item at Bottom */}
        <div className="p-2.5 border-t border-surface space-y-1">
          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium transition-all group relative',
                isActive
                  ? 'bg-brand-primary text-white font-semibold shadow-xs'
                  : 'text-text-primary hover:bg-surface-muted'
              )
            }
          >
            <Settings className="w-4 h-4 shrink-0 text-text-muted group-hover:text-text-primary" />
            {!collapsed && <span className="truncate">Pharmacy Settings</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 hidden rounded-lg bg-zinc-900 dark:bg-zinc-800 px-3 py-1.5 text-[12px] font-medium text-white shadow-xl group-hover:flex items-center gap-1.5 z-50 whitespace-nowrap">
                Pharmacy Settings
              </div>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
}