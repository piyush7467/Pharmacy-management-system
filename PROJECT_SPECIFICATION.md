# Pharmacy Management System — Project Specification

> **Project Name:** PharmaPulse (Pharmacy Operations & Inventory Management System)  
> **Client / Assessment:** ALGIONS AI LABS PRIVATE LIMITED — Full-Stack Web Development Assessment  
> **Repository:** `D:\mern_project\Pharmacy_management_system`  
> **Architecture:** Modular Monolith (MVC Backend + Feature-Based Frontend)  
> **Primary Stack:** React 19 + Vite 6 + Node.js 24 + Express 5 + PostgreSQL + Prisma 7  
> **Document Version:** 1.0.0 (Baseline Master Specification)  
> **Last Updated:** 2026-11-07  

---

## 1. Executive Summary & Product Objective

The **PharmaPulse Pharmacy Management System** is a professional, high-integrity web application built specifically for retail and hospital pharmacy operations. It centralizes catalogue administration, supplier management, purchase order receiving, batch-wise inventory tracking, Point-of-Sale (POS) transactions, automated FEFO (First-Expiry-First-Out) stock allocation, tax-compliant invoicing, customer returns, audit logging, and financial/stock reconciliation.

### Operational Boundaries & Disclaimers
1. **Operational Focus Only:** This is strictly an operational inventory, supply chain, and billing platform. It does **not** provide clinical diagnosis, medical treatment recommendations, or drug interaction/dosage advice.
2. **Fictional Data Standard:** All seed datasets, supplier identities, customer profiles, product names, and transactions represent strictly fictional, simulated records. No real patient health information (PHI) or personally identifiable information (PII) is processed.
3. **No Fluff / No Fake Logic:** All metrics, calculations, stock movements, and alerts are backed by real database transactions in PostgreSQL with strict ACID guarantees.

---

## 2. User Roles & Server-Enforced Permissions

Access control is enforced strictly at the API layer (in Express authorization middleware and database queries), not merely via client-side UI toggles.

| Capability / Resource | Administrator (`ADMIN`) | Pharmacist (`PHARMACIST`) | Cashier (`CASHIER`) |
| :--- | :---: | :---: | :---: |
| **User & Staff Management** (Create/Update users, reset passwords, change roles) | Full Access | No Access | No Access |
| **System Settings & Audit Logs** (View system audit trail, configure taxes) | Full Access | View Only (Assigned) | No Access |
| **Catalogue & Categories** (Add/Edit medicines, categories, dosage units) | Full Access | Full Access | Read Only |
| **Supplier Management** (Manage vendor profiles, contact details) | Full Access | Read Only | No Access |
| **Purchases & Receiving** (Create PO drafts, receive shipments into batches) | Full Access | Full Access | No Access |
| **Batch Inventory & Stock Ledger** (View batch quantities, expiry dates, costs) | Full Access | Full Access | Read Available Quantities |
| **Stock Adjustments** (Damaged/write-off/found adjustments with reasons) | Full Access | Full Access (With Reason) | No Access |
| **POS Sales & Checkout** (Initiate sales, allocate FEFO stock, generate invoice) | Full Access | Full Access | Full Access |
| **Sales Invoices** (View historical invoices, print receipts) | Full Access | Full Access | Own Invoices / Shift Invoices |
| **Customer Returns** (Process returns against prior sales with disposition) | Full Access | Full Access | No Access (Escalate to Pharmacist/Admin) |
| **Reports & Analytics** (Sales reports, stock valuation, expiry warnings) | Full Access | Operational Reports | No Access |

---

## 3. System Architecture & Request Lifecycle

The application adopts a **Modular Monolith** pattern. Monolithic deployment minimizes operational complexity while maintaining strict domain boundary isolation through cohesive modules.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               Vite + React 19 Frontend                 │
                    │   (Feature Modules, Redux Toolkit, TanStack Query)     │
                    └──────────────────────────┬─────────────────────────────┘
                                               │ HTTPS / REST (JSON)
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                               Express 5 Application Monolith                               │
│                                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Global Middleware Pipeline: Helmet -> Strict CORS -> Request ID -> Rate Limiter       │  │
│  └───────────────────────────────────────────┬──────────────────────────────────────────┘  │
│                                              ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Module Router (e.g., /api/v1/sales, /api/v1/inventory, /api/v1/purchases)            │  │
│  └───────────────────────────────────────────┬──────────────────────────────────────────┘  │
│                                              ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Security & Validation Middleware: Authentication (JWT) -> Authorization (Role) ->    │  │
│  │ Zod Schema Validation (Body / Query / Params)                                        │  │
│  └───────────────────────────────────────────┬──────────────────────────────────────────┘  │
│                                              ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Controller Layer (HTTP serialization, status codes, metadata injection)              │  │
│  └───────────────────────────────────────────┬──────────────────────────────────────────┘  │
│                                              ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Service Layer (Business logic, state transitions, idempotency checks, calculations)   │  │
│  └───────────────────────────────────────────┬──────────────────────────────────────────┘  │
│                                              ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Data Access & Transaction Boundary (Prisma 7 ORM + Interactive PostgreSQL Tx)        │  │
│  └───────────────────────────────────────────┬──────────────────────────────────────────┘  │
└──────────────────────────────────────────────┼─────────────────────────────────────────────┘
                                               ▼
                         ┌───────────────────────────────────────────┐
                         │           PostgreSQL Database             │
                         │ (CHECK Constraints, Row Locks, Ledger)    │
                         └───────────────────────────────────────────┘
```

### Module Layout
- **Backend (`/backend/src/modules/`):**
  - `auth`: Credentials, Argon2id, JWT issuance, token rotation, sessions.
  - `users`: User administration, activation/deactivation, role assignment.
  - `categories`: Medicine classifications (e.g., Analgesics, Antibiotics, Antipyretics).
  - `medicines`: Base catalogue items (name, generic name, SKU, unit, tax rate, reorder level).
  - `suppliers`: Supplier directory, contact data, GSTIN/license tracking.
  - `purchases`: Purchase order drafts, line items, and atomic receiving into inventory.
  - `inventory`: Batch tracking, manual stock adjustments, FEFO allocation engine, expiry alerts.
  - `sales`: POS transaction execution, idempotency, invoice number generation, line item tax snapshots.
  - `returns`: Customer returns against specific sale items with disposition (restockable vs damaged).
  - `reports`: Aggregated sales metrics, batch stock valuation, and expiry timeline reports.
  - `audit`: Immutable event logging for sensitive operations (adjustments, returns, user management).
  - `settings`: Global pharmacy profile (name, address, tax rate defaults, currency).

- **Frontend (`/frontend/src/features/`):**
  - Matches the backend modules directly, encapsulating UI views, modal dialogs, data-fetching hooks (TanStack Query), form schemas (Zod), and slice state.

---

## 4. Database Schema & Data Invariants

PostgreSQL is the single source of truth. All monetary values are represented as `DECIMAL(12, 2)` to eliminate IEEE 754 floating-point inaccuracies. Primary keys are cryptographically secure `UUID` values.

### 4.1 Core Entities & Fields

1. **`User`**
   - `id`: UUID (PK)
   - `email`: VARCHAR(255) (UNIQUE, indexed)
   - `passwordHash`: VARCHAR(255) (Argon2id hash)
   - `fullName`: VARCHAR(100)
   - `role`: ENUM (`ADMIN`, `PHARMACIST`, `CASHIER`)
   - `isActive`: BOOLEAN (Default: true)
   - `createdAt`, `updatedAt`: TIMESTAMPTZ

2. **`RefreshToken`**
   - `id`: UUID (PK)
   - `userId`: UUID (FK -> User.id, ON DELETE CASCADE)
   - `tokenHash`: VARCHAR(255) (Cryptographic SHA-256 hash of opaque token)
   - `familyId`: UUID (Token rotation family tracking)
   - `isRevoked`: BOOLEAN (Default: false)
   - `expiresAt`: TIMESTAMPTZ
   - `createdAt`: TIMESTAMPTZ

3. **`Category`**
   - `id`: UUID (PK)
   - `name`: VARCHAR(100) (UNIQUE)
   - `description`: TEXT (Optional)
   - `createdAt`, `updatedAt`: TIMESTAMPTZ

4. **`Medicine`**
   - `id`: UUID (PK)
   - `categoryId`: UUID (FK -> Category.id, RESTRICT)
   - `name`: VARCHAR(200) (Indexed)
   - `genericName`: VARCHAR(200) (Indexed)
   - `sku`: VARCHAR(50) (UNIQUE)
   - `dosageForm`: VARCHAR(50) (e.g., Tablet, Capsule, Syrup, Injection)
   - `strength`: VARCHAR(50) (e.g., 500mg, 10ml)
   - `packageUnit`: VARCHAR(50) (e.g., Strip of 10, Bottle, Box)
   - `minReorderLevel`: INTEGER (Default: 20, CHECK >= 0)
   - `defaultTaxRate`: DECIMAL(5, 2) (Default: 12.00, CHECK >= 0)
   - `isActive`: BOOLEAN (Default: true)
   - `createdAt`, `updatedAt`: TIMESTAMPTZ

5. **`Supplier`**
   - `id`: UUID (PK)
   - `name`: VARCHAR(150) (Indexed)
   - `contactPerson`: VARCHAR(100)
   - `phone`: VARCHAR(20)
   - `email`: VARCHAR(255)
   - `address`: TEXT
   - `taxNumber`: VARCHAR(50) (GSTIN/Tax ID)
   - `isActive`: BOOLEAN (Default: true)
   - `createdAt`, `updatedAt`: TIMESTAMPTZ

6. **`Purchase`**
   - `id`: UUID (PK)
   - `purchaseNumber`: VARCHAR(50) (UNIQUE, e.g., `PO-YYYYMMDD-XXXX`)
   - `supplierId`: UUID (FK -> Supplier.id, RESTRICT)
   - `status`: ENUM (`DRAFT`, `RECEIVED`, `CANCELLED`)
   - `orderedDate`: TIMESTAMPTZ
   - `receivedDate`: TIMESTAMPTZ (NULL if draft)
   - `subtotal`: DECIMAL(12, 2) (CHECK >= 0)
   - `taxTotal`: DECIMAL(12, 2) (CHECK >= 0)
   - `grandTotal`: DECIMAL(12, 2) (CHECK >= 0)
   - `receivedByUserId`: UUID (FK -> User.id, NULLABLE)
   - `notes`: TEXT
   - `createdAt`, `updatedAt`: TIMESTAMPTZ

7. **`PurchaseItem`**
   - `id`: UUID (PK)
   - `purchaseId`: UUID (FK -> Purchase.id, ON DELETE CASCADE)
   - `medicineId`: UUID (FK -> Medicine.id, RESTRICT)
   - `batchNumber`: VARCHAR(100)
   - `manufacturingDate`: DATE (Optional)
   - `expiryDate`: DATE (Mandatory)
   - `orderedQuantity`: INTEGER (CHECK > 0)
   - `receivedQuantity`: INTEGER (CHECK >= 0)
   - `unitCost`: DECIMAL(12, 2) (CHECK >= 0)
   - `unitSalePrice`: DECIMAL(12, 2) (CHECK >= 0)
   - `lineTotal`: DECIMAL(12, 2) (CHECK >= 0)

8. **`Batch`** *(Core Inventory Entity)*
   - `id`: UUID (PK)
   - `medicineId`: UUID (FK -> Medicine.id, RESTRICT)
   - `batchNumber`: VARCHAR(100)
   - `purchaseItemId`: UUID (FK -> PurchaseItem.id, NULLABLE)
   - `manufacturingDate`: DATE (Optional)
   - `expiryDate`: DATE (Indexed)
   - `initialQuantity`: INTEGER (CHECK >= 0)
   - `currentQuantity`: INTEGER (CHECK >= 0, Indexed)
   - `purchaseCost`: DECIMAL(12, 2) (CHECK >= 0)
   - `salePrice`: DECIMAL(12, 2) (CHECK >= 0)
   - `mrp`: DECIMAL(12, 2) (CHECK >= 0, Optional)
   - `status`: ENUM (`ACTIVE`, `QUARANTINED`, `DEPLETED`, `EXPIRED`)
   - `createdAt`, `updatedAt`: TIMESTAMPTZ
   - *Constraints:* UNIQUE(`medicineId`, `batchNumber`)

9. **`StockMovement`** *(Immutable Inventory Ledger)*
   - `id`: UUID (PK)
   - `batchId`: UUID (FK -> Batch.id, RESTRICT)
   - `movementType`: ENUM (`PURCHASE_RECEIPT`, `SALE_DEDUCTION`, `CUSTOMER_RETURN`, `ADJUSTMENT_WRITE_OFF`, `ADJUSTMENT_RESTOCK`, `EXPIRED_DISPOSAL`)
   - `quantityDelta`: INTEGER (Positive for stock addition, negative for deduction)
   - `balanceAfter`: INTEGER (Running batch balance at movement time, CHECK >= 0)
   - `referenceId`: UUID (FK pointing to Sale.id, Purchase.id, Return.id, or Adjustment.id)
   - `performedByUserId`: UUID (FK -> User.id, RESTRICT)
   - `reason`: TEXT (Mandatory for returns and adjustments)
   - `createdAt`: TIMESTAMPTZ (Indexed)

10. **`Sale`**
    - `id`: UUID (PK)
    - `invoiceNumber`: VARCHAR(50) (UNIQUE, e.g., `INV-YYYYMMDD-XXXX`)
    - `cashierId`: UUID (FK -> User.id, RESTRICT)
    - `customerName`: VARCHAR(100) (Default: 'Walk-in Customer')
    - `customerPhone`: VARCHAR(20) (Optional)
    - `subtotal`: DECIMAL(12, 2) (CHECK >= 0)
    - `discountAmount`: DECIMAL(12, 2) (Default: 0.00, CHECK >= 0)
    - `taxAmount`: DECIMAL(12, 2) (CHECK >= 0)
    - `totalAmount`: DECIMAL(12, 2) (CHECK >= 0)
    - `paymentMethod`: ENUM (`CASH`, `CARD`, `UPI`, `SPLIT`)
    - `status`: ENUM (`COMPLETED`, `REFUNDED_PARTIAL`, `REFUNDED_FULL`, `CANCELLED`)
    - `idempotencyKey`: VARCHAR(100) (UNIQUE, nullable or indexed)
    - `createdAt`, `updatedAt`: TIMESTAMPTZ (Indexed)

11. **`SaleItem`**
    - `id`: UUID (PK)
    - `saleId`: UUID (FK -> Sale.id, ON DELETE CASCADE)
    - `medicineId`: UUID (FK -> Medicine.id, RESTRICT)
    - `batchId`: UUID (FK -> Batch.id, RESTRICT)
    - `quantity`: INTEGER (CHECK > 0)
    - `unitPrice`: DECIMAL(12, 2) (Price snapshot, CHECK >= 0)
    - `costPrice`: DECIMAL(12, 2) (Purchase cost snapshot, CHECK >= 0)
    - `taxRate`: DECIMAL(5, 2) (Tax percentage snapshot, CHECK >= 0)
    - `taxAmount`: DECIMAL(12, 2) (Line tax snapshot, CHECK >= 0)
    - `totalAmount`: DECIMAL(12, 2) (Line total snapshot, CHECK >= 0)

12. **`CustomerReturn`**
    - `id`: UUID (PK)
    - `returnNumber`: VARCHAR(50) (UNIQUE, e.g., `RET-YYYYMMDD-XXXX`)
    - `saleId`: UUID (FK -> Sale.id, RESTRICT)
    - `processedByUserId`: UUID (FK -> User.id, RESTRICT)
    - `reason`: TEXT (Mandatory)
    - `refundAmount`: DECIMAL(12, 2) (CHECK >= 0)
    - `createdAt`: TIMESTAMPTZ

13. **`ReturnItem`**
    - `id`: UUID (PK)
    - `returnId`: UUID (FK -> CustomerReturn.id, ON DELETE CASCADE)
    - `saleItemId`: UUID (FK -> SaleItem.id, RESTRICT)
    - `batchId`: UUID (FK -> Batch.id, RESTRICT)
    - `quantity`: INTEGER (CHECK > 0)
    - `refundAmount`: DECIMAL(12, 2) (CHECK >= 0)
    - `disposition`: ENUM (`RESTOCKED`, `DAMAGED_DISCARDED`)

14. **`StockAdjustment`**
    - `id`: UUID (PK)
    - `adjustmentNumber`: VARCHAR(50) (UNIQUE, e.g., `ADJ-YYYYMMDD-XXXX`)
    - `batchId`: UUID (FK -> Batch.id, RESTRICT)
    - `adjustmentType`: ENUM (`WRITE_OFF_DAMAGED`, `WRITE_OFF_EXPIRED`, `INVENTORY_COUNT_GAIN`, `INVENTORY_COUNT_LOSS`)
    - `quantityDelta`: INTEGER (Can be positive or negative, NOT 0)
    - `reason`: TEXT (Mandatory)
    - `approvedByUserId`: UUID (FK -> User.id, RESTRICT)
    - `createdAt`: TIMESTAMPTZ

15. **`AuditLog`**
    - `id`: UUID (PK)
    - `actorId`: UUID (FK -> User.id, NULLABLE)
    - `action`: VARCHAR(100) (e.g., `SALE_CREATED`, `PURCHASE_RECEIVED`, `STOCK_ADJUSTED`)
    - `entityName`: VARCHAR(50) (e.g., `Batch`, `Sale`, `Purchase`)
    - `entityId`: VARCHAR(50)
    - `ipAddress`: VARCHAR(45)
    - `userAgent`: TEXT
    - `diff`: JSONB (Safe snapshot of before/after changes)
    - `createdAt`: TIMESTAMPTZ (Indexed)

---

## 5. Critical Business Workflows & Invariants

### 5.1 Stock Reconciliation Invariant
The current stock of any batch is never a detached arbitrary number. It must always mathematically reconcile:
$$\text{Batch Current Stock} = \sum \text{StockMovement.quantityDelta}$$
$$\text{Batch Current Stock} = \text{Initial Received} + \text{Restocked Returns} + \text{Gains} - \text{Sales} - \text{Write-offs} - \text{Losses}$$

### 5.2 First-Expiry-First-Out (FEFO) Allocation Algorithm
When a cashier or pharmacist rings up a sale for $Q$ units of a medicine:
1. **Transaction Opening:** Execute inside a PostgreSQL transaction (`READ COMMITTED` or `SERIALIZABLE`).
2. **Batch Query & Row-Level Locking:**
   ```sql
   SELECT id, "currentQuantity", "expiryDate", "salePrice", "purchaseCost"
   FROM "Batch"
   WHERE "medicineId" = $1
     AND "currentQuantity" > 0
     AND "status" = 'ACTIVE'
     AND "expiryDate" >= CURRENT_DATE
   ORDER BY "expiryDate" ASC, "createdAt" ASC
   FOR UPDATE;
   ```
3. **Expiry Boundary Check:** Any batch where $\text{expiryDate} < \text{CURRENT\_DATE}$ (in local store timezone) is strictly disqualified.
4. **Greedy Allocation:** Allocate requested quantity starting from the earliest expiring batch until $Q$ is met.
5. **Shortage Rejection:** If aggregate eligible quantity $\sum \text{batch.currentQuantity} < Q$, immediately abort transaction with code `INSUFFICIENT_STOCK`. Do not perform partial deduction.
6. **Atomic Deduction & Ledger Insertion:**
   - Decrement each allocated `Batch.currentQuantity`.
   - Update `Batch.status = 'DEPLETED'` if `currentQuantity` hits 0.
   - Insert corresponding negative `StockMovement` records.
   - Record `SaleItem` rows with batch ID and price/tax snapshots.

### 5.3 Checkout Idempotency & Concurrency
- Clients submit an `Idempotency-Key` header with checkout requests.
- If the same key is submitted with the exact same payload within 12 hours, the server returns the cached prior response without re-executing transactions.
- If the same key is submitted with a altered payload, reject with `409 Conflict`.
- Row-level `FOR UPDATE` prevents concurrent checkouts from overselling remaining inventory.

### 5.4 Customer Return Invariants
- A return must reference an existing completed sale line item.
- Cumulative returned quantity for any `SaleItem`:
  $$\sum \text{Prior Returned Quantity} + \text{New Returned Quantity} \le \text{SaleItem.quantity}$$
- If disposition is `RESTOCKED`, batch quantity increases and a positive `StockMovement` is recorded.
- If disposition is `DAMAGED_DISCARDED`, batch quantity remains unchanged, but a return financial credit is recorded.
- Reason field is mandatory (minimum 5 characters).

---

## 6. UI / UX Design System

### 6.1 Visual Direction & Brand Identity
The UI adopts a restrained, operational aesthetic:
- **Style:** Bento grid dashboard + Swiss editorial typography + subtle glassmorphism in modal sheets and command bars.
- **Palette:**
  - **Forest Primary (`#355B48`):** Dominant brand color for primary actions, navigation active states, and headings.
  - **Forest Dark (`#294B39`):** Hover and pressed states.
  - **Sage Secondary (`#91B49B`):** Dark theme accent and status badges.
  - **Warm Accent (`#D6A96B`):** Attention callouts, pending tags, low-stock warnings.
  - **Light Background (`#F7F8F5`):** Soft, low-strain canvas background.
  - **Light Surface (`#FFFFFF`):** Clean white cards with crisp `#E3E8E1` borders.
  - **Dark Background (`#171C19`):** Deep earthy background.
  - **Dark Surface (`#222A25`):** Distinct elevated container surfaces with `#37433B` borders.

### 6.2 Theme Tokens & Persistence
- Preferences supported: `light`, `dark`, and `system`.
- User selection is stored in Redux Toolkit and persisted via `redux-persist` under `app-preferences` in `localStorage`.
- No sensitive user tokens or API secrets are ever stored in `localStorage`.
- Root HTML tag responds to `data-theme="light|dark"`.

### 6.3 Accessibility & Responsive Guidelines
- Conforms to **WCAG 2.1 AA** color contrast ratios ($\ge 4.5:1$ for normal body text).
- Responsive down to 360px viewport widths with collapsible slide-over navigation.
- Desktop POS supports full keyboard navigation (e.g., `F2` focus search, `Enter` add item, `F9` complete checkout).
- Empty states, loading skeletons, and inline field error feedback on all interactive views.

---

## 7. API Architecture & Standard Contracts

All endpoints are versioned under the `/api/v1` namespace.

### 7.1 Unified Response Envelope
**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "timestamp": "2026-11-07T17:30:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 25,
      "totalRecords": 120,
      "totalPages": 5
    }
  }
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid purchase order payload.",
    "details": [
      {
        "field": "items[0].expiryDate",
        "issue": "Expiry date must be in the future."
      }
    ]
  },
  "meta": {
    "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "timestamp": "2026-11-07T17:30:00.000Z"
  }
}
```

### 7.2 Standard Error Codes
- `UNAUTHORIZED`: Missing or expired access token.
- `FORBIDDEN`: User role lacks required permission.
- `VALIDATION_ERROR`: Zod schema validation failed on incoming request.
- `INSUFFICIENT_STOCK`: Requested medicine quantity exceeds available active non-expired stock.
- `EXPIRED_BATCH_BLOCKED`: Attempted to sell or allocate expired batch.
- `IDEMPOTENCY_CONFLICT`: Concurrent or conflicting payload using prior key.
- `RESOURCE_NOT_FOUND`: Target entity ID does not exist.
- `INTERNAL_SERVER_ERROR`: Unhandled exception (sanitized in production).

---

## 8. Security Architecture & Threat Model

### 8.1 Authentication & Session Management
- **Password Security:** Scrypt / Argon2id with 64MB memory cost, 3 iterations, and 4 parallelism lanes. Plaintext passwords never logged.
- **Access Tokens:** Signed JWT with 15-minute expiration containing `sub` (User ID) and `role`.
- **Refresh Tokens:** Opaque 256-bit entropy tokens stored exclusively in `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
- **Server-Side Token Storage:** Only the cryptographic SHA-256 hash of the refresh token is stored in `RefreshToken.tokenHash`.
- **Token Rotation & Family Reuse Detection:** Every refresh request issues a new token and revokes the old one. If an already-used token is presented, the entire token family is immediately revoked to neutralize replay attacks.

### 8.2 Defense-in-Depth Measures
- **Helmet:** Automated security headers (HSTS, X-Content-Type-Options: nosniff, Frameguard).
- **Strict CORS:** Environment-driven allowlist rejecting unauthorized origins; credentials enabled only for explicit frontend origin.
- **Rate Limiting:** Sliding-window rate limiter on `/api/v1/auth/*` (maximum 10 failed attempts per 15 minutes per IP).
- **IDOR Protection:** Explicit authorization checks verifying whether the acting user is permitted to view or mutate the targeted resource ID.
- **Injection Mitigation:** Prisma ORM parameterization guarantees elimination of SQL injection vulnerabilities.

---

## 9. Privacy, Legal & Demo Policy

1. **Simulated Pharmacy Disclaimer:** PharmaPulse is a software demonstration environment created for assessment and portfolio evaluation. It does not interface with actual regulatory pharmaceutical databases (e.g., FDA, EMA, CDSCO).
2. **No Real Personal Data:** Users must only populate fictional customer and supplier records.
3. **Session Cookies Notice:** Cookies are strictly utilized for session authentication and CSRF mitigation. No third-party tracking, analytics beacons, or ad network scripts are included.
4. **Data Retention & Reset:** Demo database seed scripts allow resetting the operational ledger to default deterministic state at any time.

---

## 10. Assignment Acceptance Criteria (Release Blockers)

The application cannot be marked complete until the following five critical acceptance tests pass with verified automated test execution:

1. **FEFO Deductions & Stock Movement Ledger:** A sale deducts inventory from the batch with the earliest expiry date and writes an immutable `StockMovement` entry with matching negative delta.
2. **Expired Batch Sale Block:** A batch past its expiry date is automatically filtered from POS search and rejected by the backend checkout service with `EXPIRED_BATCH_BLOCKED`.
3. **Near-Expiry & Low-Stock Warning Engine:** Dashboard and inventory screens highlight batches expiring within 30/60/90 days and medicines falling below `minReorderLevel`.
4. **Auditable Returns & Adjustments:** Every return and stock write-off enforces a non-blank reason string and records an immutable ledger entry.
5. **Stock Ledger Reconciliation:** A generated stock report mathematically verifies that $\text{Opening} + \text{Purchases} - \text{Sales} \pm \text{Adjustments} = \text{Closing Stock}$.

---

## 11. Multi-Day Implementation Roadmap

### Day 1: Foundation, Data Models & Application Shell
- **Backend:** Express 5 setup, Prisma 7 configuration, PostgreSQL connection pooling, migrations, database seeders, centralized error handler, logger, and health endpoint.
- **Frontend:** Vite 6 + React 19 bootstrap, Tailwind CSS v4 design tokens, Redux Toolkit store (theme/sidebar), base UI primitives, and layout shell.
- **Verification:** Database migration runs cleanly, seed completes deterministically, health check responds `200 OK`.

### Day 2: Catalogue, Suppliers & Batch Inventory
- **Backend:** Auth module (Argon2id, JWT, cookies), User management, Category CRUD, Medicine catalogue, Supplier CRUD, Purchase receiving engine, Batch creation, and Stock movements.
- **Frontend:** Login page, session management, Medicine & Category views, Supplier directory, Purchase order creation and receiving wizard.
- **Verification:** Unit tests for batch creation, integration tests for purchase receiving creating positive movements.

### Day 3: POS, FEFO Engine, Invoicing & Returns
- **Backend:** POS checkout transaction, FEFO allocation algorithm with row-level locks, server-side tax/discount calculation, unique invoice generator, returns with restock/damage disposition, adjustments.
- **Frontend:** Fast-action POS interface, batch selector, invoice print preview modal, return processing dialog, adjustments form, low-stock/expiry alert badges.
- **Verification:** Concurrency tests for FEFO allocation, negative tests for expired batches, test for duplicate idempotency submission.

### Day 4: Reports, Audit Logs, Hardening & Final Documentation
- **Backend:** Sales reporting, inventory valuation report, expiry analytics, audit trail API, OpenAPI / Swagger documentation generation.
- **Frontend:** Interactive reports with Recharts, Audit log explorer, Privacy / Terms / Legal pages, responsive mobile drawer testing.
- **Verification:** Automated test suite execution (Vitest + Supertest), linting, build checks, and test evidence report compilation.
