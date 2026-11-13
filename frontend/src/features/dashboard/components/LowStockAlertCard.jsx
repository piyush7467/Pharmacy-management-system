import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MoreVertical, ArrowRight, CheckCircle2, ShoppingCart, Sliders } from 'lucide-react';

export function LowStockAlertCard({ items = [], count = 0, threshold = 10, isLoading = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between shadow-xs overflow-hidden">
      <div>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Low Stock Alert</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 font-mono">
              {count}
            </span>
          </div>

          {/* 3-Dot Action Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="More actions"
              aria-label="Low stock menu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-52 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
                <Link
                  to="/inventory"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>View in Inventory</span>
                </Link>
                <Link
                  to="/purchases/new"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                  <span>Create Purchase Order</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors border-t border-slate-100 mt-1 pt-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Configure Threshold ({threshold})</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 divide-y divide-slate-100">
          {isLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="space-y-1.5">
                    <div className="h-4 bg-slate-100 rounded w-28"></div>
                    <div className="h-3 bg-slate-100/60 rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-slate-100 rounded-full w-14"></div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Stock Levels Healthy</p>
              <p className="text-[11px] text-slate-500">
                No active medicines below reorder threshold of {threshold} units.
              </p>
            </div>
          ) : (
            items.slice(0, 4).map((item) => (
              <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-slate-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    Minimum: {item.minReorderLevel ?? threshold}
                  </div>
                </div>

                <span
                  className={`shrink-0 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full font-mono border ${
                    item.availableStock === 0
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {item.availableStock} left
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <Link
          to="/inventory"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center justify-between group transition-colors"
        >
          <span>View all {count} low stock items</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
