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

  return {
    userId: user.id,
    role: user.role as Role,
    organizationId: user.organizationId,
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

  return {
    userId: session.userId,
    role: session.role as Role,
    organizationId: session.organizationId,
  };
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
