import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/rbac";
import type { AuthUser } from "@/types/rbac";
import type { CreateExpenseInput } from "@/lib/validations/expense.schema";
import { NotFoundError } from "@/lib/errors";

export class ExpenseService {
  static async create(user: AuthUser, input: CreateExpenseInput) {
    const total = Number(input.toll) + Number(input.other) + Number(input.maintenanceLinked);

    return prisma.expense.create({
      data: {
        tripId: input.tripId ?? null,
        vehicleId: input.vehicleId ?? null,
        toll: input.toll,
        other: input.other,
        maintenanceLinked: input.maintenanceLinked,
        total,
        organizationId: user.organizationId,
        createdBy: user.userId,
      },
    });
  }

  static async list(user: AuthUser, page: number, limit: number, filters?: Record<string, unknown>) {
    const skip = (page - 1) * limit;
    const where = { ...orgScope(user), ...filters } as Record<string, unknown>;

    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where: where as any,
        skip,
        take: limit,
        include: { vehicle: true, trip: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.expense.count({ where: where as any }),
    ]);

    return { items, total, page, limit };
  }

  static async getById(user: AuthUser, id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { vehicle: true, trip: true },
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
