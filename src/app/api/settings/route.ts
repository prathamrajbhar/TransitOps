import { NextRequest } from "next/server";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission, orgScope } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { success, error, unauthorized, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET() {
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "settings:read");
    const settings = await prisma.settings.findMany({ where: orgScope(user) });
    const merged = settings.reduce((acc, s) => {
      acc[s.key] = s.value as unknown as string;
      return acc;
    }, {} as Record<string, string>);
    logger.request("GET", "/api/settings", { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(merged);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      logger.warn("GET /api/settings failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("GET /api/settings — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "settings:update");
    const body = await req.json() as Record<string, string>;
    for (const [key, value] of Object.entries(body)) {
      await prisma.settings.upsert({
        where: { organizationId_key: { organizationId: user.organizationId, key } },
        update: { value },
        create: { organizationId: user.organizationId, key, value },
      });
    }
    logger.request("PUT", "/api/settings", { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success({ message: "Settings updated" });
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      logger.warn("PUT /api/settings failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("PUT /api/settings — unhandled error", err, { durationMs });
    return serverError();
  }
}
