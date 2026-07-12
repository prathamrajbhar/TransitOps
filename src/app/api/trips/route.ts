import { NextRequest } from "next/server";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validateQuery, PaginationSchema, validateBody } from "@/lib/validate";
import { CreateTripSchema } from "@/lib/validations/trip.schema";
import { TripService } from "@/lib/services/tripService";
import { paginationMeta } from "@/lib/prisma";
import { paginated, created, error, unauthorized, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user, "trips:read");
    const { page, limit } = validateQuery(req, PaginationSchema);
    const result = await TripService.list(user, page, limit);
    logger.request("GET", "/api/trips", { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    const meta = paginationMeta(result.total, { page, limit });
    return paginated(result.items, meta);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      logger.warn("GET /api/trips failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("GET /api/trips — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user, "trips:create");
    const body = await validateBody(req, CreateTripSchema);
    const result = await TripService.create(user, body);
    logger.request("POST", "/api/trips", { userId: user.userId, durationMs: Date.now() - start, status: 201 });
    return created(result);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      logger.warn("POST /api/trips failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("POST /api/trips — unhandled error", err, { durationMs });
    return serverError();
  }
}
