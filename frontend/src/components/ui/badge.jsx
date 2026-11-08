import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-brand-primary text-white shadow-xs',
        secondary:
          'bg-surface-muted text-text-primary border border-surface',
        destructive:
          'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
        outline:
          'text-text-primary border border-surface',
        success:
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
        warning:
          'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
        accent:
          'bg-brand-accent/15 text-zinc-900 dark:text-amber-200 border border-brand-accent/30'
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
