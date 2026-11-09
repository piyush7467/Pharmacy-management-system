import React from 'react';
import { MapPin, Phone, Mail, Clock, AlertTriangle, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Label } from '../../../components/ui/label.jsx';
import { Button } from '../../../components/ui/button.jsx';

export function ContactLocationCard({ profile, setProfile, onSave }) {
  return (
    <Card className="bg-surface-card border-surface">
      <CardHeader className="p-5 sm:p-6 border-b border-surface">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-primary" />
              Physical Location & Operating Hours
            </CardTitle>
            <CardDescription className="text-xs text-text-muted mt-1">
              Registered premises address, primary contact lines, emergency hotline, and store hours.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-text-primary">
              Registered Physical Premises Address <span className="text-red-500">*</span>
            </Label>
            <Input
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="e.g. 42 Brigade Road, Commercial District, Bengaluru, Karnataka 560001"
              className="bg-surface-page border-surface text-sm"
            />
            <p className="text-[11px] text-text-muted">Must correspond with physical address approved on drug distribution license.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-primary" /> Primary Dispensary Phone
              </Label>
              <Input
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="e.g. +91 80 4123 4567"
                className="bg-surface-page border-surface text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> 24/7 Emergency Helpline
              </Label>
              <Input
                value={profile.emergencyHelpline || ''}
                onChange={(e) => setProfile({ ...profile, emergencyHelpline: e.target.value })}
                placeholder="e.g. +91 80 4123 9999"
                className="bg-surface-page border-surface text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-primary" /> Official Inquiries Email
              </Label>
              <Input
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="e.g. dispensary@pharmaflow.demo"
                className="bg-surface-page border-surface text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-surface">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-primary" /> Standard Operating Schedule
              </Label>
              <Input
                value={profile.operatingHours || ''}
                onChange={(e) => setProfile({ ...profile, operatingHours: e.target.value })}
                placeholder="e.g. Mon - Sat: 8:00 AM - 10:30 PM | Sun: 9:00 AM - 6:00 PM"
                className="bg-surface-page border-surface text-sm"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-surface bg-surface-page cursor-pointer hover:bg-surface-muted transition-colors">
                <input
                  type="checkbox"
                  checked={profile.is24Hours || false}
                  onChange={(e) => setProfile({ ...profile, is24Hours: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                />
                <div className="text-xs">
                  <span className="font-semibold text-text-primary block">24/7 Emergency Dispensary Counter Active</span>
                  <span className="text-[11px] text-text-muted">Signals round-the-clock critical prescription coverage</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button
            type="button"
            onClick={onSave}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Contact & Hours
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
