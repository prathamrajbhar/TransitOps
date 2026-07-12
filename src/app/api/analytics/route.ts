/**
 * GET /api/analytics
 */
import { NextRequest } from "next/server";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { AnalyticsService } from "@/lib/services/analyticsService";
import { success, error, unauthorized, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    requirePermission(user.role, "analytics:read");

    const type = req.nextUrl.searchParams.get("type") || "dashboard";
    let result;

    switch (type) {
      case "fuel":
        result = await AnalyticsService.getFuelAnalytics(user);
        break;
      case "maintenance":
        result = await AnalyticsService.getMaintenanceAnalytics(user);
        break;
      case "utilization":
        result = await AnalyticsService.getUtilizationAnalytics(user);
        break;
      case "trips":
        result = await AnalyticsService.getTripsAnalytics(user);
        break;
      case "drivers":
        result = await AnalyticsService.getDriverAnalytics(user);
        break;
      default:
        result = await AnalyticsService.getDashboard(user);
    }

    logger.request("GET", "/api/analytics", { userId: user.userId, durationMs: Date.now() - start, status: 200 });

    return success(result);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      logger.warn("GET /api/analytics failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("GET /api/analytics — unhandled error", err, { durationMs });
    return serverError();
  }
}
