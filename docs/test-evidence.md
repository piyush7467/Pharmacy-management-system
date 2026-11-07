# Automated & Acceptance Test Evidence — PharmaPulse

> **System:** PharmaPulse Pharmacy Management System  
> **Test Frameworks:** Vitest (Unit/Integration) + Supertest (HTTP/API Integration)  
> **Target Database:** Isolated PostgreSQL Test Database  
> **Status:** Test Specification & Execution Log Template  

---

## 1. Assignment Acceptance Criteria Matrix (Release Blockers)

| # | Acceptance Requirement | Test Case Identifier | Method | Status |
| :-: | :--- | :--- | :--- | :---: |
| **1** | A sale deducts quantity from the correct batch and records an immutable stock movement. | `TEST-ACCEPT-001` | Integration / DB Transaction | Pending Day 3 |
| **2** | An expired batch cannot be sold under any circumstances. | `TEST-ACCEPT-002` | Integration / Negative Case | Pending Day 3 |
| **3** | The system warns about low-stock medicines and near-expiry batches. | `TEST-ACCEPT-003` | API & UI Alert Engine | Pending Day 3 |
| **4** | Returns and inventory adjustments require a reason and are fully auditable. | `TEST-ACCEPT-004` | API Validation & Ledger Check | Pending Day 3 |
| **5** | Stock report reconciles opening stock, purchases, sales, and adjustments. | `TEST-ACCEPT-005` | Mathematical Ledger Audit | Pending Day 4 |

---

## 2. Detailed Test Specifications

### `TEST-ACCEPT-001`: FEFO Batch Deduction & Stock Movement
- **Given:** A medicine has two active batches:
  - Batch A: 10 units, expires in 30 days.
  - Batch B: 15 units, expires in 90 days.
- **When:** A cashier submits a sale for 12 units.
- **Then:**
  - 10 units are deducted from Batch A (balance = 0, status = `DEPLETED`).
  - 2 units are deducted from Batch B (balance = 13, status = `ACTIVE`).
  - Two `StockMovement` entries are created:
    - Batch A: `delta = -10`, `balanceAfter = 0`, `movementType = 'SALE_DEDUCTION'`.
    - Batch B: `delta = -2`, `balanceAfter = 13`, `movementType = 'SALE_DEDUCTION'`.
  - Transaction commits atomically.

### `TEST-ACCEPT-002`: Expired Batch Sale Exclusion
- **Given:** A batch has 20 units in stock, but its `expiryDate` is yesterday (`CURRENT_DATE - 1`).
- **When:** A checkout request targets this medicine.
- **Then:**
  - The FEFO engine filters out the expired batch.
  - If no other non-expired batches exist, the checkout returns `422 Unprocessable Entity` with code `INSUFFICIENT_STOCK`.
  - Batch stock remains untouched at 20.
  - Zero stock movement records are created.

### `TEST-ACCEPT-003`: Low-Stock & Near-Expiry Alert Verification
- **Given:**
  - Medicine X has `minReorderLevel = 25` and current batch stock = 18 units.
  - Batch Y has `expiryDate = CURRENT_DATE + 15 days`.
- **When:** Calling `GET /api/v1/inventory/alerts/low-stock` and `GET /api/v1/inventory/alerts/near-expiry?thresholdDays=30`.
- **Then:**
  - Medicine X appears in low-stock alerts with shortage count of 7 units.
  - Batch Y appears in near-expiry alerts with urgency flag `URGENT` (< 30 days).

### `TEST-ACCEPT-004`: Auditable Returns & Adjustments With Mandatory Reasons
- **Given:** A completed sale of 5 units.
- **When A:** Submitting a return with an empty reason string (`""`).
  - **Then A:** API returns `400 Bad Request` with validation error `"Reason must be at least 5 characters"`.
- **When B:** Submitting a return for 2 units with reason `"Broken seal reported upon opening"` and disposition `DAMAGED_DISCARDED`.
  - **Then B:** Return is accepted, refund amount calculated, `StockMovement` recorded with `quantityDelta = 0` (no restock), and `AuditLog` entry created with cashier user ID.

### `TEST-ACCEPT-005`: Ledger Stock Reconciliation Test
- **Given:** Seeded batches with various initial purchases, sales, customer returns, and adjustments.
- **When:** Calling `GET /api/v1/reports/reconciliation`.
- **Then:**
  - For every batch in the system:
    $$\text{currentQuantity} = \sum_{\text{movements}} \text{quantityDelta}$$
  - Discrepancy report lists zero variance.

---

## 3. Auxiliary Test Scenarios (Security & Concurrency)

1. **`TEST-SEC-001` — Role Bypass Attempt:** Cashier attempts `POST /api/v1/users` -> Expect `403 Forbidden`.
2. **`TEST-SEC-002` — Missing/Invalid JWT:** Anonymous request to `/api/v1/sales` -> Expect `401 Unauthorized`.
3. **`TEST-CONCUR-001` — Race Condition Under Stock Shortage:** 2 concurrent requests attempt to buy 5 units from a batch with only 6 units remaining -> Expect exactly 1 to succeed and 1 to be rejected with `INSUFFICIENT_STOCK`. Batch balance ends at 1.
4. **`TEST-IDEM-001` — Duplicate Sale Submission:** Same `Idempotency-Key` sent twice with identical body -> Expect second request to return identical invoice without decrementing stock a second time.

---

## 4. Test Execution Log (To Be Updated During Implementation)

```text
[Day 1 Foundation Check]
- Prisma Schema Validation: Pending
- Database Migrations Check: Pending
- Seed Script Repeatability: Pending
- Healthcheck Endpoint Test: Pending

[Day 2 Catalogue & Inventory Check]
- Auth Token Flow & Refresh Rotation: Pending
- Purchase Draft -> Receive Atomic Transition: Pending
- Category & Medicine CRUD Tests: Pending

[Day 3 POS & Business Logic Check]
- TEST-ACCEPT-001 (FEFO Deduction): Pending
- TEST-ACCEPT-002 (Expired Block): Pending
- TEST-ACCEPT-003 (Alerts Engine): Pending
- TEST-ACCEPT-004 (Return/Adjust Audit): Pending
- TEST-CONCUR-001 (Concurrency Lock): Pending
- TEST-IDEM-001 (Idempotency): Pending

[Day 4 Final Regression Check]
- TEST-ACCEPT-005 (Ledger Reconciliation): Pending
- Frontend Production Build: Pending
- Vitest Full Suite: Pending
```
