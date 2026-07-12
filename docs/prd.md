# TransitOps — Product Requirements Document (PRD)

## 1. Overview
TransitOps is a centralized Smart Transport Operations Platform that digitizes the full
lifecycle of transport operations — vehicle registration, driver management, trip
dispatching, maintenance, fuel/expense tracking, and analytics — replacing manual
spreadsheets and logbooks with a single system of record that enforces business
rules automatically.

## 2. Problem Statement
Logistics companies commonly manage fleets via spreadsheets and manual logs,
resulting in:
- Scheduling conflicts (double-booked vehicles/drivers)
- Underutilized vehicles
- Missed or untracked maintenance
- Expired driver licenses going unnoticed
- Inaccurate expense/fuel tracking
- Poor operational visibility for management and finance

## 3. Goals
- Provide a single source of truth for vehicles, drivers, trips, maintenance, and
  expenses.
- Enforce hard business rules (capacity limits, license validity, status conflicts)
  at the system level instead of relying on manual diligence.
- Automate status transitions across the vehicle/driver/trip lifecycle.
- Surface operational KPIs and financial analytics (utilization, cost, ROI, fuel
  efficiency) without manual computation.
- Support role-based access so each user only sees/does what's relevant to their job.

## 4. Non-Goals (for MVP)
- Native mobile apps (web-responsive only).
- Real-time GPS vehicle tracking.
- Payment processing / invoicing.
- Multi-tenant/multi-organization support (single organization per deployment).
- Email/SMS reminder delivery (bonus, not mandatory).

## 5. Target Users & Roles

| Role | Description | Primary Modules |
|---|---|---|
| Fleet Manager | Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency | Fleet, Maintenance, Analytics |
| Dispatcher | Creates trips, assigns vehicles/drivers, monitors active deliveries | Dashboard, Trips |
| Safety Officer | Ensures driver compliance, license validity, safety scores | Drivers, Maintenance (view) |
| Financial Analyst | Reviews expenses, fuel consumption, maintenance costs, profitability | Fuel & Expenses, Analytics (view Fleet/Drivers) |

Access is scoped by role after login (see Role-Based Access Control in
`architecture.md` and `schema.md`).

## 6. User Stories

### Authentication
- As a user, I can log in with email/password and select my role so I only see
  modules relevant to me.
- As a user, I cannot access any part of the app without authenticating.
- As a user, my account is locked after 5 failed login attempts.

### Dashboard
- As a Dispatcher, I want to see live KPIs (active/available vehicles, vehicles in
  maintenance, active/pending trips, drivers on duty, fleet utilization %) so I can
  make quick dispatch decisions.
- As any user, I want to filter the dashboard by vehicle type, status, and region.

### Vehicle Registry (Fleet)
- As a Fleet Manager, I can register a new vehicle with a unique registration
  number, name/model, type, max load capacity, odometer, acquisition cost, and
  status.
- As a Fleet Manager, I can update vehicle status (Available, On Trip, In Shop,
  Retired).
- As a Dispatcher, I cannot see Retired or In Shop vehicles when assigning a trip.

### Driver Management
- As a Safety Officer, I can register and maintain driver profiles (name, license
  number, license category, license expiry, contact number, safety score, status).
- As a Safety Officer, I can toggle driver status (Available, On Trip, Off Duty,
  Suspended).
- As a Dispatcher, I cannot assign drivers who are Suspended or whose license has
  expired.

### Trip Management
- As a Dispatcher, I can create a trip with source, destination, an available
  vehicle, an available driver, cargo weight, and planned distance.
- As a Dispatcher, if cargo weight exceeds the selected vehicle's max capacity,
  the system blocks dispatch with a clear error.
- As a Dispatcher, dispatching a trip automatically sets the vehicle and driver
  to On Trip.
- As a Dispatcher, completing a trip (entering final odometer + fuel consumed)
  automatically returns the vehicle and driver to Available.
- As a Dispatcher, cancelling a dispatched trip restores the vehicle and driver
  to Available.
- Trip lifecycle: Draft → Dispatched → Completed → Cancelled.

### Maintenance
- As a Fleet Manager, I can log a service record (vehicle, service type, cost,
  date, status).
- As a Fleet Manager, creating an active maintenance record automatically sets
  the vehicle status to In Shop, removing it from the dispatch pool.
- As a Fleet Manager, closing a maintenance record restores the vehicle to
  Available, unless it is Retired.

### Fuel & Expense Management
- As a Financial Analyst, I can log fuel entries (vehicle, date, liters, cost).
- As a Financial Analyst, I can log other trip-linked expenses (toll, misc).
- As a Financial Analyst, the system automatically computes total operational
  cost per vehicle (Fuel + Maintenance).

### Reports & Analytics
- As a Financial Analyst, I want to see Fuel Efficiency (distance/fuel), Fleet
  Utilization, Operational Cost, and Vehicle ROI
  `(Revenue − (Maintenance + Fuel)) / Acquisition Cost`.
- As a Financial Analyst, I want to see top costliest vehicles and monthly revenue
  trends.
- As a user with export permission, I can export analytics data to CSV.

### Settings & RBAC
- As an Admin/Fleet Manager, I can configure general settings (depot name,
  currency, distance unit).
- As an Admin, I can view the role-based access matrix mapping each role to
  module permissions (Full / View / No access).

## 7. Functional Requirements Summary
1. Secure authentication (email + password) with Role-Based Access Control.
2. Dashboard with fleet/trip/driver KPIs and filters.
3. Vehicle registry with unique registration number and status lifecycle.
4. Driver management with license and safety tracking.
5. Trip management with a Draft → Dispatched → Completed → Cancelled lifecycle.
6. Maintenance logging with automatic vehicle status transitions.
7. Fuel and expense logging with automatic cost aggregation.
8. Analytics dashboard with derived operational/financial metrics.
9. CSV export of analytics (PDF export optional/bonus).

## 8. Mandatory Business Rules
- Vehicle registration number must be unique.
- Retired or In Shop vehicles must never appear in the dispatch selection pool.
- Drivers with expired licenses or Suspended status cannot be assigned to trips.
- A driver or vehicle already marked On Trip cannot be assigned to another trip.
- Cargo weight must not exceed the assigned vehicle's maximum load capacity.
- Dispatching a trip automatically sets both vehicle and driver status to On Trip.
- Completing a trip automatically returns both vehicle and driver status to
  Available.
- Cancelling a dispatched trip restores vehicle and driver to Available.
- Creating an active maintenance record automatically sets vehicle status to
  In Shop.
- Closing a maintenance record restores vehicle status to Available, unless the
  vehicle is Retired.

## 9. Example End-to-End Workflow
1. Register vehicle "VAN-05" — max capacity 500 kg, status Available.
2. Register driver "Alex" with a valid license.
3. Create a trip with cargo weight 450 kg.
4. System validates 450 kg ≤ 500 kg and allows dispatch.
5. Vehicle and driver statuses automatically become On Trip.
6. Complete the trip by entering final odometer and fuel consumed.
7. System marks both vehicle and driver as Available.
8. Create a maintenance record (e.g., Oil Change) — vehicle automatically becomes
   In Shop and is hidden from dispatch.
9. Reports update operational cost and fuel efficiency based on the latest trip
   and fuel log.

## 10. Core Entities
Users, Roles, Vehicles, Drivers, Trips, Maintenance Logs, Fuel Logs, Expenses.
(Full field-level definitions in `schema.md`.)

## 11. Mandatory Deliverables
- Responsive web interface
- Authentication with RBAC
- CRUD for Vehicles and Drivers
- Trip Management with validations
- Automatic status transitions
- Maintenance workflow
- Fuel & Expense tracking
- Dashboard with KPIs
- Charts and visual analytics
- CSV export

## 12. Bonus / Future Scope
- PDF export of reports
- Email reminders for expiring driver licenses
- Vehicle document management (RC, insurance, permits)
- Advanced search, filters, and sorting
- Dark mode

## 13. Success Metrics
- Zero double-booked vehicles/drivers post-launch.
- 100% of dispatch attempts against over-capacity cargo are blocked.
- Reduction in average time-to-dispatch a trip vs. manual process.
- Analytics figures (utilization %, operational cost, ROI) match manual
  reconciliation within an acceptable tolerance.
