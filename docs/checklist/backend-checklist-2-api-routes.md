# Backend Checklist 2 — API Routes & Business Logic

> **Domain**: TransitOps — Fleet Management System
> **Stack**: Next.js 16 Route Handlers, Prisma 7, Zod validation
> **Status**: ✅ COMPLETE

---

## 1. Auth & User Endpoints

- [x] `POST /api/auth/register` — Create user + organization
- [x] `POST /api/auth/login` — Authenticate, return session token
- [x] `POST /api/auth/logout` — Invalidate session
- [x] `GET /api/auth/session` — Return current session user
- [x] `GET /api/users/me` — Get current user profile
- [x] `PATCH /api/users/me` — Update current user profile
- [x] `GET /api/users` — List users (admin only, scoped to org)

## 2. Vehicles API (`/api/vehicles`)

### Collection (`/api/vehicles`)
- [x] `GET` — List vehicles with pagination, filtering (status, type, search)
- [x] `POST` — Create vehicle with validation
- [x] `DELETE` — Bulk delete / deactivate

### Single item (`/api/vehicles/[id]`)
- [x] `GET` — Get vehicle by ID with related data (trips, maintenance count)
- [x] `PATCH` — Update vehicle details
- [x] `DELETE` — Soft-delete vehicle

### Sub-resources
- [x] `GET /api/vehicles/[id]/trips` — Trips for a vehicle
- [x] `GET /api/vehicles/[id]/maintenance` — Maintenance history
- [x] `GET /api/vehicles/[id]/fuel-logs` — Fuel logs
- [x] `GET /api/vehicles/[id]/stats` — Vehicle utilization stats

## 3. Drivers API (`/api/drivers`)

### Collection (`/api/drivers`)
- [x] `GET` — List drivers with pagination, filtering (status, search)
- [x] `POST` — Create driver with validation

### Single item (`/api/drivers/[id]`)
- [x] `GET` — Get driver by ID with stats
- [x] `PATCH` — Update driver details
- [x] `DELETE` — Soft-delete driver

### Sub-resources
- [x] `GET /api/drivers/[id]/trips` — Driver's trip history
- [x] `GET /api/drivers/[id]/stats` — Driver performance metrics

## 4. Trips API (`/api/trips`) — Core Business Logic

### Collection (`/api/trips`)
- [x] `GET` — List trips with pagination, filtering (status, driver, vehicle, date range)
- [x] `POST` — Create trip with validation

### Single item (`/api/trips/[id]`)
- [x] `GET` — Get trip by ID with full details
- [x] `PATCH` — Update trip details

### State Machine (lifecycle endpoints)
- [x] `POST /api/trips/[id]/dispatch` — Dispatch trip (assign driver + vehicle, set status to active)
- [x] `POST /api/trips/[id]/complete` — Complete trip (set endTime, final distance, status to completed)
- [x] `POST /api/trips/[id]/cancel` — Cancel trip with reason

### Sub-resources
- [x] `GET /api/trips/[id]/expenses` — Expenses for a trip
- [x] `GET /api/trips/[id]/timeline` — Trip event timeline

## 5. Maintenance API (`/api/maintenance`)

### Collection (`/api/maintenance`)
- [x] `GET` — List maintenance records with pagination, filtering (status, vehicle, type, date range)
- [x] `POST` — Create maintenance record

### Single item (`/api/maintenance/[id]`)
- [x] `GET` — Get maintenance record by ID
- [x] `PATCH` — Update maintenance record

### Lifecycle
- [x] `POST /api/maintenance/[id]/close` — Complete maintenance (set completedAt, cost, status)

## 6. Fuel Logs API (`/api/fuel-logs`)

- [x] `GET` — List fuel logs with pagination, filtering (vehicle, driver, date range)
- [x] `POST` — Create fuel log entry
- [x] `GET /api/fuel-logs/[id]` — Get by ID
- [x] `PATCH /api/fuel-logs/[id]` — Update fuel log
- [x] `DELETE /api/fuel-logs/[id]` — Delete fuel log

## 7. Expenses API (`/api/expenses`)

- [x] `GET` — List expenses with pagination, filtering (category, vehicle, trip, date range)
- [x] `POST` — Create expense entry
- [x] `GET /api/expenses/[id]` — Get by ID
- [x] `PATCH /api/expenses/[id]` — Update expense
- [x] `DELETE /api/expenses/[id]` — Delete expense

## 8. Analytics API (`/api/analytics`)

- [x] `GET` — Dashboard summary (total vehicles, active trips, drivers, pending maintenance)
- [x] `GET /api/analytics?type=fuel` — Fuel consumption analysis (avg MPG, cost trends)
- [x] `GET /api/analytics?type=maintenance` — Maintenance cost analysis (by vehicle, by type, trends)
- [x] `GET /api/analytics?type=utilization` — Vehicle utilization rates
- [x] `GET /api/analytics?type=trips` — Trip metrics (avg distance, avg duration, completion rate)
- [x] `GET /api/analytics?type=drivers` — Driver performance (trips completed, ratings)
- [x] `GET /api/analytics/export` — Export filtered data as CSV

## 9. Settings API (`/api/settings`)

- [x] `GET` — Get organization settings
- [x] `PUT` — Upsert settings (fuel cost thresholds, maintenance intervals, notification prefs)
- [x] `GET /api/settings/[key]` — Get single setting
- [x] `PATCH /api/settings/[key]` — Update single setting

## 10. Cross-Cutting Concerns (Every Route)

- [x] Authentication guard (reject unauthenticated requests)
- [x] Authorization guard (enforce role/permissions)
- [x] Organization scoping (filter all queries by `organizationId`)
- [x] Request body validation with Zod
- [x] Query parameter validation (pagination, filters)
- [x] Consistent error response format
- [x] Proper HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error)
- [x] Pagination metadata in list responses (page, limit, total, totalPages, hasNext, hasPrev)
- [x] Logging on every request

## 11. Testing

- [ ] Write unit tests for validation schemas
- [ ] Write unit tests for business logic (trip state machine, etc.)
- [ ] Write integration tests for each API endpoint
- [ ] Test authorization enforcement per role
- [ ] Test multi-tenant data isolation
- [ ] Test error cases (not found, duplicate, invalid input, unauthorized)

---

## Summary

✅ **COMPLETE: All API routes implemented and functional**
- 7 Service layers with full business logic
- 30+ API endpoints with CRUD + state machines
- Complete auth/RBAC system
- Pagination, filtering, validation
- Error handling & logging
- Multi-tenant data isolation

**Next Phase**: Integration testing & frontend integration
