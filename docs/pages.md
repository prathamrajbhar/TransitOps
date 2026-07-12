# TransitOps — Pages & Routes

## 1. Route Map

| Route | Page | Access (min. role requirement) |
|---|---|---|
| `/login` | Sign In | Public |
| `/dashboard` | Dashboard | All authenticated roles (KPI set may vary by role) |
| `/fleet` | Vehicle Registry | Fleet Manager (Full), Dispatcher (View), Financial Analyst (View) |
| `/drivers` | Drivers & Safety Profiles | Safety Officer (Full), Fleet Manager (Full) |
| `/trips` | Trip Dispatcher | Dispatcher (Full), Safety Officer (View) |
| `/maintenance` | Maintenance | Fleet Manager (Full) |
| `/fuel-expenses` | Fuel & Expense Management | Financial Analyst (Full) |
| `/analytics` | Reports & Analytics | Fleet Manager (Full), Financial Analyst (Full) |
| `/settings` | Settings & RBAC | Fleet Manager (Full) / Admin |

A user attempting to open a route without at least `VIEW` access is redirected
to `/dashboard` with a permission notice.

## 2. Page Specifications

### 2.1 Login (`/login`)
**Purpose:** Authenticate the user and establish a session scoped to their role.

**Fields:**
- Email
- Password
- Role (select) — Fleet Manager / Dispatcher / Safety Officer / Financial Analyst
- Remember me (checkbox)
- Forgot password (link)

**Behavior:**
- On submit, credentials are verified against the `User` table; role selection
  must match the account's assigned role.
- Invalid credentials show an inline error.
- After 5 failed attempts, the account is locked and the error message informs
  the user accordingly.
- On success, redirect to `/dashboard`.

---

### 2.2 Dashboard (`/dashboard`)
**Purpose:** At-a-glance operational snapshot for quick decision-making.

**Components:**
- Global search bar.
- Filters: Vehicle Type, Status, Region.
- KPI cards: Active Vehicles, Available Vehicles, Vehicles in Maintenance,
  Active Trips, Pending Trips, Drivers on Duty, Fleet Utilization (%).
- Recent Trips table: Trip ID, Vehicle, Driver, Status, ETA.
- Vehicle Status breakdown (Available / On Trip / In Shop / Retired) as a
  proportional bar/list.

**Behavior:**
- KPI values and table recompute when filters change.
- Trip status values are color-coded by state (Draft, Dispatched, Completed,
  Cancelled) consistent with the Trips page.

---

### 2.3 Fleet — Vehicle Registry (`/fleet`)
**Purpose:** Maintain the master list of vehicles.

**Fields per vehicle:** Registration Number (unique), Name/Model, Type,
Capacity, Odometer, Acquisition Cost, Status.

**Components:**
- Filters: Type, Status, plus a registration-number search box.
- Vehicle table listing all fields above with status badges (Available /
  On Trip / In Shop / Retired).
- "Add Vehicle" action opens a form to create a new vehicle record.

**Behavior:**
- Registration number is validated as unique before save.
- Status is generally system-managed (via Trip/Maintenance transitions) but
  can be manually set to `Retired` by a Fleet Manager.
- Retired and In Shop vehicles remain visible here (for record-keeping) but
  are excluded from the vehicle picker on the Trips page.

---

### 2.4 Drivers — Drivers & Safety Profiles (`/drivers`)
**Purpose:** Maintain driver profiles and compliance status.

**Fields per driver:** Name, License Number, License Category, License
Expiry, Contact Number, Trip Completion %, Safety Status, Duty Status.

**Components:**
- Driver table with Safety and Status badges (Available / On Trip / Off Duty /
  Suspended).
- Manual status toggle control (Available / On Trip / Off Duty / Suspended).
- "Add Driver" action opens a form to create a new driver record.

**Behavior:**
- Drivers with an expired license or `Suspended` status are flagged and
  excluded from the driver picker on the Trips page.
- License expiry is checked against the current date on every load.

---

### 2.5 Trips — Trip Dispatcher (`/trips`)
**Purpose:** Create and manage trips through their lifecycle.

**Components:**
- Trip lifecycle stepper: Draft → Dispatched → Completed → Cancelled.
- Create Trip form: Source, Destination, Vehicle (available only), Driver
  (available only), Cargo Weight, Planned Distance.
- Inline validation banner showing capacity check result (e.g., vehicle
  capacity vs. cargo weight, with a blocking error if exceeded).
- "Dispatch" and "Cancel" actions (Dispatch disabled until validation passes).
- Live Board: list of current trips with route, assigned vehicle/driver,
  status badge, and ETA or status note (e.g., "Awaiting driver", "Vehicle sent
  to shop").

**Behavior:**
- Vehicle and driver dropdowns only list entities currently `Available`.
- Cargo weight is validated against the selected vehicle's max capacity in
  real time; Dispatch is blocked with an explicit error message if exceeded.
- Dispatching moves the trip to `Dispatched` and sets vehicle/driver to
  `On Trip`.
- Completing a trip (via a completion form capturing final odometer and fuel
  consumed) moves it to `Completed` and frees the vehicle/driver.
- Cancelling a dispatched trip moves it to `Cancelled` and frees the
  vehicle/driver.

---

### 2.6 Maintenance (`/maintenance`)
**Purpose:** Log and track vehicle service records.

**Fields:** Vehicle, Service Type, Cost, Date, Status.

**Components:**
- "Log Service Record" form.
- Service Log table: Vehicle, Service, Cost, Status (In Shop / Completed).
- Status-transition note: creating an active record sets the vehicle to
  In Shop (removed from the dispatch pool); closing it returns the vehicle to
  Available (unless Retired).

**Behavior:**
- Saving a new record with status `Active`/`In Shop` immediately updates the
  linked vehicle's status.
- Marking a record `Completed` restores the vehicle to `Available`, unless the
  vehicle has separately been marked `Retired`.

---

### 2.7 Fuel & Expense Management (`/fuel-expenses`)
**Purpose:** Track fuel consumption and other trip/vehicle-related expenses.

**Components:**
- Fuel Logs table: Vehicle, Date, Liters, Fuel Cost. "Log Fuel" action.
- Other Expenses table: Trip, Vehicle, Toll, Other, Maintenance (linked),
  Total, Status. "Add Expense" action.
- Total Operational Cost summary (auto-calculated as Fuel + Maintenance).

**Behavior:**
- Adding a fuel or expense entry recalculates the per-vehicle and overall
  operational cost total shown at the bottom of the page.
- Expense entries can optionally be linked to a specific trip.

---

### 2.8 Reports & Analytics (`/analytics`)
**Purpose:** Present derived operational and financial metrics.

**Components:**
- KPI cards: Fuel Efficiency (km/l), Fleet Utilization (%), Operational Cost,
  Vehicle ROI (%).
- Monthly Revenue chart (bar chart, trailing months).
- Top Costliest Vehicles chart (horizontal bar, ranked by operational cost).
- CSV export action.

**Behavior:**
- All KPIs and charts recompute from current trip/fuel/maintenance data at
  load time.
- ROI is computed as `(Revenue − (Maintenance + Fuel)) / Acquisition Cost`.
- Export produces a CSV of the underlying analytics dataset.

---

### 2.9 Settings & RBAC (`/settings`)
**Purpose:** Configure general system settings and review role permissions.

**Components:**
- General settings form: Depot Name, Currency, Distance Unit. "Save changes"
  action.
- Role-Based Access (RBAC) table: rows = roles (Fleet Manager, Dispatcher,
  Safety Officer, Financial Analyst), columns = modules (Fleet, Drivers,
  Trips, Fuel/Expenses, Analytics), cells = access level (Full / View / —).

**Behavior:**
- General settings apply globally (currency and distance unit affect labels
  across Fleet, Trips, and Analytics pages).
- The RBAC table is read-only reference in the MVP, reflecting the seeded
  permission matrix described in `architecture.md`.

## 3. Shared Layout Elements (present on all authenticated pages)
- Left sidebar navigation listing all modules the current role can access
  (Dashboard, Fleet, Drivers, Trips, Maintenance, Fuel & Expenses, Analytics,
  Settings), with the current page highlighted.
- Top bar: global search, current user name, and role badge.
