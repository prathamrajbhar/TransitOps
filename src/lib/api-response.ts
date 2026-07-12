/**
 * src/lib/api-response.ts
 * Standard API response helpers for consistent JSON shape across all routes.
 *
 * Response shape:
 *   { success: true,  data: T,             meta?: PaginationMeta }
 *   { success: false, error: string, code: string, details?: unknown }
 */
import { NextResponse } from "next/server";
import type { PaginationMeta } from "./prisma";

// ─── Success ─────────────────────────────────────────────────────

export function success<T>(data: T, status: 200 | 201 = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return success(data, 201);
}

export function paginated<T>(
  items: T[],
  meta: PaginationMeta,
  status: 200 = 200
) {
  return NextResponse.json(
    { success: true, data: items, meta },
    { status }
  );
}

// ─── Error ───────────────────────────────────────────────────────

type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 500;

export function error(
  message: string,
  status: ErrorStatus = 500,
  code = "ERROR",
  details?: unknown
) {
  return NextResponse.json(
    { success: false, error: message, code, ...(details ? { details } : {}) },
    { status }
  );
}

export function badRequest(message: string, details?: unknown) {
  return error(message, 400, "VALIDATION_ERROR", details);
}

export function unauthorized(message = "Authentication required") {
  return error(message, 401, "UNAUTHENTICATED");
}

export function forbidden(message = "Forbidden") {
  return error(message, 403, "FORBIDDEN");
}

export function notFound(resource = "Resource") {
  return error(`${resource} not found`, 404, "NOT_FOUND");
}

export function conflict(message = "Resource already exists") {
  return error(message, 409, "CONFLICT");
}

export function serverError(message = "Internal server error") {
  return error(message, 500, "INTERNAL_ERROR");
}
