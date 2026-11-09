import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { useThemeEffect } from '../../hooks/useThemeEffect.js';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Synchronize active theme with document root & OS media queries
  useThemeEffect();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-page text-text-primary">
      {/* Top Navbar spans 100% full screen width */}
      <Navbar onMenuClick={() => setMobileOpen(true)} />

      {/* Main Workspace below Navbar */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Dynamic Route Content */}
        <main className="flex-1 h-full overflow-y-auto p-3 sm:p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}