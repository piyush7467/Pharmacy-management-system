import React, { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { apiClient } from '../../services/api/apiClient.js';

export function ForgotPasswordModal({ open, onOpenChange }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Instructions sent', {
        description: res.data?.message || 'Check your inbox for password reset instructions.'
      });
    } catch (err) {
      toast.error('Failed to process request', {
        description: err.message || 'Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary mb-2">
            <Mail className="h-5 w-5" />
          </div>
          <DialogTitle>Reset Your Password</DialogTitle>
          <DialogDescription>
            Enter your registered staff email. We will send you a secure, single-use reset link via Brevo.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-surface-muted p-4 text-xs text-text-primary leading-relaxed border border-surface">
              If an active account exists for <span className="font-semibold">{email}</span>, a reset link with a 1-hour expiration has been dispatched.
            </div>
            <DialogFooter>
              <Button onClick={handleClose} variant="default" className="w-full">
                Back to Sign In
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Staff Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@pharmapulse.demo"
                required
                autoFocus
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
