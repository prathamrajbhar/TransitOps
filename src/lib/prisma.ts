/**
 * src/lib/prisma.ts
 * Global Prisma Client singleton with pg adapter for connection pooling.
 * Uses globalThis to prevent multiple instances in development (hot reload).
 */
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Build a pg Pool with appropriate pool sizing
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Pool size: 2 in serverless/dev, up to 10 in production
  max: process.env.NODE_ENV === "production" ? 10 : 2,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ─── Soft-delete / paranoid helper ──────────────────────────────
/**
 * Returns a Prisma `where` clause that excludes soft-deleted records.
 * Models that support soft-delete must have a `deletedAt` field.
 * Usage: prisma.vehicle.findMany({ where: { ...notDeleted() } })
 */
export function notDeleted() {
  return { deletedAt: null };
}

// ─── Pagination helper ───────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Builds Prisma `skip` and `take` args from page/limit params.
 * Usage: const { skip, take } = paginate({ page: 2, limit: 20 })
 */
export function paginate(params: PaginationParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
}

/**
 * Builds PaginationMeta from result count and request params.
 */
export function paginationMeta(
  total: number,
  params: PaginationParams = {}
): PaginationMeta {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}