import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/rbac";
import type { AuthUser } from "@/types/rbac";
import { NotFoundError } from "@/lib/errors";
import { Prisma } from "@/generated/prisma/client";

export class ExpenseService {
  static async create(user: AuthUser, input: Record<string, unknown>) {
    return prisma.expense.create({
      data: {
        ...input,
        organizationId: user.organizationId,
        createdBy: user.userId,
      } as unknown as Prisma.ExpenseCreateInput,
    });
  }

  static async list(user: AuthUser, page: number, limit: number, filters?: Record<string, unknown>) {
    const skip = (page - 1) * limit;
    const where = { ...orgScope(user), ...filters };

    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        include: { vehicle: true, trip: true, creator: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.expense.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  static async getById(user: AuthUser, id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { vehicle: true, trip: true, creator: true },
    });

    if (!expense) throw new NotFoundError("Expense");
    if (expense.organizationId !== user.organizationId) throw new NotFoundError("Expense");

    return expense;
  }

  static async update(user: AuthUser, id: string, input: Record<string, unknown>) {
    await this.getById(user, id);
    return prisma.expense.update({
      where: { id },
      data: input,
    });
  }

  static async delete(user: AuthUser, id: string) {
    await this.getById(user, id);
    return prisma.expense.delete({ where: { id } });
  }
}
