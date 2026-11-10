import React from 'react';
import { X, AlertCircle, ChevronDown, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './dialog.jsx';
import { Button } from './button.jsx';
import { Badge } from './badge.jsx';
import { cn } from '../../lib/utils.js';

/**
 * FormDialog — Standardized Dialog Container for PharmaFlow Forms
 * Sizes: 'sm' (460px), 'md' (640px), 'lg' (840px), 'xl' (1040px), 'workspace' (1200px)
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'secondary',
  size = 'md',
  children,
  className
}) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    workspace: 'max-w-[1240px] w-[96vw]'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size] || sizeClasses.md,
          'p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl max-h-[92vh] flex flex-col',
          className
        )}
      >
        {/* Standard Form Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                  {title}
                </h2>
                {badgeText && (
                  <Badge
                    variant={badgeVariant}
                    className="font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 px-2 py-0.5 text-xs rounded-md"
                  >
                    {badgeText}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Body with Scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-5 select-text">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * FormSectionHeader — Clean H2 section heading matching design reference
 */
export function FormSectionHeader({ icon: Icon, title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-center justify-between pb-2 mb-3.5 border-b border-surface/60', className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
        <h3 className="text-[17px] font-semibold text-text-primary tracking-tight">
          {title}
        </h3>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * VerticalSectionNav — Left-hand pill navigation for complex modals (PO & Medicine)
 */
export function VerticalSectionNav({ sections, activeSection, onSelectSection, className }) {
  return (
    <nav className={cn('flex flex-col gap-1 w-48 shrink-0 select-none pr-3 border-r border-surface/70', className)}>
      {sections.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer',
              isActive
                ? 'bg-secondary text-primary font-semibold shadow-2xs'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-page'
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-text-muted'
                )}
              />
            )}
            <span className="truncate">{sec.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/**
 * HorizontalSectionTabs — Horizontal tabs navigation for profile-style modals (Suppliers)
 */
export function HorizontalSectionTabs({ tabs, activeTab, onSelectTab, className }) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-surface pb-px mb-5 overflow-x-auto select-none', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap',
              isActive
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-text-muted hover:text-text-primary hover:border-surface'
            )}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * FormField — Accessible field container with sentence-case label, optional helper, and error state
 */
export function FormField({
  label,
  required = false,
  helperText,
  error,
  children,
  className
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
      )}
      {children}
      {helperText && !error && (
        <p className="text-[13px] text-text-muted leading-tight">{helperText}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-[13px] text-red-600 dark:text-red-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/**
 * FormInput — Standard 46px Height Input Control
 */
export const FormInput = React.forwardRef(
  ({ leadingIcon: LeadingIcon, trailing, error, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {LeadingIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-text-muted">
            <LeadingIcon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-[46px] w-full rounded-xl border border-surface bg-surface-card px-3.5 py-2 text-[15px] text-text-primary placeholder:text-text-muted/70 transition-all shadow-2xs',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-page',
            LeadingIcon && 'pl-10',
            trailing && 'pr-12',
            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute right-3 flex items-center text-text-muted text-sm font-medium">
            {trailing}
          </div>
        )}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';

/**
 * FormSelect — Standard 46px Height Select Control
 */
export const FormSelect = React.forwardRef(
  ({ leadingIcon: LeadingIcon, children, error, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {LeadingIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-primary">
            <LeadingIcon className="w-4 h-4" />
          </div>
        )}
        <select
          ref={ref}
          className={cn(
            'flex h-[46px] w-full appearance-none rounded-xl border border-surface bg-surface-card px-3.5 py-2 pr-10 text-[15px] text-text-primary transition-all shadow-2xs',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer',
            'disabled:cursor-not-allowed disabled:opacity-50',
            LeadingIcon && 'pl-10',
            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3.5 flex items-center pointer-events-none text-text-muted">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);
FormSelect.displayName = 'FormSelect';

/**
 * TagInput — Interactive Pill Tag Editor for Classifications
 */
export function TagInput({ tags = [], onAddTag, onRemoveTag, placeholder = 'Add tag...' }) {
  const [inputVal, setInputVal] = React.useState('');

  const handleAdd = (e) => {
    e?.preventDefault();
    if (inputVal.trim()) {
      onAddTag(inputVal.trim());
      setInputVal('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 min-h-[46px] rounded-xl border border-surface bg-surface-card">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-secondary text-primary border border-primary/20 animate-in fade-in zoom-in-95 duration-100"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => onRemoveTag(tag)}
            className="hover:text-red-600 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8 px-2 text-xs bg-transparent text-text-primary focus:outline-none flex-1"
        />
        <Button
          type="button"
          onClick={handleAdd}
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs text-primary border-primary/30 hover:bg-secondary font-semibold"
        >
          <Plus className="w-3 h-3 mr-0.5" /> Add
        </Button>
      </div>
    </div>
  );
}

/**
 * FormFooterActions — Standard Dialog Footer with Sticky Layout & Clean Actions
 */
export function FormFooterActions({ onCancel, isSubmitting, submitText, submitIcon: SubmitIcon }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface bg-surface-card shrink-0">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="h-10 px-5 text-sm font-medium rounded-xl"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2"
      >
        {SubmitIcon && <SubmitIcon className="w-4 h-4" />}
        <span>{isSubmitting ? 'Saving...' : submitText}</span>
      </Button>
    </div>
  );
}
