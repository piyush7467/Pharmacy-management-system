# PharmaPulse (PharmaFlow) — Pharmacy Management System

> A production-grade Pharmacy Management System built for **ALGIONS AI LABS PRIVATE LIMITED** assessment.  
> Engineered with a **Modular Monolith** architecture featuring server-side FEFO inventory allocation, mathematical ledger reconciliation, Argon2id authentication, and a custom **Hybrid Minimal Editorial + Bento Dashboard + Glassmorphism** design system.

---

## 🌟 Executive Summary

PharmaPulse is an operational retail pharmacy and inventory management suite designed to eliminate dispensing errors, prevent the sale of expired medications, enforce double-entry inventory ledger integrity, and provide real-time sales and tax reporting.

### Core Highlights
- **100% Real Server-Side Computations**: Zero mock calculations or fake frontend data. All batch deductions, tax amounts, and stock valuation calculations occur inside transactional PostgreSQL database queries.
- **Automated FEFO (First-Expiry-First-Out) Engine**: Automatically allocates items during checkout from the earliest non-expired batch, marking depleted batches and strictly blocking expired inventory.
- **Mathematical Double-Entry Ledger**: Every stock change is permanently recorded in an immutable `StockMovement` table. The reconciliation audit equation `CurrentStock == InwardReceipts - Sales + Returns - Adjustments` holds with 0 discrepancy.
- **Argon2id + JWT Family Session Rotation**: Enterprise-grade password hashing with 64MB memory cost, HttpOnly cookies for rotating refresh tokens, and automatic reuse detection.
- **Brevo SMTP API Password Recovery**: Time-limited, single-use SHA-256 hashed password reset tokens delivered via Brevo API with local fallback.
- **Custom Hybrid Design System**: Sage Green (`#355B48`), Forest Green (`#294B39`), and warm amber neutrals paired with Bento-inspired card layouts, flat data tables, and accessible contrast.

---

## 🏗️ Architecture & Technology Stack

```
Pharmacy_management_system/
├── backend/                  # Node.js + Express 5 (Modular Monolith)
│   ├── prisma/               # Prisma Schema (15 models) & DB Seeder
│   ├── src/
│   │   ├── config/           # Envs (Zod validated) & Prisma client
│   │   ├── middleware/       # Auth (JWT/RBAC), RateLimiter, ErrorHandler
│   │   ├── modules/          # Auth, Users, Categories, Medicines, Suppliers,
│   │   │                     # Purchases, Sales, Returns, Inventory, Reports, Audit
│   │   └── utils/            # Argon2id, Token crypto, Cookie helpers
│   └── tests/                # 41 Vitest + Supertest integration tests
├── frontend/                 # Vite 6 + React 19 + Tailwind CSS v4
│   ├── src/
│   │   ├── components/       # Shadcn UI primitives, Glass Lens, Layout
│   │   ├── features/         # POS, Purchases, Sales, Returns, Inventory,
│   │   │                     # Categories, Medicines, Suppliers, Staff, Reports, Audit
│   │   ├── store/            # Redux Toolkit + Redux Persist (Theme & Auth)
│   │   └── routes/           # RBAC-Protected React Router
└── docs/                     # Specifications, ER Diagrams, Threat Models, Test Evidence
```

### Technology Matrix

| Layer | Technologies |
| :--- | :--- |
| **Backend Runtime** | Node.js v24+, Express 5 |
| **Database** | Serverless PostgreSQL via **Neon DB** |
| **ORM & Migrations** | Prisma 6.19 with pooled + direct connection strings |
| **API Contract & Docs**| **OpenAPI 3.0.3** mounted at `/api/v1/api-docs` via **Swagger UI** |
| **Security & Crypto** | Argon2id, JWT (`jsonwebtoken`), `cookie-parser`, `helmet`, `express-rate-limit` |
| **Email Service** | Brevo API (Transactional SMTP) |
| **Testing** | Vitest v3.2.7 + Supertest v7.0.0 (45 tests, 100% passing) |
| **Frontend Framework**| React 19 + Vite 6 (Component-wise single-responsibility architecture) |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`), Custom Hybrid Design System |
| **State Management** | Redux Toolkit v2 + Redux Persist (Theme & In-Memory Auth) |
| **Data Fetching** | TanStack React Query v5 |
| **Data Tables** | TanStack React Table v8 |
| **Charts** | Recharts v2 |
| **Toasts** | Sonner |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher (v24 recommended)
- **PostgreSQL**: Neon DB connection string or local PostgreSQL 16+

### 2. Environment Setup

Copy `.env.example` in both backend and frontend:

```bash
# In backend/
cp .env.example .env
```

Ensure your `backend/.env` contains your Neon DB connection strings and credentials:

```env
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# Neon PostgreSQL Database
DATABASE_URL="postgresql://user:password@ep-green-base-bc3zqv49-pooler.c-16.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-green-base-bc3zqv49.c-16.us-east-1.aws.neon.tech/neondb?sslmode=require"

# JWT Secrets
JWT_ACCESS_SECRET="your-super-secret-jwt-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-key-min-32-chars"
COOKIE_SECRET="your-cookie-signing-secret"

# Admin Initial Provisioning (Argon2id seeded)
ADMIN_EMAIL="admin@pharmapulse.demo"
ADMIN_PASSWORD="AdminSecurePassword123!"

# Brevo Email API (for Password Recovery)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="no-reply@pharmapulse.demo"
BREVO_SENDER_NAME="PharmaPulse Security"
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Migration & Seeding

```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
```

### 4. Running the Development Servers

**Backend API (Port 5000):**
```bash
cd backend
npm run dev
```

**Frontend Client (Port 5173):**
```bash
cd frontend
npm install
npm run dev
```

---

## 📖 OpenAPI 3.0 Documentation & Swagger UI

PharmaPulse exposes a complete OpenAPI 3.0.3 specification covering all authentication, catalogue, purchases, inventory, POS sales, returns, reports, and audit trail endpoints.

- **Interactive Swagger UI**: [http://localhost:5000/api/v1/api-docs](http://localhost:5000/api/v1/api-docs)
- **Raw OpenAPI JSON**: [http://localhost:5000/api/v1/openapi.json](http://localhost:5000/api/v1/openapi.json)

---

## 🧪 Automated Testing & Acceptance Verification

All **45 automated integration tests** run against the live PostgreSQL database with 100% pass rate:

```bash
cd backend
npm test
```

### Test Evidence Summary
```text
Test Files  6 passed (6)
Tests       45 passed (45)

✓ tests/health.test.js (4 tests) - Health, 404 envelope, OpenAPI JSON & Swagger UI
✓ tests/auth.test.js (11 tests) - Argon2id, JWT rotation, Staff RBAC, Password recovery
✓ tests/catalogue.test.js (9 tests) - Categories, Suppliers, Medicines, Live batch stock
✓ tests/purchases.test.js (7 tests) - PO creation, GRN receipt, Expired batch gate
✓ tests/sales_fefo_returns.test.js (9 tests) - FEFO allocation, Idempotency, Returns, Stock write-off
✓ tests/reports_reconciliation.test.js (5 tests) - Ledger reconciliation audit, Valuation, RBAC
```

### 5 Non-Negotiable Release Blockers Verified:
1. **FEFO Batch Allocation**: Earlier batches are completely exhausted first, later batches are tapped for the remainder, and immutable `SALE_DEDUCTION` movements are appended.
2. **Expired Batch Shielding**: Batches past `expiryDate` are strictly excluded from checkouts; intake of expired batches at GRN is rejected with `EXPIRED_BATCH_BLOCKED`.
3. **Alerts Engine**: Dynamic calculation of live active stock across valid batches and `< 60d` expiry flags.
4. **Auditable Returns**: Enforces return quantity $\le$ sold quantity on invoice, handles `RESTOCKED` vs `DAMAGED_DISCARDED` disposition, refunds proportional discounts, and rejects blank reasons.
5. **Ledger Reconciliation**: Mathematical verification that `CurrentStock == InwardReceipts - Sales + Returns - Adjustments` with 0 discrepancy (`BALANCED`).

---

## ⏱️ 3–5 Minute Technical Evaluation Walkthrough Script

This script guides the **ALGIONS AI LABS** evaluation team through verifying the system's core requirements end-to-end:

### Pre-requisite Demo Credentials:
- **Admin**: `admin@pharmapulse.demo` / `AdminSecurePassword123!`
- **Pharmacist**: `pharmacist@pharmapulse.demo` / `PharmacistPass123!`
- **Cashier**: `cashier@pharmapulse.demo` / `CashierPass123!`

---

### Step 1: Authentication & Role Boundary Check (1 Minute)
1. Navigate to `http://localhost:5173/login`.
2. Click the quick-fill pill **"Cashier (POS & Sales)"** to sign in as cashier.
3. Observe the restricted sidebar: Cashiers have access to **POS**, **Sales**, and **Returns**.
4. Attempt to navigate directly to `http://localhost:5173/staff` or `http://localhost:5173/audit`.
5. Observe the automated client-side and server-side RBAC block gracefully redirecting with notification.
6. Sign out and log back in as **Admin** via the **"Admin (Full Control)"** quick-fill button.

---

### Step 2: FEFO Batch Intake via Purchases / GRN (1 Minute)
1. Click **Purchases** in the sidebar (`/purchases`).
2. Click **"+ New Purchase Order"**, choose a supplier (e.g. *Apex Pharma Distributors*), select a medicine, set quantity `100`, purchase unit price `$10.00`, batch number `APEX-2026-X1`, and expiry date (e.g. `2027-12-31`).
3. Click **"Save Purchase Order"** — status displays as `ORDERED`.
4. Click **"Receive Goods"** on the newly created order. Verify batch details and confirm intake.
5. Status changes to `RECEIVED`.
6. Navigate to **Inventory** (`/inventory`) and observe the new batch `APEX-2026-X1` live with 100 units in stock.

---

### Step 3: High-Speed POS Checkout & FEFO Allocation (1 Minute)
1. Open the **POS** terminal (`/pos`).
2. Select or search for the medicine received in Step 2.
3. Notice that multiple batches exist with different expiry dates.
4. Add items to cart (e.g. quantity 5).
5. Open the **Payment Settlement** view. Select payment method (Cash / UPI / Card).
6. Enter customer phone number and optional discount (e.g. 5%).
7. Observe instant real-time calculation:
   - Subtotal, Itemized CGST/SGST tax, and Net Payable.
8. Click **"Complete Sale & Generate Invoice"**.
9. The high-contrast **Thermal Invoice Modal** pops up displaying itemized batch numbers, tax breakdown, and barcode.
10. Check **Inventory** (`/inventory`): The earliest expiring batch has been automatically decremented by 5.

---

### Step 4: Customer Return & Proportional Restock (45 Seconds)
1. Go to **Sales** (`/sales`), locate the invoice generated in Step 3, and click **"Process Return"**.
2. Select 1 unit to return, choose disposition **"Return to Shelf (Restock)"**, and provide a regulatory justification reason: `"Customer ordered incorrect dosage prescribed by physician"`.
3. Submit the return.
4. Notice the proportional discount refund is mathematically computed.
5. In **Inventory**, observe the batch quantity immediately restores by 1 unit.
6. In **Audit Trail** (`/audit`), an immutable `RETURN_RESTOCK` movement is recorded with the cashier's user ID and reason string.

---

### Step 5: Double-Entry Mathematical Ledger Reconciliation (45 Seconds)
1. Open **Reports** (`/reports`).
2. Examine the **Double-Entry Ledger Reconciliation** card:
   $$\text{Current Physical Stock} = \text{Inward Receipts} - \text{Sales Deductions} + \text{Customer Returns} \pm \text{Audit Adjustments}$$
3. Observe **0 Discrepancy** with a green `BALANCED` badge, proving mathematical zero-loophole inventory integrity.
4. Click **Swagger 3.0 API Docs** in the header or visit `http://localhost:5000/api/v1/api-docs` to inspect the full RESTful OpenAPI contract.
5. Click **Legal & Privacy** (`/privacy`) to inspect the regulatory disclaimers, WHO-GMP simulation standards, and DPDPA/HIPAA privacy policies.

---

## 🔒 Security & Compliance Posture

- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Full access (Staff provisioning, audit logs, catalog, purchases, reports, settings).
  - `PHARMACIST`: Catalog management, purchase orders, goods receiving, POS sales, stock adjustments, reports.
  - `CASHIER`: POS sales, invoice search, customer returns. Blocked from managing staff, editing purchase prices, or viewing audit logs.
- **Session Protection**:
  - Short-lived Access Tokens (15 minutes).
  - Long-lived Opaque Refresh Tokens (7 days) stored as SHA-256 hashes in database and sent via `HttpOnly`, `SameSite=Lax` cookies.
  - Refresh Token Family Rotation: If an old revoked refresh token is re-submitted, the entire token family is immediately invalidated to thwart replay attacks.
- **Educational / Demo Compliance Notice**:
  - PharmaPulse is an operational software engineering demonstration built strictly for assessment purposes for **ALGIONS AI LABS PRIVATE LIMITED**.
  - All statutory simulation disclaimers and privacy notices are available within the app at `/privacy` and `/legal`.

---

## 📄 License

Developed for technical evaluation by **ALGIONS AI LABS PRIVATE LIMITED**. All rights reserved.
