# API Overview & Endpoint Specifications — PharmaPulse

> **Base URL:** `/api/v1`  
> **Protocol:** REST over HTTPS  
> **Format:** JSON (`application/json`)  
> **Auth:** Header `Authorization: Bearer <accessToken>` + Cookie `refreshToken`  

---

## 1. Unified Response Contracts

### 1.1 Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "c1f7b82e-6d43-4a1e-8a21-729d33bcf0a2",
    "timestamp": "2026-11-07T18:00:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalRecords": 85,
      "totalPages": 5
    }
  }
}
```

### 1.2 Error Response (`400`, `401`, `403`, `404`, `409`, `422`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted payload has invalid fields.",
    "details": [
      {
        "field": "items[0].quantity",
        "issue": "Quantity must be greater than zero."
      }
    ]
  },
  "meta": {
    "requestId": "c1f7b82e-6d43-4a1e-8a21-729d33bcf0a2",
    "timestamp": "2026-11-07T18:00:00.000Z"
  }
}
```

---

## 2. Role-Based Access Control (RBAC) Matrix

| Endpoint Group | `ADMIN` | `PHARMACIST` | `CASHIER` |
| :--- | :---: | :---: | :---: |
| `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me` | Allowed | Allowed | Allowed |
| `/users/**` | Full CRUD | Denied | Denied |
| `/categories/**` | Full CRUD | Full CRUD | Read Only |
| `/medicines/**` | Full CRUD | Full CRUD | Read Only |
| `/suppliers/**` | Full CRUD | Read Only | Denied |
| `/purchases/**` | Full CRUD | Draft & Receive | Denied |
| `/inventory/batches` | Full Access | Full Access | Read Active/Available |
| `/inventory/adjustments` | Full Access | Create with Reason | Denied |
| `/inventory/alerts/**` | Full Access | Full Access | Low Stock Warning |
| `/sales` (POST - Checkout) | Allowed | Allowed | Allowed |
| `/sales` (GET - All Sales) | Full Access | Full Access | Own Sales Only |
| `/sales/:id/invoice` | Full Access | Full Access | Allowed |
| `/returns` | Full Access | Create & View | Denied |
| `/reports/**` | Full Access | Operational Reports | Denied |
| `/audit-logs` | Full Access | Denied | Denied |

---

## 3. Core Endpoint Catalog

### 3.1 Authentication Module (`/auth`)

- `POST /api/v1/auth/login`
  - **Body:** `{ "email": "admin@pharmapulse.demo", "password": "Password@123" }`
  - **Returns:** `{ "user": { ... }, "accessToken": "jwt.token.string" }` + Sets `HttpOnly` cookie for `refreshToken`.
- `POST /api/v1/auth/refresh`
  - **Headers/Cookies:** Refresh token cookie.
  - **Returns:** New `accessToken` and rotates `refreshToken` cookie.
- `POST /api/v1/auth/logout`
  - **Returns:** Revokes active refresh token family and clears cookies.
- `GET /api/v1/auth/me`
  - **Returns:** Current authenticated user profile and permissions.

### 3.2 Medicines & Catalogue Module (`/medicines`)

- `GET /api/v1/medicines`
  - **Query:** `?search=paracetamol&categoryId=...&page=1&limit=20`
  - **Returns:** Paginated list of medicines with total available stock across active non-expired batches.
- `POST /api/v1/medicines` *(Admin / Pharmacist)*
  - **Body:**
    ```json
    {
      "name": "Paracetamol 500mg",
      "genericName": "Acetaminophen",
      "categoryId": "4b6c...uuid",
      "sku": "MED-PAR-500",
      "dosageForm": "Tablet",
      "strength": "500mg",
      "packageUnit": "Strip of 10",
      "minReorderLevel": 50,
      "defaultTaxRate": 12.0
    }
    ```
- `GET /api/v1/medicines/:id`
  - **Returns:** Medicine record with batch list breakdown.

### 3.3 Purchases & Receiving Module (`/purchases`)

- `POST /api/v1/purchases` *(Admin / Pharmacist)*
  - Creates a Purchase Order in `DRAFT` status.
- `POST /api/v1/purchases/:id/receive` *(Admin / Pharmacist)*
  - **Purpose:** Atomically transitions purchase from `DRAFT` to `RECEIVED`.
  - **Transaction:**
    1. Validates all purchase items and batch expiry dates ($\text{expiryDate} > \text{CURRENT\_DATE}$).
    2. Upserts `Batch` rows for each received line item.
    3. Writes positive `StockMovement` records of type `PURCHASE_RECEIPT`.
    4. Sets purchase status to `RECEIVED` and logs audit event.

### 3.4 POS & Sales Checkout Module (`/sales`)

- `POST /api/v1/sales`
  - **Headers:** `Idempotency-Key: <uuid-or-unique-string>`
  - **Body:**
    ```json
    {
      "customerName": "Walk-in Customer",
      "customerPhone": "9876543210",
      "paymentMethod": "CASH",
      "discountAmount": 0.0,
      "items": [
        {
          "medicineId": "6f2e...uuid",
          "quantity": 2
        }
      ]
    }
    ```
  - **Execution (FEFO Engine):**
    - Identifies eligible active batches ordered by earliest `expiryDate`.
    - Locks batch rows (`FOR UPDATE`).
    - Validates no expired batches are used.
    - Allocates quantity across batches.
    - Deducts stock, creates `StockMovement` (type `SALE_DEDUCTION`), and creates `Sale` + `SaleItem` with price snapshots.
  - **Returns:** Complete Sale record with generated invoice number (e.g., `INV-20261107-0042`).

- `GET /api/v1/sales/:id/invoice`
  - **Returns:** Formatted invoice data suitable for print view and thermal receipt rendering.

### 3.5 Customer Returns Module (`/returns`)

- `POST /api/v1/returns` *(Admin / Pharmacist)*
  - **Body:**
    ```json
    {
      "saleId": "8a3d...uuid",
      "reason": "Customer bought incorrect dosage form; sealed pack returned.",
      "items": [
        {
          "saleItemId": "9c1a...uuid",
          "quantity": 1,
          "disposition": "RESTOCKED"
        }
      ]
    }
    ```
  - **Execution:** Validates quantity ceiling, increments batch stock if `RESTOCKED`, writes `StockMovement` (type `CUSTOMER_RETURN`), and records financial refund balance.

### 3.6 Inventory Alerts & Adjustments (`/inventory`)

- `GET /api/v1/inventory/alerts/low-stock`
  - Returns medicines where $\sum \text{Batch.currentQuantity} \le \text{Medicine.minReorderLevel}$.
- `GET /api/v1/inventory/alerts/near-expiry`
  - **Query:** `?thresholdDays=60`
  - Returns active batches where `expiryDate <= CURRENT_DATE + thresholdDays`.
- `POST /api/v1/inventory/adjustments` *(Admin / Pharmacist)*
  - Requires `batchId`, `adjustmentType`, `quantityDelta`, and mandatory `reason`.

### 3.7 Reports & Analytics (`/reports`)

- `GET /api/v1/reports/sales-summary?startDate=...&endDate=...`
  - Total revenue, gross margin, tax collections, transaction counts, and payment method distribution.
- `GET /api/v1/reports/stock-valuation`
  - Total inventory valuation based on $\text{currentQuantity} \times \text{purchaseCost}$.
- `GET /api/v1/reports/reconciliation`
  - Verification matrix checking that ledger movements match actual current batch stock totals.
