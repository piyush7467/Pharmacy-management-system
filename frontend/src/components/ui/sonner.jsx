import React from 'react';
import { useSelector } from 'react-redux';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster({ ...props }) {
  const theme = useSelector((state) => state.preferences.theme);

  return (
    <SonnerToaster
      theme={theme === 'system' ? 'system' : theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface-card group-[.toaster]:text-text-primary group-[.toaster]:border-surface group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl text-xs font-medium',
          description: 'group-[.toast]:text-text-muted text-[11px]',
          actionButton:
            'group-[.toast]:bg-brand-primary group-[.toast]:text-white font-semibold',
          cancelButton:
            'group-[.toast]:bg-surface-muted group-[.toast]:text-text-primary'
        }
      }}
      {...props}
    />
  );
}
