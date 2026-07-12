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
- [x] Run `npx prisma db push` or create initial migration
- [x] Add seed script with sample data (admin user, org, vehicles, drivers)

## 2. Prisma Client Setup

- [x] Fix `prisma.ts` global singleton pattern (remove wrong import path)
- [x] Configure `@prisma/adapter-pg` correctly
- [x] Ensure connection pooling is configured for production
- [x] Add soft-delete / paranoid pattern utility
- [x] Add pagination helper utility

## 3. Environment & Configuration

- [x] Create `.env` with `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`
- [x] Create `.env.example` with documented placeholders
- [x] Define TypeScript config types for env vars (validated with zod)
- [x] Set up `next.config.ts` for production (allowed origins, headers)

## 4. Authentication

- [x] Install and configure JWT-based auth with `jose` (no NextAuth)
- [x] Implement credential-based auth with password hashing (bcrypt)
- [x] Create explicit auth API routes (`login`, `signup`, `logout`, `session`)
- [x] Implement session management (stateless JWT via HttpOnly cookies)
- [x] Create `src/lib/auth.ts` with auth helpers (signIn, signOut, getCurrentUser)
- [x] Create `src/lib/session.ts` with session read/write utilities (jose-based)
- [x] Implement `proxy.ts` for protected route enforcement (Next.js 16 proxy convention)
- [x] Add login/signup API routes
- [x] Add session refresh logic (cookie expiry slide on each request)

## 5. Authorization & RBAC

- [x] Define roles in `src/types/rbac.ts` (Admin, Manager, Dispatcher, Driver)
- [x] Implement permission matrix in `src/lib/rbac.ts`
- [x] Add role-based middleware guards
- [x] Add route-level authorization utility (canManageVehicles, canViewTrips, etc.)
- [x] Ensure multi-tenant data isolation via `organizationId` filtering
- [x] Add organization-scoped middleware

## 6. Validation Layer

- [x] Define Zod schemas in `src/lib/validations/` for:
  - [x] `user.schema.ts` — login, signup, profile update
  - [x] `vehicle.schema.ts` — create, update
  - [x] `driver.schema.ts` — create, update
  - [x] `trip.schema.ts` — create, update, dispatch, complete, cancel
  - [x] `fuelExpense.schema.ts` — create, update
  - [x] `maintenance.schema.ts` — create, update, close
  - [x] `expense.schema.ts` — create, update
  - [x] `settings.schema.ts` — upsert
- [x] Add shared validation helpers (pagination, date ranges, IDs)
- [x] Create `src/lib/validate.ts` — generic request body validator middleware

## 7. API Utilities & Error Handling

- [x] Create `src/lib/api-response.ts` with standard response helpers:
  - [x] `success(data, status)` — 200/201 wrapper
  - [x] `error(message, status, details?)` — 400/401/403/404/409/500
  - [x] `paginated(items, total, page, limit)` — paginated response
- [x] Create `src/lib/errors.ts` with custom error classes (NotFoundError, AuthError, ValidationError, ForbiddenError)
- [x] Create `src/lib/async-handler.ts` — wraps route handlers with try/catch
- [x] Create `src/lib/constants.ts` — status enums, roles, categories

## 8. Logging & Monitoring

- [x] Add structured logging utility (`src/lib/logger.ts`)
- [x] Log API requests (method, path, duration, userId)
- [x] Log errors with stack traces
- [x] Set up health-check endpoint (`GET /api/health`)
