import React from 'react';
import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';

export function ShortcutsModal({ open, onOpenChange }) {
  const shortcuts = [
    { label: 'Focus Search', key: 'F1' },
    { label: 'Cash Payment', key: 'F2' },
    { label: 'UPI / QR Payment', key: 'F3' },
    { label: 'Card Payment', key: 'F4' },
    { label: 'Complete Billing', key: 'F6 / Ctrl+Enter' },
    { label: 'Navigate Search', key: '↑ / ↓ Arrows' },
    { label: 'Add to Cart', key: 'Enter' },
    { label: 'Close Dialog', key: 'Escape' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-brand-primary" /> Keyboard Billing Shortcuts
          </DialogTitle>
          <DialogDescription>
            Operate the entire POS register at maximum counter speed without touching the mouse.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            {shortcuts.map(({ label, key }) => (
              <div
                key={label}
                className="p-2.5 rounded-lg border border-surface bg-surface-page flex items-center justify-between"
              >
                <span className="text-text-muted">{label}</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted text-xs font-mono font-bold text-text-primary border border-surface">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="bg-brand-primary text-white">
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
