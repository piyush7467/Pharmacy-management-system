import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-[#166534] text-white shadow-xs',
        secondary:
          'bg-slate-100 text-slate-800 border border-slate-200',
        destructive:
          'bg-red-50 text-red-700 border border-red-200',
        outline:
          'text-slate-700 border border-slate-200 bg-white',
        success:
          'bg-emerald-50 text-emerald-800 border border-emerald-200',
        warning:
          'bg-amber-50 text-amber-800 border border-amber-200',
        accent:
          'bg-amber-50 text-amber-900 border border-amber-200'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
