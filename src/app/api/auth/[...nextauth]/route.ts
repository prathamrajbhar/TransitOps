/**
 * src/app/api/auth/[...nextauth]/route.ts
 * Custom credential-based auth endpoints (login + logout + signup).
 * No next-auth — uses our custom JWT session system.
 *
 * POST /api/auth/login   → signIn
 * POST /api/auth/logout  → signOut
 * POST /api/auth/signup  → create user + signIn
 */
import { NextRequest, NextResponse } from "next/server";
import { validateBody } from "@/lib/validate";
import { LoginSchema, SignupSchema } from "@/lib/validations/user.schema";
import { signIn, signOut, hashPassword, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConflictError, isAppError } from "@/lib/errors";
import { success, error, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

// Next.js 16 — route params are async
type RouteContext = { params: Promise<{ nextauth: string[] }> };

// ─── GET /api/auth/[...nextauth] ──────────────────────────────────────────────
export async function GET(req: NextRequest, ctx: RouteContext) {
  const { nextauth } = await ctx.params;
  const action = nextauth?.[0];
  const start = Date.now();

  try {
    switch (action) {
      case "session": {
        const user = await getCurrentUser();
        logger.request("GET", `/api/auth/session`, { durationMs: Date.now() - start, status: 200 });
        if (!user) {
          return NextResponse.json({ success: true, data: null });
        }
        return NextResponse.json({ success: true, data: user });
      }
      default:
        return error(`Unknown auth action: ${action ?? "none"}`, 400, "BAD_REQUEST");
    }
  } catch (err) {
    if (isAppError(err)) {
      return error(err.message, err.statusCode as never, err.code, err.details);
    }
    logger.exception(`Unhandled error on GET /api/auth/${action}`, err);
    return serverError();
  }
}

// ─── POST /api/auth/[...nextauth] ─────────────────────────────────────────────
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { nextauth } = await ctx.params;
  const action = nextauth?.[0];
  const start = Date.now();

  try {
    switch (action) {
      case "login": {
        const body = await validateBody(req, LoginSchema);
        const user = await signIn(body);
        logger.request("POST", `/api/auth/login`, { durationMs: Date.now() - start, status: 200 });
        return success({ userId: user.userId, role: user.role });
      }

      case "logout": {
        await signOut();
        logger.request("POST", `/api/auth/logout`, { durationMs: Date.now() - start, status: 200 });
        return success({ message: "Logged out successfully" });
      }

      case "signup": {
        const body = await validateBody(req, SignupSchema);

        // Check for duplicate email
        const existing = await prisma.user.findUnique({
          where: { email: body.email },
          select: { id: true },
        });
        if (existing) {
          throw new ConflictError("An account with this email already exists");
        }

        // Auto-join primary organization if not provided to share same dashboard data and RBAC settings
        let organizationId = body.organizationId;
        if (!organizationId) {
          const primaryOrg = await prisma.organization.findFirst({
            orderBy: { createdAt: "asc" },
          });
          if (primaryOrg) {
            organizationId = primaryOrg.id;
          } else {
            const org = await prisma.organization.create({
              data: {
                name: "Primary Logistics Org",
                slug: "primary-org",
              },
            });
            organizationId = org.id;
          }
        }

        // Create user
        const passwordHash = await hashPassword(body.password);
        const user = await prisma.user.create({
          data: {
            name: body.name,
            email: body.email,
            passwordHash,
            role: body.role as never,
            organizationId,
          },
          select: { id: true, role: true, organizationId: true },
        });

        // Auto sign-in after signup
        await signIn({ email: body.email, password: body.password });

        logger.request("POST", `/api/auth/signup`, { durationMs: Date.now() - start, status: 201 });
        return success({ userId: user.id, role: user.role }, 201);
      }

      default:
        return error(`Unknown auth action: ${action ?? "none"}`, 400, "BAD_REQUEST");
    }
  } catch (err) {
    if (isAppError(err)) {
      return error(err.message, err.statusCode as never, err.code, err.details);
    }
    logger.exception(`Unhandled error on POST /api/auth/${action}`, err);
    return serverError();
  }
}
