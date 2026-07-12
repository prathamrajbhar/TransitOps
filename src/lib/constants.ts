/**
 * src/lib/constants.ts
 * Application-wide constants: status enums, roles, categories.
 * Mirrors Prisma schema enums as plain TS objects for client code.
 */

// ─── Roles ───────────────────────────────────────
export const ROLES = {
  FLEET_MANAGER: "FLEET_MANAGER",
  DISPATCHER: "DISPATCHER",
  SAFETY_OFFICER: "SAFETY_OFFICER",
  FINANCIAL_ANALYST: "FINANCIAL_ANALYST",
} as const;
export type RoleKey = keyof typeof ROLES;
export type RoleValue = (typeof ROLES)[RoleKey];

// ─── Vehicle Type ────────────────────────────────
export const VEHICLE_TYPE = {
  VAN: "VAN",
  TRUCK: "TRUCK",
  MINI: "MINI",
  BUS: "BUS",
  OTHER: "OTHER",
} as const;
export type VehicleTypeValue = (typeof VEHICLE_TYPE)[keyof typeof VEHICLE_TYPE];

// ─── Vehicle Status ──────────────────────────────
export const VEHICLE_STATUS = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  IN_SHOP: "IN_SHOP",
  RETIRED: "RETIRED",
} as const;
export type VehicleStatusValue = (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

// ─── Driver Status ───────────────────────────────
export const DRIVER_STATUS = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  OFF_DUTY: "OFF_DUTY",
  SUSPENDED: "SUSPENDED",
} as const;
export type DriverStatusValue = (typeof DRIVER_STATUS)[keyof typeof DRIVER_STATUS];

// ─── License Category ───────────────────────────
export const LICENSE_CATEGORY = {
  LMV: "LMV",
  HMV: "HMV",
  OTHER: "OTHER",
} as const;
export type LicenseCategoryValue = (typeof LICENSE_CATEGORY)[keyof typeof LICENSE_CATEGORY];

// ─── Trip Status ─────────────────────────────────
export const TRIP_STATUS = {
  DRAFT: "DRAFT",
  DISPATCHED: "DISPATCHED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type TripStatusValue = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];

// ─── Maintenance Status ──────────────────────────
export const MAINTENANCE_STATUS = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
} as const;
export type MaintenanceStatusValue =
  (typeof MAINTENANCE_STATUS)[keyof typeof MAINTENANCE_STATUS];

// ─── Pagination ──────────────────────────────────
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ─── Cookie ──────────────────────────────────────
export const SESSION_COOKIE_NAME = "transitops_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
