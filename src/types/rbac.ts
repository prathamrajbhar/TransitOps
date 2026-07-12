/**
 * src/types/rbac.ts
 * Role and permission type definitions for TransitOps RBAC system.
 */

// ─── Roles ───────────────────────────────────────

export type Role = "FLEET_MANAGER" | "DISPATCHER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST";

export const ALL_ROLES: Role[] = ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];

// ─── Permission Keys ─────────────────────────────

export type Permission =
  // Users
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  // Vehicles
  | "vehicles:read"
  | "vehicles:create"
  | "vehicles:update"
  | "vehicles:delete"
  // Drivers
  | "drivers:read"
  | "drivers:create"
  | "drivers:update"
  | "drivers:delete"
  // Trips
  | "trips:read"
  | "trips:create"
  | "trips:update"
  | "trips:delete"
  | "trips:dispatch"
  | "trips:complete"
  | "trips:cancel"
  // Maintenance
  | "maintenance:read"
  | "maintenance:create"
  | "maintenance:update"
  | "maintenance:delete"
  // Fuel logs
  | "fuel:read"
  | "fuel:create"
  | "fuel:update"
  | "fuel:delete"
  // Expenses
  | "expenses:read"
  | "expenses:create"
  | "expenses:update"
  | "expenses:delete"
  // Analytics
  | "analytics:read"
  // Settings
  | "settings:read"
  | "settings:update"
  // Organization
  | "org:read"
  | "org:update";

// ─── RBAC session context ─────────────────────────

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  permissions?: string[];
}
