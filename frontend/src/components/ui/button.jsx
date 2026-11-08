import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-brand-primary text-white hover:opacity-90 shadow-xs',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-xs',
        outline:
          'border border-surface bg-surface-card hover:bg-surface-muted text-text-primary shadow-xs',
        secondary:
          'bg-surface-muted text-text-primary hover:bg-surface-muted/80',
        ghost:
          'text-text-muted hover:text-text-primary hover:bg-surface-muted',
        accent:
          'bg-brand-accent text-zinc-950 font-semibold hover:opacity-90 shadow-xs',
        link:
          'text-brand-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2 text-xs font-semibold',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-lg px-6 text-sm font-semibold',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
