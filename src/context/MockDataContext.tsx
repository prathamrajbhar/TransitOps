// --- ENUMS & TYPES ---

export type RoleName = "FLEET_MANAGER" | "DISPATCHER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST";

export type VehicleType = "VAN" | "TRUCK" | "MINI" | "BUS" | "OTHER";
export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";

export type LicenseCategory = "LMV" | "HMV" | "OTHER";
export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";

export type TripStatus = "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
export type MaintenanceStatus = "ACTIVE" | "COMPLETED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  failedLogins: number;
  lockedUntil: string | null;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  registrationNo: string;
  nameModel: string;
  type: VehicleType;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  region: string;
  status: VehicleStatus;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  licenseNo: string;
  licenseCategory: LicenseCategory;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
  createdAt: string;
}

export interface Trip {
  id: string;
  tripCode: string;
  source: string;
  destination: string;
  vehicleId: string | null;
  driverId: string | null;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualDistanceKm: number | null;
  finalOdometerKm: number | null;
  fuelConsumedL: number | null;
  status: TripStatus;
  etaMinutes: number | null;
  createdById: string;
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: string;
  cost: number;
  serviceDate: string;
  status: MaintenanceStatus;
  createdAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  tripId: string | null;
  vehicleId: string | null;
  toll: number;
  other: number;
  maintenanceLinked: number;
  total: number;
  createdAt: string;
}

export interface Settings {
  depotName: string;
  currency: string;
  distanceUnit: string;
}

// Access levels: NONE, VIEW, FULL
export type AccessLevel = "NONE" | "VIEW" | "FULL";
export type ModuleName = "FLEET" | "DRIVERS" | "TRIPS" | "MAINTENANCE" | "FUEL_EXPENSES" | "ANALYTICS" | "SETTINGS";

export const RBAC_MATRIX: Record<RoleName, Record<ModuleName, AccessLevel>> = {
  FLEET_MANAGER: {
    FLEET: "FULL",
    DRIVERS: "FULL",
    TRIPS: "NONE",
    MAINTENANCE: "FULL",
    FUEL_EXPENSES: "NONE",
    ANALYTICS: "FULL",
    SETTINGS: "FULL",
  },
  DISPATCHER: {
    FLEET: "VIEW",
    DRIVERS: "VIEW",
    TRIPS: "FULL",
    MAINTENANCE: "NONE",
    FUEL_EXPENSES: "NONE",
    ANALYTICS: "NONE",
    SETTINGS: "NONE",
  },
  SAFETY_OFFICER: {
    FLEET: "VIEW",
    DRIVERS: "FULL",
    TRIPS: "VIEW",
    MAINTENANCE: "VIEW",
    FUEL_EXPENSES: "NONE",
    ANALYTICS: "NONE",
    SETTINGS: "NONE",
  },
  FINANCIAL_ANALYST: {
    FLEET: "VIEW",
    DRIVERS: "VIEW",
    TRIPS: "VIEW",
    MAINTENANCE: "VIEW",
    FUEL_EXPENSES: "FULL",
    ANALYTICS: "FULL",
    SETTINGS: "NONE",
  },
};
