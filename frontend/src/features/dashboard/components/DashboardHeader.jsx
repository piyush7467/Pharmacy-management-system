import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ShoppingCart } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function DashboardHeader({
  user,
  dateRange,
  setDateRange,
  onRefresh,
  isLoading
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface pb-5">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Pharmacy Operations
          </h1>
        </div>
        <p className="text-sm text-text-muted mt-0.5">
          Good {getTimeGreeting()}, <strong className="text-text-primary font-semibold">{user?.fullName?.split(' ')[0] || 'there'}</strong>.
        </p>
      </div>

      {/* Date Filter & Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="inline-flex items-center p-1 rounded-xl bg-surface-card border border-surface text-xs font-medium shadow-2xs">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'all', label: 'All Time' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setDateRange(btn.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dateRange === btn.id
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-9 px-3 text-xs font-bold border-surface hover:bg-surface-page gap-1.5 cursor-pointer rounded-xl"
          title="Refresh Live Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Button
          size="sm"
          onClick={() => navigate('/pos')}
          className="h-9 px-3.5 text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary/90 gap-1.5 shadow-sm cursor-pointer rounded-xl"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>New Sale (POS)</span>
        </Button>
      </div>
    </div>
  );
}
