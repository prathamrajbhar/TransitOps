import { NextRequest } from "next/server";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validateBody } from "@/lib/validate";
import { UpdateVehicleSchema } from "@/lib/validations/vehicle.schema";
import { VehicleService } from "@/lib/services/vehicleService";
import { success, error, unauthorized, serverError, notFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "vehicles:read");
    const vehicle = await VehicleService.getById(user, id);
    logger.request("GET", `/api/vehicles/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(vehicle);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Vehicle");
      logger.warn("GET /api/vehicles/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("GET /api/vehicles/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "vehicles:update");
    const body = await validateBody(req, UpdateVehicleSchema);
    const vehicle = await VehicleService.update(user, id, body);
    logger.request("PATCH", `/api/vehicles/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(vehicle);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Vehicle");
      logger.warn("PATCH /api/vehicles/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("PATCH /api/vehicles/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "vehicles:delete");
    await VehicleService.delete(user, id);
    logger.request("DELETE", `/api/vehicles/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success({ message: "Vehicle deleted" });
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Vehicle");
      logger.warn("DELETE /api/vehicles/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("DELETE /api/vehicles/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}
