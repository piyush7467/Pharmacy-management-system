# Threat Model & Security Architecture — PharmaPulse

> **Application:** PharmaPulse Pharmacy Management System  
> **Framework:** STRIDE Threat Modeling Methodology  
> **Status:** Baseline Threat Assessment (Version 1.0.0)  

---

## 1. System Context & Trust Boundaries

```
[ Unauthenticated Browser / Mobile User ]
                 │
  Boundary 1: Network / Internet (TLS Encryption, Reverse Proxy, Cloudflare/WAF)
                 ▼
[ Ingress Controller & Security Middleware (Helmet, CORS, Rate Limiter) ]
                 │
  Boundary 2: Application Boundary (JWT Authentication, RBAC Guard, Zod Validation)
                 ▼
[ Service & Domain Logic (FEFO Engine, Invoicing, Ledger Calculator) ]
                 │
  Boundary 3: Storage & Persistence (Prisma ORM, Parameterized Queries)
                 ▼
[ PostgreSQL Database (ACID Transactions, Row-Level Locks, Constraint Triggers) ]
```

---

## 2. Key Assets to Protect

1. **Inventory Integrity & Quantity Accuracy:** Stock counts directly impact financial audits and healthcare supply availability. Prevent unauthorized increments or silent deductions.
2. **Financial Records & Price History:** Historical invoice amounts, discount percentages, and tax liabilities must remain tamper-proof.
3. **Authentication Secrets & Refresh Sessions:** Admin and staff credentials, password hashes, and session cookies.
4. **Audit Trail Immutability:** Records of stock adjustments, damaged write-offs, and user privilege alterations.
5. **System Availability:** The POS checkout path must resist race-condition deadlocks and denial-of-service attempts.

---

## 3. STRIDE Threat Analysis & Mitigations

| Threat Category | Specific Threat Scenario | Severity | Mitigation & Architectural Control |
| :--- | :--- | :---: | :--- |
| **Spoofing** | Attacker crafts a forged JWT or attempts credential stuffing on `/api/v1/auth/login`. | **High** | Strong cryptographic signing key (`ACCESS_TOKEN_SECRET`), short access token lifetime (15 min), Argon2id password hashing, and strict IP-based rate limiting on auth endpoints. |
| **Spoofing** | Stolen refresh token reused by adversary. | **High** | Automatic token rotation with family ID tracking. If an already-rotated token is presented, the entire family is immediately revoked, forcing re-authentication. |
| **Tampering** | Rogue client alters line-item price, tax calculation, or discounts in checkout payload. | **Critical** | The backend ignores client-submitted prices. Unit prices, tax rates, and totals are computed strictly server-side using current batch data. |
| **Tampering** | Concurrent sales requests attempt to oversell the final remaining units of medicine. | **High** | PostgreSQL transactions with `SELECT ... FOR UPDATE` row-level locks on eligible batches, followed by atomic quantity verification. |
| **Tampering** | Silent alteration of inventory numbers in database. | **High** | No direct arbitrary edits allowed. Any stock adjustment requires an explicit reason, user attribution, and writes to the immutable `StockMovement` ledger. |
| **Repudiation** | Staff member writes off expensive medicine as "damaged" and denies action. | **Medium** | All adjustments and customer returns require a mandatory reason string and generate an unalterable `AuditLog` entry with user ID, timestamp, and IP address. |
| **Information Disclosure** | Token theft via Cross-Site Scripting (XSS). | **High** | Refresh tokens are stored exclusively in `HttpOnly`, `SameSite=Strict`, `Secure` cookies. No JWTs or sensitive user information are ever persisted in `localStorage`. |
| **Information Disclosure** | Database error stack traces and internal SQL queries returned to client. | **Medium** | Centralized Express error handler catches all unhandled exceptions, logs internal details to secure server logs, and returns a sanitized generic error envelope to the client. |
| **Information Disclosure** | Account enumeration via login error messages. | **Low** | Uniform error response (`"Invalid email or password"`) for both non-existent users and bad passwords. |
| **Denial of Service** | Flooding POS checkout with duplicate requests, causing database lock starvation. | **Medium** | Mandatory `Idempotency-Key` headers on `/api/v1/sales`. Duplicate keys return cached responses without re-executing transactions. Rate limiting applied at ingress. |
| **Elevation of Privilege** | Cashier sends crafted HTTP requests to Admin endpoints (e.g., `/api/v1/users` or `/api/v1/inventory/adjustments`). | **Critical** | Server-enforced RBAC middleware checks `req.user.role` on every protected route. Frontend route hiding is treated purely as UX convenience. |
| **Elevation of Privilege** | Insecure Direct Object Reference (IDOR) on invoices or staff profiles. | **Medium** | Explicit tenant and role authorization checks ensure cashiers can only query their own sales or authorized shift receipts. |

---

## 4. Residual Risks & Production Recommendations

1. **Database Direct Access:** If an attacker gains direct superuser access to PostgreSQL, foreign keys and constraints can be modified. Production deployments must enforce least-privilege DB users (runtime user cannot execute `DROP TABLE` or `ALTER SCHEMA`).
2. **CSRF on State-Changing Endpoints:** Mitigated by `SameSite=Strict` cookie policies on all refresh endpoints; for extra defense, standard CORS preflights and custom headers (`X-Requested-With` or `Authorization: Bearer`) prevent blind browser form submissions.
3. **Local Store Clock Skew:** Expiry validation relies on server clock. Production servers must synchronize with NTP to ensure date-boundary checks remain accurate.
