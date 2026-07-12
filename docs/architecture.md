# TransitOps — Architecture Document

## 1. High-Level Architecture

TransitOps is a monolithic Next.js application combining server-rendered UI and
API route handlers, backed by a single PostgreSQL database accessed through
Prisma ORM.

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│   Next.js Pages (Server + Client Components)              │
│   React Query (client-side data fetch/mutation/cache)     │
└───────────────────────┬─────────────────────────────────┘
                         │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│                Next.js Server (App Router)                │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Page/Route     │  │ API Route       │  │ JWT Auth     │  │
│  │ Components     │  │ Handlers        │  │ (Cookie      │  │
│  │ (SSR/RSC)      │  │ (app/api/**)    │  │  Storage)    │  │
│  └───────┬────────┘  └────────┬───────┘  └──────┬───────┘  │
│          │                    │                  │          │
│          └────────────┬───────┴──────────────────┘          │
│                       │                                     │
│              ┌────────▼────────┐                            │
│              │  Service Layer   │  (business rules,          │
│              │  (lib/services)  │   status transitions)      │
│              └────────┬────────┘                            │
│                       │                                     │
│              ┌────────▼────────┐                            │
│              │  Prisma Client   │                            │
│              └────────┬────────┘                            │
└───────────────────────┼─────────────────────────────────────┘
                         │
                ┌────────▼────────┐
                │   PostgreSQL     │
                └─────────────────┘
```

## 2. Layers

### 2.1 Presentation Layer
- Next.js App Router pages under `src/app/(dashboard)/**`, one route per module
  (Dashboard, Fleet, Drivers, Trips, Maintenance, Fuel & Expenses, Analytics,
  Settings).
- Server Components fetch initial data directly via the service layer for fast
  first paint; Client Components handle interactive forms, filters, and
  optimistic updates via React Query.
- A shared layout component renders the sidebar navigation and top bar, with
  navigation items conditionally rendered based on the current user's role
  permissions.

### 2.2 API Layer
- REST-style route handlers under `src/app/api/**`, one resource group per
  entity (`/api/vehicles`, `/api/drivers`, `/api/trips`, `/api/maintenance`,
  `/api/fuel-logs`, `/api/expenses`, `/api/analytics`).
- Each handler:
  1. Verifies the request session by reading the JWT token from the HTTP-only cookie.
  2. Checks role permission for the target module/action via the RBAC helper.
  3. Validates the request payload with a Zod schema.
  4. Delegates to the service layer for business logic and persistence.
  5. Returns a typed JSON response.

### 2.3 Service Layer
- Encapsulates all business rules and multi-step status transitions so they
  are not duplicated across API routes or UI code:
  - `vehicleService` — CRUD, uniqueness checks, status filters for dispatch
    eligibility.
  - `driverService` — CRUD, license expiry checks, status filters for dispatch
    eligibility.
  - `tripService` — trip lifecycle transitions (Draft → Dispatched → Completed
    → Cancelled), cargo-capacity validation, vehicle/driver availability
    checks, and the atomic status updates that accompany each transition.
  - `maintenanceService` — creating/closing maintenance records and the
    associated vehicle status transitions (Available ↔ In Shop).
  - `fuelExpenseService` — fuel log and expense entry, per-vehicle operational
    cost aggregation.
  - `analyticsService` — computed KPIs (fleet utilization, fuel efficiency,
    operational cost, vehicle ROI, top costliest vehicles, monthly revenue).
  - `rbacService` — resolves a role's access level for a given module.

### 2.4 Data Layer
- Prisma ORM against PostgreSQL, single schema (`prisma/schema.prisma`).
- Migrations manage schema evolution; seed script provisions default roles,
  role-permission matrix, and demo data.

### 2.5 Authentication & Authorization
- Authentication validates credentials (email/password hashed with bcrypt)
  against the `User` table.
- On successful login, the system generates a JSON Web Token (JWT) containing
  the user's identity, `Role`, and its associated `RolePermission` records.
- This JWT is stored in a secure, HTTP-only, and SameSite cookie on the client browser.
- Route-level guarding: next.js middleware/layout checks for the presence and validity of
  the JWT cookie, redirecting unauthenticated users to `/login`.
- Module-level guarding: each page and API route decodes the JWT token from the cookie
  and checks the user's role and `AccessLevel` (`NONE` / `VIEW` / `FULL`) for the relevant
  `ModuleName` before rendering write controls or allowing write requests.
- Account lockout: after 5 consecutive failed login attempts, the account is
  locked (via `failedLogins` / `lockedUntil` fields) and further attempts are
  rejected until the lock expires or is cleared.

## 3. Business Rule Enforcement (Status Transition Flows)

### 3.1 Trip Dispatch
1. Dispatcher selects source, destination, vehicle, driver, cargo weight,
   planned distance in `Draft` state.
2. On "Dispatch":
   - Validate cargo weight ≤ vehicle max load capacity → block with an error
     if exceeded.
   - Validate vehicle status is `AVAILABLE` and driver status is `AVAILABLE`
     and license not expired → block otherwise.
   - In a single transaction: set `Trip.status = DISPATCHED`,
     `Vehicle.status = ON_TRIP`, `Driver.status = ON_TRIP`.

### 3.2 Trip Completion
1. Dispatcher enters final odometer and fuel consumed.
2. In a single transaction: set `Trip.status = COMPLETED`,
   `Vehicle.status = AVAILABLE`, `Driver.status = AVAILABLE`, update
   `Vehicle.odometerKm`.

### 3.3 Trip Cancellation
1. Dispatcher cancels a `Dispatched` trip.
2. In a single transaction: set `Trip.status = CANCELLED`,
   `Vehicle.status = AVAILABLE`, `Driver.status = AVAILABLE`.

### 3.4 Maintenance Open
1. Fleet Manager logs a service record with status `ACTIVE`.
2. In a single transaction: create `MaintenanceLog`, set
   `Vehicle.status = IN_SHOP` (vehicle disappears from trip dispatch vehicle
   list).

### 3.5 Maintenance Close
1. Fleet Manager marks the maintenance record `COMPLETED`.
2. In a single transaction: update `MaintenanceLog.status`, set
   `Vehicle.status = AVAILABLE` unless the vehicle's status was independently
   set to `RETIRED`.

## 4. Role-Based Access Control (RBAC) Matrix

| Module | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---|---|---|---|---|
| Fleet | Full | View | — | View |
| Drivers | Full | — | Full | — |
| Trips | — | Full | View | — |
| Fuel & Expenses | — | — | — | Full |
| Analytics | Full | — | — | Full |

This matrix is seeded into `RolePermission` and read at both the UI layer
(to hide/show navigation and actions) and the API layer (to allow/deny writes).

## 5. Data Flow Example: Creating a Trip
1. Dispatcher opens Trips page → client fetches available vehicles/drivers via
   `GET /api/vehicles?status=AVAILABLE` and `GET /api/drivers?status=AVAILABLE`
   (already excluding `IN_SHOP`/`RETIRED` vehicles and
   `SUSPENDED`/license-expired drivers at the query level).
2. Dispatcher submits the trip form → `POST /api/trips`.
3. Route handler validates session/role → validates payload with Zod →
   calls `tripService.createTrip()`.
4. Service layer re-validates business rules server-side (capacity, status)
   regardless of client-side filtering, then persists the trip.
5. Response returned to client; React Query invalidates the trips/dashboard
   cache to reflect updated KPIs.

## 6. Analytics Computation Strategy
- Aggregation queries (via Prisma `groupBy`/raw SQL where needed) compute:
  - Fleet Utilization % from current vehicle status counts.
  - Fuel Efficiency from SUM(trip distance) / SUM(fuel consumed).
  - Operational Cost from SUM(FuelLog.cost) + SUM(MaintenanceLog.cost) per
    vehicle/fleet.
  - Vehicle ROI from Revenue (derived from completed trip records or an
    entered revenue figure) minus (Maintenance + Fuel), divided by
    Acquisition Cost.
- Results are cached at the request layer (React Query) and recomputed on
  each dashboard/analytics load rather than stored, to always reflect the
  latest trip/fuel/maintenance data.

## 7. CSV Export
- Analytics/reports page triggers `GET /api/analytics/export` which streams a
  CSV built from the same aggregation queries used for on-screen analytics.

## 8. Error Handling & Validation
- All mutating API routes validate input with Zod before touching the
  database; invalid payloads return a 400 with field-level error messages.
- Business-rule violations (capacity exceeded, unavailable vehicle/driver,
  duplicate registration number) return a 409/422 with a user-readable message
  that the UI surfaces inline (as in the Trip Dispatcher capacity-exceeded
  example).
- Status-transition operations are wrapped in Prisma `$transaction` calls to
  avoid partial updates (e.g., vehicle updated to `ON_TRIP` but trip creation
  failing).
