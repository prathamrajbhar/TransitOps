/**
 * src/lib/constants.ts
 * Application-wide constants: status enums, roles, categories.
 * Mirrors Prisma schema enums as plain TS objects for use in client code.
 */

// ─── Roles ───────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  DISPATCHER: "DISPATCHER",
  DRIVER: "DRIVER",
} as const;
export type RoleKey = keyof typeof ROLES;
export type RoleValue = (typeof ROLES)[RoleKey];

// ─── Driver Status ───────────────────────────────────────────────
export const DRIVER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ON_LEAVE: "ON_LEAVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type DriverStatusValue =
  (typeof DRIVER_STATUS)[keyof typeof DRIVER_STATUS];

// ─── Vehicle Type ────────────────────────────────────────────────
export const VEHICLE_TYPE = {
  BUS: "BUS",
  MINIBUS: "MINIBUS",
  VAN: "VAN",
  TRUCK: "TRUCK",
  CAR: "CAR",
  OTHER: "OTHER",
} as const;
export type VehicleTypeValue =
  (typeof VEHICLE_TYPE)[keyof typeof VEHICLE_TYPE];

// ─── Vehicle Status ──────────────────────────────────────────────
export const VEHICLE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  IN_MAINTENANCE: "IN_MAINTENANCE",
  RETIRED: "RETIRED",
} as const;
export type VehicleStatusValue =
  (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

// ─── Trip Status ─────────────────────────────────────────────────
export const TRIP_STATUS = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type TripStatusValue = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];

// ─── Maintenance Type ────────────────────────────────────────────
export const MAINTENANCE_TYPE = {
  PREVENTIVE: "PREVENTIVE",
  CORRECTIVE: "CORRECTIVE",
  INSPECTION: "INSPECTION",
  TIRE: "TIRE",
  OIL_CHANGE: "OIL_CHANGE",
  OTHER: "OTHER",
} as const;
export type MaintenanceTypeValue =
  (typeof MAINTENANCE_TYPE)[keyof typeof MAINTENANCE_TYPE];

// ─── Maintenance Status ──────────────────────────────────────────
export const MAINTENANCE_STATUS = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type MaintenanceStatusValue =
  (typeof MAINTENANCE_STATUS)[keyof typeof MAINTENANCE_STATUS];

// ─── Expense Category ────────────────────────────────────────────
export const EXPENSE_CATEGORY = {
  FUEL: "FUEL",
  MAINTENANCE: "MAINTENANCE",
  INSURANCE: "INSURANCE",
  TOLL: "TOLL",
  PARKING: "PARKING",
  SALARY: "SALARY",
  OFFICE: "OFFICE",
  OTHER: "OTHER",
} as const;
export type ExpenseCategoryValue =
  (typeof EXPENSE_CATEGORY)[keyof typeof EXPENSE_CATEGORY];

// ─── Pagination ──────────────────────────────────────────────────
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ─── Cookie ──────────────────────────────────────────────────────
export const SESSION_COOKIE_NAME = "transitops_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
