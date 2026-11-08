import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { ProtectedRoute } from '../components/auth/ProtectedRoute.jsx';
import { LoginView } from '../features/auth/LoginView.jsx';
import { ResetPasswordView } from '../features/auth/ResetPasswordView.jsx';
import { DashboardView } from '../features/dashboard/DashboardView.jsx';
import { StaffManagementView } from '../features/staff/StaffManagementView.jsx';
import { CategoriesView } from '../features/categories/CategoriesView.jsx';
import { SuppliersView } from '../features/suppliers/SuppliersView.jsx';
import { MedicinesView } from '../features/medicines/MedicinesView.jsx';
import { PurchasesView } from '../features/purchases/PurchasesView.jsx';

function PlaceholderView({ title, description, moduleName }) {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="pb-3 border-b border-surface">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
      <div className="p-8 rounded-xl border border-dashed border-surface bg-surface-card text-center space-y-3">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary">
          Module: {moduleName}
        </span>
        <h2 className="text-lg font-semibold text-text-primary">Ready for Implementation</h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          This feature module is backed by validated PostgreSQL database schemas and server-side RBAC guards.
        </p>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/reset-password" element={<ResetPasswordView />} />

      {/* Protected Operations Application */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardView />} />
        
        {/* POS & Catalogue */}
        <Route
          path="pos"
          element={
            <PlaceholderView
              title="Point of Sale (POS)"
              description="High-speed barcode checkout with automatic FEFO batch allocation."
              moduleName="Sales / POS"
            />
          }
        />
        <Route path="medicines" element={<MedicinesView />} />
        <Route path="categories" element={<CategoriesView />} />
        <Route path="suppliers" element={<SuppliersView />} />
        <Route path="purchases" element={<PurchasesView />} />
        <Route
          path="inventory"
          element={
            <PlaceholderView
              title="Batch-Wise Inventory & Adjustments"
              description="Granular batch tracking with expiry dates, purchase costs, and stock reconciliation."
              moduleName="Inventory"
            />
          }
        />
        <Route
          path="sales"
          element={
            <PlaceholderView
              title="Sales Ledger & Historical Invoices"
              description="Search completed transactions and reprint fiscal invoices."
              moduleName="Sales"
            />
          }
        />
        <Route
          path="returns"
          element={
            <PlaceholderView
              title="Customer Returns & Restocking"
              description="Process returns against prior invoices with condition disposition and auditable reasons."
              moduleName="Returns"
            />
          }
        />
        <Route
          path="reports"
          element={
            <PlaceholderView
              title="Financial Reports & Ledger Reconciliation"
              description="Sales totals, tax reports, cost valuation, and mathematical ledger audits."
              moduleName="Reports"
            />
          }
        />

        {/* Admin-Only Staff Management */}
        <Route
          path="staff"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StaffManagementView />
            </ProtectedRoute>
          }
        />

        <Route
          path="audit"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PlaceholderView
                title="System Audit Trail"
                description="Immutable audit logging of sensitive stock adjustments and administrative actions."
                moduleName="Audit"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <PlaceholderView
              title="Settings & Privacy Disclaimers"
              description="Pharmacy identity, tax configurations, and demo privacy policies."
              moduleName="Settings"
            />
          }
        />
      </Route>

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
