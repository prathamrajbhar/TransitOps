/**
 * src/lib/rbac.ts
 * Permission matrix and authorization utilities for TransitOps RBAC.
 *
 * Usage:
 *   const can = hasPermission(user, "vehicles:create")
 *   requirePermission(user, "vehicles:delete") // throws ForbiddenError
 */
import { ForbiddenError, AuthError } from "./errors";
import type { Role, Permission, AuthUser } from "../types/rbac";

// ─── Permission Matrix ───────────────────────────

const PERMISSIONS: Record<Role, Permission[]> = {
  FLEET_MANAGER: [
    "users:read", "users:create", "users:update",
    "vehicles:read", "vehicles:create", "vehicles:update", "vehicles:delete",
    "drivers:read", "drivers:create", "drivers:update", "drivers:delete",
    "trips:read", "trips:create", "trips:update", "trips:dispatch", "trips:complete", "trips:cancel",
    "maintenance:read", "maintenance:create", "maintenance:update", "maintenance:delete",
    "fuel:read", "fuel:create", "fuel:update",
    "expenses:read", "expenses:create", "expenses:update",
    "analytics:read",
    "settings:read", "settings:update",
    "org:read", "org:update",
  ],
  DISPATCHER: [
    "vehicles:read",
    "drivers:read",
    "trips:read", "trips:create", "trips:update", "trips:dispatch", "trips:complete", "trips:cancel",
    "fuel:read",
    "expenses:read",
    "org:read",
  ],
  SAFETY_OFFICER: [
    "drivers:read", "drivers:create", "drivers:update",
    "vehicles:read",
    "trips:read",
    "maintenance:read",
    "org:read",
  ],
  FINANCIAL_ANALYST: [
    "vehicles:read",
    "drivers:read",
    "trips:read",
    "fuel:read", "fuel:create", "fuel:update",
    "expenses:read", "expenses:create", "expenses:update",
    "maintenance:read",
    "analytics:read",
    "settings:read",
    "org:read",
  ],
};

// ─── Check helpers ───────────────────────────────

export function hasPermission(user: AuthUser, permission: Permission): boolean {
  if (user.permissions) {
    return user.permissions.includes(permission);
  }
  return PERMISSIONS[user.role]?.includes(permission) ?? false;
}

export function requirePermission(user: AuthUser, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new ForbiddenError(
      `Role '${user.role}' does not have permission: ${permission}`
    );
  }
}

export function hasAllPermissions(
  user: AuthUser,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(user, p));
}

export function requireRole(role: Role, ...allowed: Role[]): void {
  if (!allowed.includes(role)) {
    throw new ForbiddenError(
      `This action requires one of: ${allowed.join(", ")}`
    );
  }
}

// ─── Org-scoped data isolation ───────────────────

export function requireSameOrg(
  user: AuthUser,
  targetOrgId: string
): void {
  if (user.organizationId !== targetOrgId) {
    throw new ForbiddenError("You cannot access data from another organization");
  }
}

export function orgScope(user: AuthUser): { organizationId: string } {
  return { organizationId: user.organizationId };
}

// ─── Guards ──────────────────────────────────────

export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
  if (!user) throw new AuthError();
}
