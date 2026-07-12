/**
 * src/app/api/health/route.ts
 * Health-check endpoint — GET /api/health
 * Returns app status and DB connectivity.
 */
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  const start = Date.now();

  let dbStatus: "ok" | "error" = "ok";
  let dbError: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "error";
    dbError = err instanceof Error ? err.message : "Unknown DB error";
    logger.error("Health check DB error", { error: dbError });
  }

  const durationMs = Date.now() - start;
  const healthy = dbStatus === "ok";

  const body = {
    status: healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version ?? "unknown",
    checks: {
      database: {
        status: dbStatus,
        durationMs,
        ...(dbError ? { error: dbError } : {}),
      },
    },
  };

  return Response.json(body, { status: healthy ? 200 : 503 });
}
