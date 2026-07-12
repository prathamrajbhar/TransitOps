/**
 * src/lib/async-handler.ts
 * Wraps Next.js App Router route handlers with a try/catch block.
 * Automatically maps AppError subclasses to their HTTP status codes,
 * and logs + returns a 500 for unexpected errors.
 *
 * Usage:
 *   export const GET = asyncHandler(async (req) => {
 *     ...
 *     return success(data)
 *   })
 */
import { NextRequest, NextResponse } from "next/server";
import { isAppError } from "./errors";
import { logger } from "./logger";
import { serverError, error } from "./api-response";

type RouteContext = { params?: Record<string, string | string[]> };

type Handler = (
  req: NextRequest,
  ctx?: RouteContext
) => Promise<NextResponse> | NextResponse;

export function asyncHandler(handler: Handler): Handler {
  return async (req: NextRequest, ctx?: RouteContext) => {
    const start = Date.now();
    const path = req.nextUrl.pathname;
    const method = req.method;

    try {
      const response = await handler(req, ctx);
      logger.request(method, path, {
        status: response.status,
        durationMs: Date.now() - start,
      });
      return response;
    } catch (err) {
      const durationMs = Date.now() - start;

      if (isAppError(err)) {
        logger.warn(`${method} ${path} → ${err.statusCode} ${err.code}`, {
          message: err.message,
          durationMs,
        });
        return error(err.message, err.statusCode as never, err.code, err.details);
      }

      // Unexpected error
      logger.exception(`Unhandled error on ${method} ${path}`, err, {
        durationMs,
      });
      return serverError();
    }
  };
}
