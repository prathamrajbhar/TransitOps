# TransitOps — Smart Transport Operations Platform

TransitOps is a centralized, multi-tenant fleet management and smart transport operations platform. Built to replace fragmented manual spreadsheets, it handles the complete lifecycle of vehicles, drivers, trips, maintenance, fuel logging, and financial analytics. TransitOps guarantees operational safety and efficiency by automatically enforcing strict business rules (such as load capacity limits, license validity, and status conflict avoidance) at the system level.

---

## 🚀 Key Modules & Features

### 1. Unified Dashboard
- **Live Operations Monitor**: Displays real-time operational KPIs including active/available vehicles, drivers on duty, pending maintenance, active/pending trips, and overall fleet utilization percentage.
- **Filtering**: Instant client-side filtering by vehicle type, operational status, and region.
- **Activity Feed**: View recent trips, their real-time statuses, and ETA trackers.

### 2. Vehicle Registry & Fleet Lifecycle
- **Metadata Management**: Unique registration plates, vehicle models, classification types (Bus, Truck, Van, Mini, etc.), max load capacities, odometer readings, and acquisition values.
- **Automatic Status Transitions**: Transitions dynamically between `AVAILABLE`, `ON_TRIP`, `IN_SHOP`, and `RETIRED`.

### 3. Driver Management & Safety Profiles
- **Compliance & Safety**: Tracks driver contact information, license numbers, categories (LMV/HMV), safety scores, and license expirations.
- **Guardrails**: System flags drivers with expired licenses or `SUSPENDED` status, excluding them from the trip dispatch pool.

### 4. Trip Management & Dispatch Stepper
- **E2E Lifecycle**: Supports `Draft ➔ Dispatched ➔ Completed ➔ Cancelled` transitions.
- **Interactive Dispatches**: Integrates live capacity validation banners to ensure cargo weight does not exceed the vehicle's max load capacity.
- **Atomic Operations**: Dispatching, completing, or cancelling a trip automatically updates both driver and vehicle statuses in a single database transaction.

### 5. Maintenance Operations
- **Shop Logs**: Allows managers to open and track active maintenance records.
- **Lifecycle Integration**: Creating an active maintenance log automatically puts the vehicle `IN_SHOP` (removing it from dispatch). Closing the log returns the vehicle to `AVAILABLE`.

### 6. Fuel & Expense Accounting
- **Operational Auditing**: Tracks liters consumed and price metrics for every vehicle.
- **Trip Expenses**: Logs toll costs and miscellaneous trip expenses, automatically calculating total operational cost (Fuel + Maintenance).

### 7. Interactive Analytics & CSV Export
- **Operational KPIs**: Tracks fuel efficiency (distance/fuel), fleet utilization, overall costs, and vehicle ROI `(Revenue - (Maintenance + Fuel)) / Acquisition Cost`.
- **Charts (Recharts)**: Interactive bar and line charts showing monthly revenue trends and top costliest vehicles.
- **CSV Data Streaming**: Streams filtered operational analytics records directly into a CSV format.

### 8. Role-Based Access Control (RBAC) & Multi-Tenancy
- **Scoped Tenant Isolation**: All queries are automatically isolated by `organizationId`.
- **RBAC Matrix**: Controls access levels (`FULL`, `VIEW`, `NONE`) across 4 distinct roles:
  - **Fleet Manager**: Full registry control, maintenance, and fleet health dashboards.
  - **Dispatcher**: Formulates, dispatches, cancels, and completes trips.
  - **Safety Officer**: Driver safety compliance, license audits, and view-only trip logs.
  - **Financial Analyst**: Expense logs, fuel entries, settings review, and visual ROI dashboards.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | **Next.js 16.2** (App Router) | Monolithic hybrid client/server structure with Turbopack |
| **Language** | **TypeScript** | Strict compile-time type-safety across client and API |
| **Styling** | **Tailwind CSS v4** + Custom CSS | CSS design tokens combined with modern utility layout classes |
| **Database** | **PostgreSQL** | Relational storage enforcing indexes, unique constraints, and foreign keys |
| **ORM** | **Prisma 7.8** | Type-safe database client and migrations; utilizes `@prisma/adapter-pg` |
| **Auth** | **Custom jose JWT Sessions** | Stateless session cookies secured with HttpOnly and lax cookies |
| **State** | **TanStack React Query v5** | Client caching, optimistic state updates, and auto-refetching |
| **Forms** | **React Hook Form + Zod** | Reusable schema validations synced between forms and API routes |
| **Charts** | **Recharts** | Interactive SVG charts for operational metrics |

---

## 📂 Project Directory Structure

```
transitops/
├── prisma/
│   ├── schema.prisma              # Schema definition with multi-tenant scopes
│   ├── seed.ts                    # Populates tenant, RBAC settings, and dev data
│   └── migrations/                # Database migrations history
├── src/
│   ├── app/
│   │   ├── (auth)/                # Auth routes (login, register)
│   │   ├── (dashboard)/           # Protected console pages (fleet, drivers, trips, etc.)
│   │   ├── api/                   # Scoped REST-style Next.js Route Handlers
│   │   └── layout.tsx             # Fonts, context, and query providers wrapper
│   ├── components/                # Modular UI components separated by feature folders
│   ├── hooks/                     # Custom TanStack React Query hooks per module
│   ├── lib/
│   │   ├── services/              # Encapsulated transactional business logic services
│   │   ├── validations/           # Shared Zod schemas (client/server validation)
│   │   ├── auth.ts                # Sign-in/out and getCurrentUser helpers
│   │   ├── rbac.ts                # Route permission guards and org-scoped isolations
│   │   └── session.ts             # jose JWT encryption and decryption helpers
│   ├── providers/                 # Session and React Query providers
│   ├── proxy.ts                   # Route guard middleware handler
│   └── types/                     # Shared TypeScript type interfaces
├── __tests__/                     # Integration & Unit test suites covering all API routes
├── TESTING.md                     # Comprehensive testing guide
└── next.config.ts                 # Security headers and compilation settings
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+ (Node.js 24 recommended)
- PostgreSQL database instance

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd odoo_hackathon
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/transitops?schema=public"
AUTH_SECRET="your-32-character-long-secure-random-jwt-key"
NODE_ENV="development"
```

### 3. Initialize the Database
Generate the Prisma client, run database schema setup, and seed the database:
```bash
# Generate Prisma Client
npx prisma generate

# Apply the DB schema
npx prisma db push

# Seed the database with demo accounts, vehicles, and trips
npm run db:seed
```

### 4. Run the Application
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the platform.

---

## 🔑 Seeding & Demo Credentials

The database seeding script configures a default multi-tenant organization (`TransitOps Demo`) and pre-registers four users with different roles for testing purposes:

| Role | Email | Password | Allowed Modules |
|---|---|---|---|
| **Fleet Manager** | `manager@transitops.com` | `Manager@123` | Fleet, Drivers, Maintenance, Analytics, Settings |
| **Dispatcher** | `dispatcher@transitops.com` | `Dispatcher@123` | Dashboard, Fleet (View), Drivers (View), Trips |
| **Safety Officer** | `safety@transitops.com` | `Safety@123` | Drivers, Vehicles (View), Trips (View), Maintenance (View) |
| **Financial Analyst** | `finance@transitops.com` | `Finance@123` | Fuel & Expenses, Analytics, Vehicles/Drivers (View), Settings (View) |

---

## 🧪 Testing

TransitOps includes a comprehensive integration test suite of 100+ cases across 30+ backend API endpoints, testing RBAC permissions, multi-tenant isolation, error handling, and state machine integrity.

### Commands
```bash
# Run all tests
npm test

# Run a specific test file
npm test -- vehicles.test.ts

# Run tests in watch mode
npm run test:watch

# Run coverage report
npm run test:coverage
```

*For detailed test configurations and setup details, see the [TESTING.md](file:///home/pratham/Disk2/Hackathon%20Projects/odoo_hackathon/TESTING.md) guide.*

---

## 🔒 Mandatory Business & Validation Rules

The service layer (`src/lib/services/`) strictly enforces the following validation logic during transactions:
1. **Uniqueness Constraints**: Plate registration numbers and driver license numbers must be globally unique.
2. **Dispatch Validation**: Trips cannot be dispatched if:
   - The cargo weight exceeds the vehicle's max load capacity.
   - The assigned vehicle's status is `IN_SHOP` or `RETIRED`.
   - The assigned driver's status is `SUSPENDED` or `OFF_DUTY`.
   - The driver's license expiry date has passed.
   - Either the vehicle or driver is already assigned to an active trip (`ON_TRIP`).
3. **Atomic Status Updates**:
   - **Trip Dispatched**: Simultaneously updates `Trip.status = DISPATCHED`, `Vehicle.status = ON_TRIP`, and `Driver.status = ON_TRIP`.
   - **Trip Completed**: Simultaneously updates `Trip.status = COMPLETED`, `Vehicle.status = AVAILABLE`, `Driver.status = AVAILABLE`, and increments the vehicle's odometer reading.
   - **Trip Cancelled**: Reverts both the assigned vehicle and driver statuses back to `AVAILABLE`.
   - **Maintenance Opened**: Sets the vehicle to `IN_SHOP`, removing it from future trip assignments.
   - **Maintenance Closed**: Sets the vehicle back to `AVAILABLE` (unless manually set to `RETIRED`).
