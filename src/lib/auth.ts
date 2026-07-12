/**
 * src/lib/auth.ts
 * Authentication helpers: signIn, signOut, getSession, getUser.
 * Uses custom JWT sessions via jose (no next-auth).
 *
 * Per the Next.js 16 auth guide pattern:
 * https://nextjs.org/docs/app/guides/authentication
 */
import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import {
  createSession,
  deleteSession,
  getSession,
  updateSession,
} from "./session";
import { AuthError, NotFoundError } from "./errors";
import type { AuthUser } from "../types/rbac";
import type { Role } from "../types/rbac";

// ─── Sign In ─────────────────────────────────────────────────────

export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Verify credentials and create a session cookie.
 * Throws AuthError on invalid credentials.
 */
export async function signIn(input: SignInInput): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organizationId: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new AuthError("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid email or password");
  }

  await createSession(user.id, user.role as string, user.organizationId);

  const permissions = await resolvePermissions(user.role, user.organizationId);

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    organizationId: user.organizationId,
    permissions,
  };
}

// ─── Sign Out ────────────────────────────────────────────────────

/**
 * Destroy the session cookie.
 */
export async function signOut(): Promise<void> {
  await deleteSession();
}

// ─── Get Current Auth Context ────────────────────────────────────

/**
 * Returns the current session's AuthUser, or null if not authenticated.
 * Use this in Server Components and Route Handlers.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, organizationId: true },
  });
  if (!user) return null;

  const permissions = await resolvePermissions(session.role, user.organizationId);

  return {
    userId: session.userId,
    name: user.name,
    email: user.email,
    role: session.role as Role,
    organizationId: user.organizationId,
    permissions,
  };
}

const DEFAULT_RBAC_MATRIX = {
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

function getPermissionsFromMatrix(
  role: string,
  matrix: Record<string, Record<string, string>>
): string[] {
  const roleAccess = matrix[role] || {};
  const permissions: string[] = ["org:read"];

  // Fleet
  const fleet = roleAccess.FLEET;
  if (fleet === "FULL" || fleet === "VIEW") permissions.push("vehicles:read");
  if (fleet === "FULL") permissions.push("vehicles:create", "vehicles:update", "vehicles:delete");

  // Drivers
  const drivers = roleAccess.DRIVERS;
  if (drivers === "FULL" || drivers === "VIEW") permissions.push("drivers:read");
  if (drivers === "FULL") permissions.push("drivers:create", "drivers:update", "drivers:delete");

  // Trips
  const trips = roleAccess.TRIPS;
  if (trips === "FULL" || trips === "VIEW") permissions.push("trips:read");
  if (trips === "FULL") {
    permissions.push(
      "trips:create",
      "trips:update",
      "trips:delete",
      "trips:dispatch",
      "trips:complete",
      "trips:cancel"
    );
  }

  // Maintenance
  const maint = roleAccess.MAINTENANCE;
  if (maint === "FULL" || maint === "VIEW") permissions.push("maintenance:read");
  if (maint === "FULL") permissions.push("maintenance:create", "maintenance:update", "maintenance:delete");

  // Fuel & Expenses
  const fuel = roleAccess.FUEL_EXPENSES;
  if (fuel === "FULL" || fuel === "VIEW") permissions.push("fuel:read", "expenses:read");
  if (fuel === "FULL") {
    permissions.push(
      "fuel:create", "fuel:update", "fuel:delete",
      "expenses:create", "expenses:update", "expenses:delete"
    );
  }

  // Analytics
  const analytics = roleAccess.ANALYTICS;
  if (analytics === "FULL" || analytics === "VIEW") permissions.push("analytics:read");

  // Settings
  const settings = roleAccess.SETTINGS;
  if (settings === "FULL" || settings === "VIEW") permissions.push("settings:read");
  if (settings === "FULL") permissions.push("settings:update");

  return permissions;
}

async function resolvePermissions(role: string, organizationId: string): Promise<string[]> {
  const settings = await prisma.settings.findUnique({
    where: {
      organizationId_key: {
        organizationId,
        key: "rbac_matrix",
      },
    },
  });

  let matrix = DEFAULT_RBAC_MATRIX;
  if (settings && settings.value) {
    try {
      matrix = typeof settings.value === "string"
        ? JSON.parse(settings.value)
        : settings.value as any;
    } catch (e) {
      console.error("Failed to parse DB rbac_matrix in auth.ts", e);
    }
  }

  return getPermissionsFromMatrix(role, matrix);
}

// ─── Session Refresh ─────────────────────────────────────────────

/**
 * Extend the session expiry — call in middleware on each request.
 */
export async function refreshSession(): Promise<void> {
  await updateSession();
}

// ─── Get full user profile ────────────────────────────────────────

/**
 * Fetch the current user's full record from the database.
 * Throws NotFoundError if the session is stale (user deleted).
 */
export async function getAuthUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organizationId: true,
      createdAt: true,
    },
  });

  if (!user) throw new NotFoundError("User");
  return user;
}

// ─── Password helpers ────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
