import { NextRequest } from "next/server";
import { isAppError } from "@/src/lib/errors";
import { getCurrentUser } from "@/src/lib/auth";
import { requirePermission } from "@/src/lib/rbac";
import { validateBody } from "@/src/lib/validate";
import { UpdateExpenseSchema } from "@/src/lib/validations/expense.schema";
import { ExpenseService } from "@/src/lib/services/expenseService";
import { success, error, unauthorized, serverError, notFound } from "@/src/lib/api-response";
import { logger } from "@/src/lib/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "expenses:read");
    const expense = await ExpenseService.getById(user, id);
    logger.request("GET", `/api/expenses/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(expense);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Expense");
      logger.warn("GET /api/expenses/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("GET /api/expenses/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "expenses:update");
    const body = await validateBody(req, UpdateExpenseSchema);
    const expense = await ExpenseService.update(user, id, body);
    logger.request("PATCH", `/api/expenses/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success(expense);
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Expense");
      logger.warn("PATCH /api/expenses/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("PATCH /api/expenses/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const start = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    requirePermission(user.role, "expenses:delete");
    await ExpenseService.delete(user, id);
    logger.request("DELETE", `/api/expenses/${id}`, { userId: user.userId, durationMs: Date.now() - start, status: 200 });
    return success({ message: "Expense deleted" });
  } catch (err) {
    const durationMs = Date.now() - start;
    if (isAppError(err)) {
      if (err.statusCode === 404) return notFound("Expense");
      logger.warn("DELETE /api/expenses/[id] failed", { message: err.message, code: err.code, durationMs });
      return error(err.message, err.statusCode as never, err.code);
    }
    logger.exception("DELETE /api/expenses/[id] — unhandled error", err, { durationMs });
    return serverError();
  }
}
