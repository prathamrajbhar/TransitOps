/**
 * src/lib/validate.ts
 * Generic Zod request body/query validator for Route Handlers.
 *
 * Usage (body):
 *   const data = await validateBody(req, CreateVehicleSchema)
 *
 * Usage (query):
 *   const params = validateQuery(req, PaginationSchema)
 */
import { NextRequest } from "next/server";
import { z, ZodSchema } from "zod";
import { ValidationError } from "./errors";

/**
 * Parse and validate the JSON request body against a Zod schema.
 * Throws ValidationError (400) if invalid.
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(
      "Validation failed",
      result.error.flatten().fieldErrors
    );
  }
  return result.data;
}

/**
 * Parse and validate URL search params against a Zod schema.
 * Throws ValidationError (400) if invalid.
 */
export function validateQuery<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): T {
  const rawParams: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    rawParams[key] = value;
  });

  const result = schema.safeParse(rawParams);
  if (!result.success) {
    throw new ValidationError(
      "Invalid query parameters",
      result.error.flatten().fieldErrors
    );
  }
  return result.data;
}

// ─── Shared validation schemas ───────────────────────────────────

/** Standard pagination query params */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationSchema>;

/** Date range query params */
export const DateRangeSchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});
export type DateRangeQuery = z.infer<typeof DateRangeSchema>;

/** CUID / UUID ID param */
export const IdSchema = z.string().cuid("Invalid ID format");

/** Combined pagination + date range */
export const ListQuerySchema = PaginationSchema.merge(DateRangeSchema);
export type ListQuery = z.infer<typeof ListQuerySchema>;
