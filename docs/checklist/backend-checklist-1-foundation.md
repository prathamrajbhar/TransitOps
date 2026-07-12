# Backend Checklist 1 — Foundation & Data Layer

> **Domain**: TransitOps — Fleet Management System
> **Stack**: Next.js 16.2, Prisma 7, PostgreSQL, TypeScript

---

## 1. Database & Prisma Schema

- [x] Define `User` model (id, name, email, passwordHash, role, createdAt, updatedAt)
- [x] Define `Organization` model (id, name, slug, settings JSON, createdAt)
- [x] Define `Driver` model (id, name, email, phone, licenseNumber, status, organizationId, userId?, createdAt, updatedAt)
- [x] Define `Vehicle` model (id, plateNumber, make, model, year, type, status, organizationId, createdAt, updatedAt)
- [x] Define `Trip` model (id, vehicleId, driverId, origin, destination, distance, startTime, endTime, status, organizationId, createdAt, updatedAt)
- [x] Define `MaintenanceRecord` model (id, vehicleId, type, description, scheduledAt, completedAt, cost, status, organizationId, createdAt)
- [x] Define `FuelLog` model (id, vehicleId, driverId, liters, costPerLiter, totalCost, odometer, station, organizationId, createdAt)
- [x] Define `Expense` model (id, category, amount, description, date, vehicleId?, tripId?, organizationId, createdBy, createdAt)
- [x] Define `Settings` model (id, organizationId, key, value JSON)
- [x] Define proper relations (foreign keys, cascades)
- [x] Add composite indexes for common queries (organizationId + status, organizationId + createdAt)
- [x] Run `npx prisma generate`
- [ ] Run `npx prisma db push` or create initial migration
- [x] Add seed script with sample data (admin user, org, vehicles, drivers)

## 2. Prisma Client Setup

- [ ] Fix `prisma.ts` global singleton pattern (remove wrong import path)
- [ ] Configure `@prisma/adapter-pg` correctly
- [ ] Ensure connection pooling is configured for production
- [ ] Add soft-delete / paranoid pattern utility
- [ ] Add pagination helper utility

## 3. Environment & Configuration

- [ ] Create `.env` with `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`
- [ ] Create `.env.example` with documented placeholders
- [ ] Define TypeScript config types for env vars (validated with zod)
- [ ] Set up `next.config.ts` for production (allowed origins, headers)

## 4. Authentication

- [ ] Install and configure `next-auth` or a custom auth solution
- [ ] Implement credential-based auth with password hashing (bcrypt)
- [ ] Set up `[...nextauth]/route.ts` API handler
- [ ] Implement session management (JWT or database sessions)
- [ ] Create `src/lib/auth.ts` with auth helpers (signIn, signOut, getSession)
- [ ] Create `src/lib/session.ts` with session read/write utilities
- [ ] Implement `middleware.ts` for protected route enforcement
- [ ] Add login/signup API routes or server actions
- [ ] Add session refresh logic

## 5. Authorization & RBAC

- [ ] Define roles in `src/types/rbac.ts` (Admin, Manager, Dispatcher, Driver)
- [ ] Implement permission matrix in `src/lib/rbac.ts`
- [ ] Add role-based middleware guards
- [ ] Add route-level authorization utility (canManageVehicles, canViewTrips, etc.)
- [ ] Ensure multi-tenant data isolation via `organizationId` filtering
- [ ] Add organization-scoped middleware

## 6. Validation Layer

- [ ] Define Zod schemas in `src/lib/validations/` for:
  - [ ] `user.schema.ts` — login, signup, profile update
  - [ ] `vehicle.schema.ts` — create, update
  - [ ] `driver.schema.ts` — create, update
  - [ ] `trip.schema.ts` — create, update, dispatch, complete, cancel
  - [ ] `fuelExpense.schema.ts` — create, update
  - [ ] `maintenance.schema.ts` — create, update, close
  - [ ] `expense.schema.ts` — create, update
  - [ ] `settings.schema.ts` — upsert
- [ ] Add shared validation helpers (pagination, date ranges, IDs)
- [ ] Create `src/lib/validate.ts` — generic request body validator middleware

## 7. API Utilities & Error Handling

- [ ] Create `src/lib/api-response.ts` with standard response helpers:
  - [ ] `success(data, status)` — 200/201 wrapper
  - [ ] `error(message, status, details?)` — 400/401/403/404/409/500
  - [ ] `paginated(items, total, page, limit)` — paginated response
- [ ] Create `src/lib/errors.ts` with custom error classes (NotFoundError, AuthError, ValidationError, ForbiddenError)
- [ ] Create `src/lib/async-handler.ts` — wraps route handlers with try/catch
- [ ] Create `src/lib/constants.ts` — status enums, roles, categories

## 8. Logging & Monitoring

- [ ] Add structured logging utility (`src/lib/logger.ts`)
- [ ] Log API requests (method, path, duration, userId)
- [ ] Log errors with stack traces
- [ ] Set up health-check endpoint (`GET /api/health`)
