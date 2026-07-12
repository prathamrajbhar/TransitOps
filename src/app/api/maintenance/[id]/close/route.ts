import { NextRequest } from "next/server";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validateBody } from "@/lib/validate";
import { CloseMaintenanceSchema } from "@/lib/validations/maintenance.schema";
import { MaintenanceService } from "@/lib/services/maintenanceService";
import { success, error, unauthorized, serverError, notFound, conflict } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "maintenance:update");
    const body = await validateBody(req, CloseMaintenanceSchema);
    const record = await MaintenanceService.close(user, id, body);
    logger.request("POST", `/api/maintenance/${id}/close`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(record);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Maintenance record");
      if (err.statusCode === 409) return conflict(err.message);
      logger.warn("POST /api/maintenance/[id]/close failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("POST /api/maintenance/[id]/close — unhandled error", err, { durationMs });
    return serverError();
  }
}
