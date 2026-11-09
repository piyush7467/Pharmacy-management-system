import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Pill, Truck, Clock, ArrowRight } from 'lucide-react';

export function QuickActionsStrip() {
  const actions = [
    {
      title: 'Point of Sale (POS)',
      description: 'Rapid barcode billing & FEFO batch deduction',
      link: '/pos',
      icon: ShoppingCart,
      color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20'
    },
    {
      title: 'Register Medicine',
      description: 'Add new formulations, salts, & reorder levels',
      link: '/medicines',
      icon: Pill,
      color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Supplier Procurement',
      description: 'Receive distributor shipments & execute GRN',
      link: '/purchases',
      icon: Truck,
      color: 'text-blue-600 bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Batch Expiry Audit',
      description: 'Inspect lots expiring within 30, 60, & 90 days',
      link: '/inventory',
      icon: Clock,
      color: 'text-amber-600 bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div className="space-y-3 pt-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
        Operations Shortcuts
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              to={act.link}
              className="p-4 rounded-2xl border border-surface bg-surface-card hover:border-brand-primary/40 hover:shadow-sm transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl border ${act.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                    {act.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
