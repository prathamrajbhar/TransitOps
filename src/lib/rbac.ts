/**
 * src/lib/rbac.ts
 * Permission matrix and authorization utilities for TransitOps RBAC.
 *
 * Usage:
 *   const can = hasPermission(user.role, "vehicles:create")
 *   requirePermission(user.role, "vehicles:delete") // throws ForbiddenError
 */
import { ForbiddenError, AuthError } from "./errors";
import type { Role, Permission, AuthUser } from "../types/rbac";

// ─── Permission Matrix ───────────────────────────────────────────

const PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "users:read", "users:create", "users:update", "users:delete",
    "vehicles:read", "vehicles:create", "vehicles:update", "vehicles:delete",
    "drivers:read", "drivers:create", "drivers:update", "drivers:delete",
    "trips:read", "trips:create", "trips:update", "trips:delete", "trips:dispatch", "trips:complete", "trips:cancel",
    "maintenance:read", "maintenance:create", "maintenance:update", "maintenance:delete",
    "fuel:read", "fuel:create", "fuel:update", "fuel:delete",
    "expenses:read", "expenses:create", "expenses:update", "expenses:delete",
    "analytics:read",
    "settings:read", "settings:update",
    "org:read", "org:update",
  ],
  MANAGER: [
    "users:read",
    "vehicles:read", "vehicles:create", "vehicles:update",
    "drivers:read", "drivers:create", "drivers:update",
    "trips:read", "trips:create", "trips:update", "trips:dispatch", "trips:complete", "trips:cancel",
    "maintenance:read", "maintenance:create", "maintenance:update",
    "fuel:read", "fuel:create", "fuel:update",
    "expenses:read", "expenses:create", "expenses:update",
    "analytics:read",
    "settings:read",
    "org:read",
  ],
  DISPATCHER: [
    "vehicles:read",
    "drivers:read",
    "trips:read", "trips:create", "trips:update", "trips:dispatch", "trips:cancel",
    "fuel:read",
    "expenses:read",
    "org:read",
  ],
  DRIVER: [
    "trips:read", "trips:complete",
    "fuel:read", "fuel:create",
    "vehicles:read",
    "org:read",
  ],
};

// ─── Check helpers ───────────────────────────────────────────────

/**
 * Returns true if the given role has the specified permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Throws ForbiddenError if the role lacks the permission.
 */
export function requirePermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(
      `Role '${role}' does not have permission: ${permission}`
    );
  }
}

/**
 * Returns true if user has all of the listed permissions.
 */
export function hasAllPermissions(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Throws ForbiddenError unless role is one of the allowed roles.
 */
export function requireRole(role: Role, ...allowed: Role[]): void {
  if (!allowed.includes(role)) {
    throw new ForbiddenError(
      `This action requires one of: ${allowed.join(", ")}`
    );
  }
}

// ─── Org-scoped data isolation ───────────────────────────────────

/**
 * Ensures the queried organizationId matches the session user's org.
 * Admins may bypass this if they are system-level admins (future extension).
 */
export function requireSameOrg(
  user: AuthUser,
  targetOrgId: string
): void {
  if (user.organizationId !== targetOrgId) {
    throw new ForbiddenError("You cannot access data from another organization");
  }
}

/**
 * Returns a Prisma `where` fragment that always scopes queries to the user's org.
 * Usage: prisma.vehicle.findMany({ where: { ...orgScope(user) } })
 */
export function orgScope(user: AuthUser): { organizationId: string } {
  return { organizationId: user.organizationId };
}

// ─── Convenience permission checks ──────────────────────────────

export const canManageVehicles = (role: Role) =>
  hasPermission(role, "vehicles:create");

export const canViewTrips = (role: Role) =>
  hasPermission(role, "trips:read");

export const canDispatchTrips = (role: Role) =>
  hasPermission(role, "trips:dispatch");

export const canManageUsers = (role: Role) =>
  hasPermission(role, "users:create");

export const canViewAnalytics = (role: Role) =>
  hasPermission(role, "analytics:read");

export const canManageSettings = (role: Role) =>
  hasPermission(role, "settings:update");

// ─── Auth guard ──────────────────────────────────────────────────

/**
 * Throws AuthError if user is null (not authenticated).
 */
export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
  if (!user) throw new AuthError();
}
