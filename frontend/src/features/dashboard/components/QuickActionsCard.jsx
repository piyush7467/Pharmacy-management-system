import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShoppingCart,
  PackagePlus,
  PlusCircle,
  UserPlus,
  Boxes,
  FileText
} from 'lucide-react';

const ACTIONS = [
  {
    label: 'New Sale',
    path: '/pos',
    icon: ShoppingCart,
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-50 border border-emerald-100'
  },
  {
    label: 'Add Purchase',
    path: '/purchases/new',
    icon: PackagePlus,
    iconColor: 'text-blue-700',
    iconBg: 'bg-blue-50 border border-blue-100'
  },
  {
    label: 'Add Medicine',
    path: '/medicines',
    icon: PlusCircle,
    iconColor: 'text-purple-700',
    iconBg: 'bg-purple-50 border border-purple-100'
  },
  {
    label: 'Add Customer',
    path: '/customers',
    icon: UserPlus,
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-50 border border-amber-100'
  },
  {
    label: 'Stock Adjust',
    path: '/inventory',
    icon: Boxes,
    iconColor: 'text-cyan-700',
    iconBg: 'bg-cyan-50 border border-cyan-100'
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: FileText,
    iconColor: 'text-rose-700',
    iconBg: 'bg-rose-50 border border-rose-100'
  }
];

export function QuickActionsCard() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Quick Actions</h3>
        </div>
      </div>

      {/* Grid of Actions */}
      <div className="p-4 grid grid-cols-3 gap-2.5 flex-1 items-center">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.path}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/90 hover:border-slate-300 transition-all group text-center cursor-pointer min-h-[86px]"
            >
              <div
                className={`w-9 h-9 rounded-xl ${action.iconBg} ${action.iconColor} flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-bold text-slate-800 leading-tight">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Subtle bottom note */}
      <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 text-center font-medium">
        Dispensary Fast-Path Shortcuts
      </div>
    </div>
  );
}
