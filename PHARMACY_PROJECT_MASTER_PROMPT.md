# Pharmacy Management System — Master Engineering Specification & AI Development Prompt

> **Project:** Pharmacy Management System  
> **Assessment:** ALGIONS AI LABS PRIVATE LIMITED — Full-Stack Web Development Intern  
> **Deadline context:** 3–4 day intensive MVP build  
> **Architecture:** Modular monolith, MVC backend, feature-based frontend  
> **Primary stack:** React + Vite + Node.js + Express + PostgreSQL + Prisma  
> **Design direction:** Hybrid editorial + bento + restrained glassmorphism; sage/forest accent; light/dark/system themes

---

# PART A — MASTER PROMPT FOR THE CODING AGENT

Act as a senior full-stack engineer, application security engineer, database designer, QA engineer and product designer. Build a complete, professional, responsive, database-backed Pharmacy Management System that satisfies the supplied ALGIONS AI LABS PRIVATE LIMITED assignment.

Do not build unrelated domains. Do not produce a static mockup or a collection of disconnected CRUD screens. Deliver a working, explainable, maintainable MVP with end-to-end customer/staff workflows, meaningful tests, documentation and a reproducible local setup.

## 1. Mandatory working approach

1. Inspect the existing repository before changing anything. Preserve valid work; do not overwrite files blindly.
2. Read the assignment and this specification. Create/update `PROJECT_SPECIFICATION.md` before substantial implementation.
3. First produce a concise implementation plan, architecture, ER diagram, API outline, threat model and acceptance-test matrix.
4. Work in small, verifiable milestones. After each milestone, run formatting, linting, type/build checks and relevant tests. Fix failures before proceeding.
5. Never claim a feature, test, deployment or security control works unless it has actually been implemented and verified.
6. Do not leave critical paths as TODOs, fake buttons, hardcoded dashboard metrics, mock API responses or local-only state.
7. If a requirement cannot fit the 3–4 day MVP, document it explicitly as a limitation. Do not silently omit it or pretend it is complete.
8. Prefer a correct working MVP over breadth. The five assignment acceptance tests are release blockers.
9. Do not invent package APIs. Consult current official documentation for the installed major version before using unfamiliar APIs.
10. Do not downgrade packages or copy outdated tutorials merely to make code compile. Resolve incompatibilities using supported current APIs.

## 2. Product objective and users

Build a pharmacy operations application for fictional demo data only. The system supports:

- Pharmacy administrators
- Pharmacists
- Cashiers / sales staff

The application manages medicine catalogue, categories, suppliers, purchase receiving, batch-wise inventory, POS sales, invoices, returns, stock adjustments, expiry alerts, reports and audit history.

It is an operational inventory and billing system, not a medical diagnosis or treatment application. Do not provide medicine recommendations, dosage instructions or medical advice. Use fictional product names and clearly label seed/demo data.

### Role permissions

Define server-enforced permissions, not UI-only hiding.

- **ADMIN:** manage users and roles, catalogue, suppliers, purchases, inventory adjustments, sales, returns, reports, settings and audit logs.
- **PHARMACIST:** view catalogue and inventory, manage permitted medicine/batch operations, process sales and returns, view operational reports.
- **CASHIER:** search available medicines, create sales, view/print invoices and access only the minimum sales information needed.

Use least privilege. Enforce permissions in backend middleware/service layer on every protected operation. A frontend route guard is only a UX convenience.

## 3. Technology choices and dependency policy

Use a single repository with separate `frontend/` and `backend/` applications.

### Frontend

- React using the current stable release supported by the selected Vite version.
- Vite using its current stable release.
- JavaScript with JSX (do not introduce TypeScript unless the repository already uses it or the owner explicitly chooses it).
- Tailwind CSS v4 using the official Vite integration.
- React Router current stable version.
- Redux Toolkit and React Redux for global client preferences and genuinely global UI state.
- Redux Persist only for safe preferences such as theme and sidebar state. Do not persist access tokens, refresh tokens, permissions, sensitive records or server cache in localStorage.
- TanStack Query for server-state fetching, caching, invalidation and mutation lifecycle.
- Axios for a centralized API client, or native `fetch` if consistently implemented. Do not duplicate API clients.
- React Hook Form + Zod for form state and validation.
- Lucide React for icons.
- Recharts for reports/charts.
- Accessible reusable UI primitives. Use a maintained component library only if it fits the design and current React/Tailwind versions; avoid installing multiple overlapping UI kits.

### Backend

- Node.js active LTS release at implementation time.
- Express current maintained stable major.
- JavaScript ES modules consistently (`"type": "module"`), unless the existing repository uses a different consistent module system.
- Prisma ORM current stable major (Prisma 7 at the time this specification was prepared), following the current PostgreSQL driver-adapter and configuration setup in official docs.
- PostgreSQL current supported stable release.
- Zod for server-side request validation.
- Argon2id for password hashing.
- A maintained JWT library or secure opaque refresh-token implementation. Verify current maintenance and security status before choosing.
- Helmet, strict CORS allowlist, rate limiting, secure cookie configuration and structured logging.
- OpenAPI 3 documentation, generated or maintained alongside routes.
- Vitest and Supertest for tests.

### Package hygiene — mandatory

- Use `npm view <package> version`, package release notes and official docs to confirm current stable releases.
- Install current compatible stable releases; do not hardcode old tutorial versions.
- Commit `package-lock.json` and use `npm ci` for reproducible installs.
- Run `npm outdated` and `npm audit` before final submission; investigate findings and remediate or document unavoidable transitive issues.
- Do not use deprecated packages/APIs, abandoned libraries, unmaintained JWT packages, old Tailwind configuration patterns, old Prisma client setup or obsolete React lifecycle APIs.
- Do not use `--force` or `--legacy-peer-deps` to hide dependency conflicts.
- Do not blindly run `npm audit fix --force`.
- Avoid unnecessary dependencies. Prefer platform APIs for simple functionality.
- Record package versions and any known dependency limitations in README.
- Never state “no vulnerabilities” solely because `npm audit` reports zero issues. Explain the scope and date of the audit.

## 4. Architecture

Use a **modular monolith**. Microservices are explicitly unnecessary.

### Backend MVC + service/repository separation

Use this request flow:

`Router → Authentication → Authorization → Validation → Controller → Service → Repository/Prisma → PostgreSQL`

- **Routes:** endpoint declaration and middleware composition only.
- **Middleware:** authentication, role/permission checks, validation, request ID, rate limits and centralized errors.
- **Controllers:** HTTP input/output mapping only; no business rules or raw complex SQL.
- **Services:** business rules, transactions, orchestration and state transitions.
- **Repositories:** database access and query composition. Use them where they improve separation; avoid pointless wrappers around every Prisma call.
- **Models:** Prisma schema and domain-level constants/types.
- **Validators:** Zod schemas for params, query strings and request bodies.
- **Utilities:** invoice numbering, pagination, money helpers, date handling and response helpers.
- **Tests:** unit tests for services and integration/API tests against a test database.

Each module owns its routes, controller, service, validation and repository where applicable.

Suggested backend modules:
`auth`, `users`, `categories`, `medicines`, `suppliers`, `purchases`, `inventory`, `sales`, `returns`, `reports`, `audit`, `settings`.

### Frontend feature-based architecture

Organize by business feature, not by a giant collection of generic components.

Suggested frontend areas:
`auth`, `dashboard`, `medicines`, `categories`, `suppliers`, `purchases`, `inventory`, `pos`, `sales`, `returns`, `reports`, `audit`, `settings`.

Shared areas:
`app`, `components/ui`, `components/layout`, `hooks`, `lib`, `services/api`, `routes`, `styles`.

Keep feature-specific components, hooks, schemas and API functions close to their feature. Avoid giant components and giant global state slices.

---

# PART B — PROJECT-SPECIFIC REQUIREMENTS TO PRESERVE

## Assignment identity

Company: ALGIONS AI LABS PRIVATE LIMITED  
Role: Full-Stack Web Development Intern  
Assigned project: Pharmacy Management System  
Submission package: repository, README, migrations/seed, ER diagram, API documentation, automated tests, demo/local instructions, 3–5 minute walkthrough and technical report.

## Scope checklist

- [ ] Medicine/product catalogue
- [ ] Categories
- [ ] Supplier management
- [ ] Purchase records and receiving
- [ ] Batch-wise inventory
- [ ] FEFO sale allocation
- [ ] POS and itemized invoices
- [ ] Configurable tax fields
- [ ] Expiry and low-stock alerts
- [ ] Returns and adjustments with reasons
- [ ] Immutable stock movement history
- [ ] Sales report
- [ ] Stock valuation/reconciliation report
- [ ] Expiry report
- [ ] Authentication and server-side RBAC
- [ ] Search/filter/pagination
- [ ] Accessible loading/empty/error/success states
- [ ] Audit trail
- [ ] Unit and integration tests
- [ ] OpenAPI documentation
- [ ] Privacy/Terms pages
- [ ] README, ER diagram, test evidence and technical report
