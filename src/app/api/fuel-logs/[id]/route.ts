import { NextRequest } from "next/server";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validateBody } from "@/lib/validate";
import { UpdateFuelLogSchema } from "@/lib/validations/fuelExpense.schema";
import { FuelExpenseService } from "@/lib/services/fuelExpenseService";
import { success, error, unauthorized, serverError, notFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "fuel:read");
    const log = await FuelExpenseService.getFuelLogById(user, id);
    logger.request("GET", `/api/fuel-logs/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(log);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Fuel log");
      logger.warn("GET /api/fuel-logs/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("GET /api/fuel-logs/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "fuel:update");
    const body = await validateBody(req, UpdateFuelLogSchema);
    const log = await FuelExpenseService.updateFuelLog(user, id, body);
    logger.request("PATCH", `/api/fuel-logs/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(log);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Fuel log");
      logger.warn("PATCH /api/fuel-logs/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("PATCH /api/fuel-logs/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "fuel:delete");
    await FuelExpenseService.deleteFuelLog(user, id);
    logger.request("DELETE", `/api/fuel-logs/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success({ message: "Fuel log deleted" });
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Fuel log");
      logger.warn("DELETE /api/fuel-logs/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("DELETE /api/fuel-logs/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}
