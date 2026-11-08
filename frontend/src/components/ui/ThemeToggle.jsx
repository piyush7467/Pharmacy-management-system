import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sun, Moon, Laptop } from 'lucide-react';
import { setTheme } from '../../features/preferences/preferencesSlice.js';
import { cn } from '../../lib/utils.js';

export function ThemeToggle({ className }) {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.preferences.theme);

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop }
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Color Theme Selection"
      className={cn(
        'inline-flex items-center p-1 rounded-lg bg-surface-muted border border-surface text-text-muted',
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = currentTheme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isSelected}
            aria-label={`${opt.label} mode`}
            onClick={() => dispatch(setTheme(opt.value))}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
              isSelected
                ? 'bg-surface-card text-brand-primary shadow-xs font-semibold'
                : 'hover:text-text-primary'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
