import { NextRequest } from "next/server";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validateQuery, PaginationSchema, validateBody } from "@/lib/validate";
import { CreateExpenseSchema } from "@/lib/validations/expense.schema";
import { ExpenseService } from "@/lib/services/expenseService";
import { paginationMeta } from "@/lib/prisma";
import { paginated, created, error, unauthorized, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user, "expenses:read");
    const { page, limit } = validateQuery(req, PaginationSchema);
    const result = await ExpenseService.list(user, page, limit);
    logger.request("GET", "/api/expenses", { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    const meta = paginationMeta(result.total, { page, limit });
    return paginated(result.items, meta);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      logger.warn("GET /api/expenses failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("GET /api/expenses — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user, "expenses:create");
    const body = await validateBody(req, CreateExpenseSchema);
    const result = await ExpenseService.create(user, body);
    logger.request("POST", "/api/expenses", { userId: user.userId, durationMs: Date.now() - start, status: 201 });
    return created(result);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      logger.warn("POST /api/expenses failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("POST /api/expenses — unhandled error", err, { durationMs });
    return serverError();
  }
}
