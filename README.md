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
| **Security & Crypto** | Argon2id, JWT (`jsonwebtoken`), `cookie-parser`, `helmet`, `express-rate-limit` |
| **Email Service** | Brevo API (Transactional SMTP) |
| **Testing** | Vitest v3.2.7 + Supertest v7.0.0 (41 tests, 100% passing) |
| **Frontend Framework**| React 19 + Vite 6 |
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

## 🧪 Automated Testing & Acceptance Verification

All **41 automated integration tests** run against the live PostgreSQL database:

```bash
cd backend
npm test
```

### Test Evidence Summary
```text
Test Files  6 passed (6)
Tests       41 passed (41)

✓ tests/health.test.js (2 tests)
✓ tests/auth.test.js (11 tests)
✓ tests/catalogue.test.js (9 tests)
✓ tests/purchases.test.js (7 tests)
✓ tests/sales_fefo_returns.test.js (7 tests)
✓ tests/reports_reconciliation.test.js (5 tests)
```

### 5 Non-Negotiable Release Blockers Verified:
1. **FEFO Batch Allocation**: Earlier batches are completely exhausted first, later batches are tapped for the remainder, and immutable `SALE_DEDUCTION` movements are appended.
2. **Expired Batch Shielding**: Batches past `expiryDate` are strictly excluded from checkouts; sales fail if only expired batches exist.
3. **Alerts Engine**: Dynamic calculation of live active stock across valid batches and `< 60d` expiry flags.
4. **Auditable Returns**: Enforces return quantity $\le$ sold quantity on invoice, handles `RESTOCKED` vs `DAMAGED_DISCARDED` disposition, and rejects blank reasons.
5. **Ledger Reconciliation**: Mathematical verification that `CurrentStock == InwardReceipts - Sales + Returns - Adjustments` with 0 discrepancy (`BALANCED`).

---

## 🔒 Security & Compliance Posture

- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Full access (Staff provisioning, audit logs, catalog, purchases, reports, settings).
  - `PHARMACIST`: Catalog management, purchase orders, goods receiving, POS sales, stock adjustments, reports.
  - `CASHIER`: POS sales, invoice search, customer returns. Cannot manage staff or access audit logs.
- **Session Protection**:
  - Short-lived Access Tokens (15 minutes).
  - Long-lived Opaque Refresh Tokens (7 days) stored as SHA-256 hashes in database and sent via `HttpOnly`, `SameSite=Lax` cookies.
  - Refresh Token Family Rotation: If an old revoked refresh token is re-submitted, the entire token family is immediately invalidated to thwart replay attacks.
- **Educational / Demo Compliance Notice**:
  - PharmaPulse is an operational software engineering demonstration built strictly for assessment purposes.
  - It does not provide medical advice or handle sensitive patient health records (PHI/HIPAA).

---

## 📄 License

Developed for evaluation by **ALGIONS AI LABS PRIVATE LIMITED**. All rights reserved.
