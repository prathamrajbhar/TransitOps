import { NextRequest } from "next/server";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validateBody } from "@/lib/validate";
import { DispatchTripSchema } from "@/lib/validations/trip.schema";
import { TripService } from "@/lib/services/tripService";
import { success, error, unauthorized, serverError, notFound, conflict } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user, "trips:dispatch");
    const body = await validateBody(req, DispatchTripSchema);
    const trip = await TripService.dispatch(user, id, body);
    logger.request("POST", `/api/trips/${id}/dispatch`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(trip);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Trip");
      if (err.statusCode === 409) return conflict(err.message);
      logger.warn("POST /api/trips/[id]/dispatch failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("POST /api/trips/[id]/dispatch — unhandled error", err, { durationMs });
    return serverError();
  }
}
