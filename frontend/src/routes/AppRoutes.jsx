import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { DashboardView } from '../features/dashboard/DashboardView.jsx';

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
        <h2 className="text-lg font-semibold text-text-primary">Ready for Day 2 Implementation</h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          This feature module is scaffolded with feature-based directory structure and backend PostgreSQL schema models.
        </p>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardView />} />
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
        <Route
          path="medicines"
          element={
            <PlaceholderView
              title="Medicine Catalogue"
              description="Pharmaceutical inventory directory with dosage, strength, and reorder levels."
              moduleName="Medicines"
            />
          }
        />
        <Route
          path="categories"
          element={
            <PlaceholderView
              title="Therapeutic Categories"
              description="Classification of medications (e.g. Analgesics, Antibiotics, Vitamins)."
              moduleName="Categories"
            />
          }
        />
        <Route
          path="suppliers"
          element={
            <PlaceholderView
              title="Supplier Directory"
              description="Approved pharmaceutical distributors and contact records."
              moduleName="Suppliers"
            />
          }
        />
        <Route
          path="purchases"
          element={
            <PlaceholderView
              title="Purchases & Goods Receiving"
              description="Purchase order drafting and physical shipment intake into active batches."
              moduleName="Purchases"
            />
          }
        />
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
        <Route
          path="audit"
          element={
            <PlaceholderView
              title="System Audit Trail"
              description="Immutable audit logging of sensitive stock adjustments and administrative actions."
              moduleName="Audit"
            />
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
    </Routes>
  );
}
