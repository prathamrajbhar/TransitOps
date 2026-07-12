import { NextRequest } from "next/server";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validateBody } from "@/lib/validate";
import { UpdateMaintenanceSchema } from "@/lib/validations/maintenance.schema";
import { MaintenanceService } from "@/lib/services/maintenanceService";
import { success, error, unauthorized, serverError, notFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user, "maintenance:read");
    const record = await MaintenanceService.getById(user, id);
    logger.request("GET", `/api/maintenance/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(record);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Maintenance record");
      logger.warn("GET /api/maintenance/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("GET /api/maintenance/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user, "maintenance:update");
    const body = await validateBody(req, UpdateMaintenanceSchema);
    const record = await MaintenanceService.update(user, id, body);
    logger.request("PATCH", `/api/maintenance/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(record);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Maintenance record");
      logger.warn("PATCH /api/maintenance/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("PATCH /api/maintenance/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}
