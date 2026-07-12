import { prisma } from "@/src/lib/prisma";
import { orgScope } from "@/src/lib/rbac";
import type { AuthUser } from "@/src/types/rbac";
import { NotFoundError } from "@/src/lib/errors";

export class ExpenseService {
  static async create(user: AuthUser, input: any) {
    return prisma.expense.create({
      data: {
        ...input,
        organizationId: user.organizationId,
        createdBy: user.userId,
      },
    });
  }

  static async list(user: AuthUser, page: number, limit: number, filters?: any) {
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

  static async update(user: AuthUser, id: string, input: any) {
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
