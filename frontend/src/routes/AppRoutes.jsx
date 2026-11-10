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
import { CreatePurchaseView } from '../features/purchases/CreatePurchaseView.jsx';
import { MedicineFormView } from '../features/medicines/MedicineFormView.jsx';
import { SupplierFormView } from '../features/suppliers/SupplierFormView.jsx';
import { PosView } from '../features/pos/PosView.jsx';
import { InventoryView } from '../features/inventory/InventoryView.jsx';
import { SalesView } from '../features/sales/SalesView.jsx';
import { ReturnsView } from '../features/returns/ReturnsView.jsx';
import { ReportsView } from '../features/reports/ReportsView.jsx';
import { AuditView } from '../features/audit/AuditView.jsx';
import { SettingsView } from '../features/settings/SettingsView.jsx';
import { PrivacyTermsView } from '../features/legal/PrivacyTermsView.jsx';
import { PharmacyProfileView } from '../features/profile/PharmacyProfileView.jsx';

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
      {/* Public Authentication & Information Routes */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/reset-password" element={<ResetPasswordView />} />
      <Route path="/privacy" element={<PrivacyTermsView />} />
      <Route path="/terms" element={<PrivacyTermsView />} />
      <Route path="/legal" element={<PrivacyTermsView />} />

      {/* Protected Operations Application */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardView />} />
        
        {/* POS & Operations */}
        <Route path="pos" element={<PosView />} />
        <Route path="medicines" element={<MedicinesView />} />
        <Route path="medicines/new" element={<MedicineFormView />} />
        <Route path="medicines/:id/edit" element={<MedicineFormView />} />
        <Route path="categories" element={<CategoriesView />} />
        <Route path="suppliers" element={<SuppliersView />} />
        <Route path="suppliers/new" element={<SupplierFormView />} />
        <Route path="suppliers/:id/edit" element={<SupplierFormView />} />
        <Route path="purchases" element={<PurchasesView />} />
        <Route path="purchases/new" element={<CreatePurchaseView />} />
        <Route path="inventory" element={<InventoryView />} />
        <Route path="sales" element={<SalesView />} />
        <Route path="returns" element={<ReturnsView />} />
        <Route path="reports" element={<ReportsView />} />
        <Route path="privacy" element={<PrivacyTermsView />} />
        <Route path="terms" element={<PrivacyTermsView />} />
        <Route path="legal" element={<PrivacyTermsView />} />

        {/* Admin-Only Staff Management & Audit */}
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
              <AuditView />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<SettingsView />} />
        <Route path="profile" element={<PharmacyProfileView />} />
      </Route>

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
