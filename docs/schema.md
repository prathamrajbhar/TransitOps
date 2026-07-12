# TransitOps — Database Schema

Database: PostgreSQL
ORM: Prisma

## 1. Entity Overview

- **User** — login account, tied to one Role.
- **Role** — Fleet Manager / Dispatcher / Safety Officer / Financial Analyst.
- **Vehicle** — master fleet record.
- **Driver** — master driver record.
- **Trip** — dispatch record linking a Vehicle and a Driver.
- **MaintenanceLog** — service record for a Vehicle.
- **FuelLog** — fuel fill-up record for a Vehicle.
- **Expense** — toll/misc expense, optionally linked to a Trip.
- **RolePermission** — RBAC matrix mapping Role → Module → Access level.
- **Settings** — general org-level configuration (single row).

## 2. Enums

```prisma
enum RoleName {
  FLEET_MANAGER
  DISPATCHER
  SAFETY_OFFICER
  FINANCIAL_ANALYST
}

enum VehicleType {
  VAN
  TRUCK
  MINI
  BUS
  OTHER
}

enum VehicleStatus {
  AVAILABLE
  ON_TRIP
  IN_SHOP
  RETIRED
}

enum LicenseCategory {
  LMV
  HMV
  OTHER
}

enum DriverStatus {
  AVAILABLE
  ON_TRIP
  OFF_DUTY
  SUSPENDED
}

enum TripStatus {
  DRAFT
  DISPATCHED
  COMPLETED
  CANCELLED
}

enum MaintenanceStatus {
  ACTIVE
  COMPLETED
}

enum AccessLevel {
  NONE
  VIEW
  FULL
}

enum ModuleName {
  FLEET
  DRIVERS
  TRIPS
  FUEL_EXPENSES
  ANALYTICS
  MAINTENANCE
  SETTINGS
}
```

## 3. Prisma Schema

```prisma
model Role {
  id          String   @id @default(cuid())
  name        RoleName @unique
  users       User[]
  permissions RolePermission[]
  createdAt   DateTime @default(now())
}

model RolePermission {
  id         String      @id @default(cuid())
  role       Role        @relation(fields: [roleId], references: [id])
  roleId     String
  module     ModuleName
  access     AccessLevel @default(NONE)

  @@unique([roleId, module])
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  passwordHash  String
  role          Role      @relation(fields: [roleId], references: [id])
  roleId        String
  failedLogins  Int       @default(0)
  lockedUntil   DateTime?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  maintenanceLogs MaintenanceLog[] @relation("LoggedBy")
  fuelLogs        FuelLog[]        @relation("LoggedBy")
  expenses        Expense[]        @relation("LoggedBy")
  tripsCreated    Trip[]           @relation("CreatedBy")
}

model Vehicle {
  id               String        @id @default(cuid())
  registrationNo   String        @unique
  nameModel        String
  type             VehicleType
  maxLoadCapacityKg Decimal      @db.Decimal(10, 2)
  odometerKm       Decimal       @db.Decimal(10, 2) @default(0)
  acquisitionCost  Decimal       @db.Decimal(12, 2)
  region           String?
  status           VehicleStatus @default(AVAILABLE)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  trips            Trip[]
  maintenanceLogs  MaintenanceLog[]
  fuelLogs         FuelLog[]
  expenses         Expense[]

  @@index([status])
  @@index([type])
}

model Driver {
  id                String       @id @default(cuid())
  name              String
  licenseNo         String       @unique
  licenseCategory   LicenseCategory
  licenseExpiry     DateTime
  contactNumber     String
  safetyScore       Int          @default(100)
  status            DriverStatus @default(AVAILABLE)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  trips             Trip[]

  @@index([status])
}

model Trip {
  id              String     @id @default(cuid())
  tripCode        String     @unique
  source          String
  destination     String
  vehicle         Vehicle?   @relation(fields: [vehicleId], references: [id])
  vehicleId       String?
  driver          Driver?    @relation(fields: [driverId], references: [id])
  driverId        String?
  cargoWeightKg   Decimal    @db.Decimal(10, 2)
  plannedDistanceKm Decimal  @db.Decimal(10, 2)
  actualDistanceKm  Decimal? @db.Decimal(10, 2)
  finalOdometerKm   Decimal? @db.Decimal(10, 2)
  fuelConsumedL     Decimal? @db.Decimal(10, 2)
  status          TripStatus @default(DRAFT)
  etaMinutes      Int?
  createdBy       User?      @relation("CreatedBy", fields: [createdById], references: [id])
  createdById     String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  expenses        Expense[]

  @@index([status])
  @@index([vehicleId])
  @@index([driverId])
}

model MaintenanceLog {
  id          String            @id @default(cuid())
  vehicle     Vehicle           @relation(fields: [vehicleId], references: [id])
  vehicleId   String
  serviceType String
  cost        Decimal           @db.Decimal(12, 2)
  serviceDate DateTime
  status      MaintenanceStatus @default(ACTIVE)
  loggedBy    User?             @relation("LoggedBy", fields: [loggedById], references: [id])
  loggedById  String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([vehicleId])
  @@index([status])
}

model FuelLog {
  id          String   @id @default(cuid())
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id])
  vehicleId   String
  date        DateTime
  liters      Decimal  @db.Decimal(10, 2)
  cost        Decimal  @db.Decimal(12, 2)
  loggedBy    User?    @relation("LoggedBy", fields: [loggedById], references: [id])
  loggedById  String?
  createdAt   DateTime @default(now())

  @@index([vehicleId])
}

model Expense {
  id          String   @id @default(cuid())
  trip        Trip?    @relation(fields: [tripId], references: [id])
  tripId      String?
  vehicle     Vehicle? @relation(fields: [vehicleId], references: [id])
  vehicleId   String?
  toll        Decimal  @db.Decimal(12, 2) @default(0)
  other       Decimal  @db.Decimal(12, 2) @default(0)
  maintenanceLinked Decimal @db.Decimal(12, 2) @default(0)
  total       Decimal  @db.Decimal(12, 2)
  loggedBy    User?    @relation("LoggedBy", fields: [loggedById], references: [id])
  loggedById  String?
  createdAt   DateTime @default(now())

  @@index([tripId])
  @@index([vehicleId])
}

model Settings {
  id           String @id @default(cuid())
  depotName    String
  currency     String @default("INR")
  distanceUnit String @default("KM")
  updatedAt    DateTime @updatedAt
}
```

## 4. Key Relationships
- `User` → `Role` (many-to-one): every user has exactly one role, which drives
  RBAC via `RolePermission`.
- `Trip` → `Vehicle`, `Trip` → `Driver` (many-to-one, nullable until dispatch):
  a Draft trip may not yet have a vehicle/driver assigned.
- `MaintenanceLog` → `Vehicle` (many-to-one): each service record belongs to
  one vehicle; an `ACTIVE` record drives the vehicle's `IN_SHOP` status.
- `FuelLog` → `Vehicle`, `Expense` → `Trip`/`Vehicle`: used to compute total
  operational cost per vehicle.

## 5. Derived / Computed Values (not stored, calculated at query time)
- **Fleet Utilization %** = (Vehicles with status `ON_TRIP`) / (Total non-retired
  vehicles) × 100.
- **Total Operational Cost (per vehicle)** = SUM(FuelLog.cost) +
  SUM(MaintenanceLog.cost) for that vehicle.
- **Fuel Efficiency (km/l)** = Trip distance / Fuel consumed (aggregated per
  vehicle or fleet-wide).
- **Vehicle ROI** = (Revenue − (Maintenance Cost + Fuel Cost)) / Acquisition Cost.
- **Trip Completion %** (per driver) = Completed trips / Total assigned trips.

## 6. Constraint Enforcement Notes
- `registrationNo` and `licenseNo` are unique at the database level.
- Application-layer validation (in API route handlers, backed by Zod) enforces:
  - Cargo weight ≤ vehicle max load capacity before allowing `DRAFT →
    DISPATCHED`.
  - Vehicle/Driver status must be `AVAILABLE` before assignment to a new trip.
  - Vehicles with status `IN_SHOP` or `RETIRED` are excluded from the
    vehicle-selection query used in Trip creation.
  - Drivers with `licenseExpiry` in the past, or status `SUSPENDED`, are
    excluded from the driver-selection query used in Trip creation.
- Status transition side-effects (trip dispatch/complete/cancel, maintenance
  create/close) are implemented as single database transactions to keep
  Vehicle/Driver/Trip/MaintenanceLog status changes atomic and consistent.
