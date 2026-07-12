import { NextRequest } from "next/server";
import { isAppError } from "@/src/lib/errors";
import { getCurrentUser } from "@/src/lib/auth";
import { requirePermission } from "@/src/lib/rbac";
import { validateBody } from "@/src/lib/validate";
import { CancelTripSchema } from "@/src/lib/validations/trip.schema";
import { TripService } from "@/src/lib/services/tripService";
import { success, error, unauthorized, serverError, notFound, conflict } from "@/src/lib/api-response";
import { logger } from "@/src/lib/logger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "trips:cancel");
    const body = await validateBody(req, CancelTripSchema);
    const trip = await TripService.cancel(user, id, body);
    logger.request("POST", `/api/trips/${id}/cancel`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(trip);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Trip");
      if (err.statusCode === 409) return conflict(err.message);
      logger.warn("POST /api/trips/[id]/cancel failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("POST /api/trips/[id]/cancel — unhandled error", err, { durationMs });
    return serverError();
  }
}
