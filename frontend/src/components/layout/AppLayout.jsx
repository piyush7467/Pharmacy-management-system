import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { Toaster } from '../ui/sonner.jsx';
import { useThemeEffect } from '../../hooks/useThemeEffect.js';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Synchronize active theme with document root & OS media queries
  useThemeEffect();

  return (
    <div className="flex min-h-screen bg-surface-page text-text-primary">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Notification Toaster */}
      <Toaster position="top-right" closeButton richColors />
    </div>
  );
}
