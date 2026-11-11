import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Clock,
  Package,
  CheckCircle2,
  X,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../../services/api/apiClient.js';
import { Badge } from '../ui/badge.jsx';

const READ_STORAGE_KEY = 'pharmaflow_read_notifications';

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'INVENTORY' | 'EXPIRY' | 'ORDERS'
  const dropdownRef = useRef(null);

  // Local state for dismissed / read notification IDs
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(READ_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Fetch real-time system alerts
  const { data: notifResponse, isLoading, refetch } = useQuery({
    queryKey: ['system-notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications');
      return res.data?.data || { notifications: [], summary: { total: 0 } };
    },
    refetchInterval: 60000, // Refresh every 60s
    refetchOnWindowFocus: true
  });

  const allNotifications = notifResponse?.notifications || [];

  // Filter out notifications marked as dismissed/read
  const unreadNotifications = allNotifications.filter(
    (n) => !readIds.includes(n.id)
  );

  const unreadCount = unreadNotifications.length;
  const criticalCount = unreadNotifications.filter((n) => n.severity === 'CRITICAL').length;

  // Filter by active tab
  const displayedNotifications = (activeTab === 'ALL'
    ? unreadNotifications
    : unreadNotifications.filter((n) => n.category === activeTab)
  );

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Mark all currently visible as read
  const handleMarkAllAsRead = () => {
    const allIds = allNotifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Dismiss a single notification
  const handleDismissOne = (e, id) => {
    e.stopPropagation();
    const updated = Array.from(new Set([...readIds, id]));
    setReadIds(updated);
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Navigate to target resource & mark that specific item read
  const handleItemClick = (notification) => {
    handleDismissOne({ stopPropagation: () => {} }, notification.id);
    setIsOpen(false);
    if (notification.targetUrl) {
      navigate(notification.targetUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 1. Notifications Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-muted transition-all relative cursor-pointer ${
          isOpen ? 'bg-surface-muted text-text-primary' : ''
        }`}
        title={unreadCount > 0 ? `${unreadCount} unread alerts` : 'Notifications'}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {/* Dynamic Badge / Indicator */}
        {unreadCount > 0 && (
          <span
            className={`absolute top-1 right-1 flex items-center justify-center font-bold text-[10px] text-white rounded-full ring-2 ring-surface-card ${
              criticalCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'
            } ${unreadCount > 9 ? 'h-4 w-5 px-1' : 'h-4 w-4'}`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 2. Interactive Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-surface bg-surface-card shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-surface flex items-center justify-between bg-surface/30">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-text-primary">Notifications</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20">
                  {unreadCount} New
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface text-text-muted">
                  0 New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center px-2 py-1.5 border-b border-surface bg-surface/10 text-xs overflow-x-auto gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                activeTab === 'ALL'
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface'
              }`}
            >
              All ({unreadNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('INVENTORY')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                activeTab === 'INVENTORY'
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface'
              }`}
            >
              Stock
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('EXPIRY')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                activeTab === 'EXPIRY'
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface'
              }`}
            >
              Expiry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ORDERS')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                activeTab === 'ORDERS'
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface'
              }`}
            >
              Orders
            </button>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-surface/60">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-text-muted">
                Loading notifications...
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-text-primary">
                  All caught up!
                </div>
                <p className="text-[11px] text-text-muted max-w-[220px] mx-auto">
                  No urgent inventory alerts, expired lots, or pending purchase receipts.
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const isCritical = notif.severity === 'CRITICAL';
                const isWarning = notif.severity === 'WARNING';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className="p-3.5 hover:bg-surface/40 transition-colors cursor-pointer group flex items-start gap-3 relative"
                  >
                    {/* Severity Icon */}
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : isWarning
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {notif.category === 'EXPIRY' ? (
                        <Clock className="w-4 h-4" />
                      ) : notif.category === 'ORDERS' ? (
                        <Package className="w-4 h-4" />
                      ) : isCritical ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>

                    {/* Notification Body */}
                    <div className="flex-1 min-w-0 pr-5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-bold text-text-primary group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {notif.title}
                        </span>
                        {isCritical && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-700 dark:text-rose-400">
                            Urgent
                          </span>
                        )}
                      </div>

                      <p className="text-[11.5px] text-text-muted line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1.5 opacity-90 group-hover:opacity-100">
                        <span>View details</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Single Dismiss Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDismissOne(e, notif.id)}
                      className="absolute top-3 right-3 text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-surface transition-colors"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-surface bg-surface/30 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/inventory');
              }}
              className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1"
            >
              <span>Manage Inventory Batches</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
