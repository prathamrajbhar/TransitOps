import { NextRequest } from "next/server";
import { isAppError } from "@/src/lib/errors";
import { getCurrentUser } from "@/src/lib/auth";
import { requirePermission } from "@/src/lib/rbac";
import { validateBody } from "@/src/lib/validate";
import { UpdateDriverSchema } from "@/src/lib/validations/driver.schema";
import { DriverService } from "@/src/lib/services/driverService";
import { success, error, unauthorized, serverError, notFound } from "@/src/lib/api-response";
import { logger } from "@/src/lib/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "drivers:read");
    const driver = await DriverService.getById(user, id);
    logger.request("GET", `/api/drivers/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(driver);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Driver");
      logger.warn("GET /api/drivers/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("GET /api/drivers/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "drivers:update");
    const body = await validateBody(req, UpdateDriverSchema);
    const driver = await DriverService.update(user, id, body);
    logger.request("PATCH", `/api/drivers/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(driver);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Driver");
      logger.warn("PATCH /api/drivers/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("PATCH /api/drivers/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "drivers:delete");
    await DriverService.delete(user, id);
    logger.request("DELETE", `/api/drivers/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success({ message: "Driver deleted" });
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Driver");
      logger.warn("DELETE /api/drivers/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("DELETE /api/drivers/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}
