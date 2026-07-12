# Backend Checklist 2 — API Routes & Business Logic

> **Domain**: TransitOps — Fleet Management System
> **Stack**: Next.js 16 Route Handlers, Prisma 7, Zod validation

---

## 1. Auth & User Endpoints

- [ ] `POST /api/auth/register` — Create user + organization
- [ ] `POST /api/auth/login` — Authenticate, return session token
- [ ] `POST /api/auth/logout` — Invalidate session
- [ ] `GET /api/auth/session` — Return current session user
- [ ] `GET /api/users/me` — Get current user profile
- [ ] `PATCH /api/users/me` — Update current user profile
- [ ] `GET /api/users` — List users (admin only, scoped to org)

## 2. Vehicles API (`/api/vehicles`)

### Collection (`/api/vehicles`)
- [ ] `GET` — List vehicles with pagination, filtering (status, type, search)
- [ ] `POST` — Create vehicle with validation
- [ ] `DELETE` — Bulk delete / deactivate

### Single item (`/api/vehicles/[id]`)
- [ ] `GET` — Get vehicle by ID with related data (trips, maintenance count)
- [ ] `PATCH` — Update vehicle details
- [ ] `DELETE` — Soft-delete vehicle

### Sub-resources
- [ ] `GET /api/vehicles/[id]/trips` — Trips for a vehicle
- [ ] `GET /api/vehicles/[id]/maintenance` — Maintenance history
- [ ] `GET /api/vehicles/[id]/fuel-logs` — Fuel logs
- [ ] `GET /api/vehicles/[id]/stats` — Vehicle utilization stats

## 3. Drivers API (`/api/drivers`)

### Collection (`/api/drivers`)
- [ ] `GET` — List drivers with pagination, filtering (status, search)
- [ ] `POST` — Create driver with validation

### Single item (`/api/drivers/[id]`)
- [ ] `GET` — Get driver by ID with stats
- [ ] `PATCH` — Update driver details
- [ ] `DELETE` — Soft-delete driver

### Sub-resources
- [ ] `GET /api/drivers/[id]/trips` — Driver's trip history
- [ ] `GET /api/drivers/[id]/stats` — Driver performance metrics

## 4. Trips API (`/api/trips`) — Core Business Logic

### Collection (`/api/trips`)
- [ ] `GET` — List trips with pagination, filtering (status, driver, vehicle, date range)
- [ ] `POST` — Create trip with validation

### Single item (`/api/trips/[id]`)
- [ ] `GET` — Get trip by ID with full details
- [ ] `PATCH` — Update trip details

### State Machine (lifecycle endpoints)
- [ ] `POST /api/trips/[id]/dispatch` — Dispatch trip (assign driver + vehicle, set status to active)
- [ ] `POST /api/trips/[id]/complete` — Complete trip (set endTime, final distance, status to completed)
- [ ] `POST /api/trips/[id]/cancel` — Cancel trip with reason

### Sub-resources
- [ ] `GET /api/trips/[id]/expenses` — Expenses for a trip
- [ ] `GET /api/trips/[id]/timeline` — Trip event timeline

## 5. Maintenance API (`/api/maintenance`)

### Collection (`/api/maintenance`)
- [ ] `GET` — List maintenance records with pagination, filtering (status, vehicle, type, date range)
- [ ] `POST` — Create maintenance record

### Single item (`/api/maintenance/[id]`)
- [ ] `GET` — Get maintenance record by ID
- [ ] `PATCH` — Update maintenance record

### Lifecycle
- [ ] `POST /api/maintenance/[id]/close` — Complete maintenance (set completedAt, cost, status)

## 6. Fuel Logs API (`/api/fuel-logs`)

- [ ] `GET` — List fuel logs with pagination, filtering (vehicle, driver, date range)
- [ ] `POST` — Create fuel log entry
- [ ] `GET /api/fuel-logs/[id]` — Get by ID
- [ ] `PATCH /api/fuel-logs/[id]` — Update fuel log
- [ ] `DELETE /api/fuel-logs/[id]` — Delete fuel log

## 7. Expenses API (`/api/expenses`)

- [ ] `GET` — List expenses with pagination, filtering (category, vehicle, trip, date range)
- [ ] `POST` — Create expense entry
- [ ] `GET /api/expenses/[id]` — Get by ID
- [ ] `PATCH /api/expenses/[id]` — Update expense
- [ ] `DELETE /api/expenses/[id]` — Delete expense

## 8. Analytics API (`/api/analytics`)

- [ ] `GET` — Dashboard summary (total vehicles, active trips, drivers, pending maintenance)
- [ ] `GET /api/analytics?type=fuel` — Fuel consumption analysis (avg MPG, cost trends)
- [ ] `GET /api/analytics?type=maintenance` — Maintenance cost analysis (by vehicle, by type, trends)
- [ ] `GET /api/analytics?type=utilization` — Vehicle utilization rates
- [ ] `GET /api/analytics?type=trips` — Trip metrics (avg distance, avg duration, completion rate)
- [ ] `GET /api/analytics?type=drivers` — Driver performance (trips completed, ratings)
- [ ] `GET /api/analytics/export` — Export filtered data as CSV

## 9. Settings API (`/api/settings`)

- [ ] `GET` — Get organization settings
- [ ] `PUT` — Upsert settings (fuel cost thresholds, maintenance intervals, notification prefs)
- [ ] `GET /api/settings/[key]` — Get single setting
- [ ] `PATCH /api/settings/[key]` — Update single setting

## 10. Cross-Cutting Concerns (Every Route)

- [ ] Authentication guard (reject unauthenticated requests)
- [ ] Authorization guard (enforce role/permissions)
- [ ] Organization scoping (filter all queries by `organizationId`)
- [ ] Request body validation with Zod
- [ ] Query parameter validation (pagination, filters)
- [ ] Consistent error response format
- [ ] Proper HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error)
- [ ] Pagination metadata in list responses (page, limit, total, totalPages)
- [ ] Logging on every request

## 11. Testing

- [ ] Write unit tests for validation schemas
- [ ] Write unit tests for business logic (trip state machine, etc.)
- [ ] Write integration tests for each API endpoint
- [ ] Test authorization enforcement per role
- [ ] Test multi-tenant data isolation
- [ ] Test error cases (not found, duplicate, invalid input, unauthorized)
