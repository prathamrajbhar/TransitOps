import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/rbac";
import type { AuthUser } from "@/types/rbac";
import type { CreateMaintenanceInput, UpdateMaintenanceInput, CloseMaintenanceInput } from "@/lib/validations/maintenance.schema";
import { NotFoundError, ConflictError } from "@/lib/errors";

export class MaintenanceService {
  static async create(user: AuthUser, input: CreateMaintenanceInput) {
    return prisma.maintenanceRecord.create({
      data: {
        ...input,
        organizationId: user.organizationId,
      },
    });
  }

  static async list(user: AuthUser, page: number, limit: number, filters?: Record<string, unknown>) {
    const skip = (page - 1) * limit;
    const where = { ...orgScope(user), ...filters };

    const [items, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        skip,
        take: limit,
        include: { vehicle: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.maintenanceRecord.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  static async getById(user: AuthUser, id: string) {
    const record = await prisma.maintenanceRecord.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!record) throw new NotFoundError("Maintenance record");
    if (record.organizationId !== user.organizationId) throw new NotFoundError("Maintenance record");

    return record;
  }

  static async update(user: AuthUser, id: string, input: UpdateMaintenanceInput) {
    await this.getById(user, id);
    return prisma.maintenanceRecord.update({
      where: { id },
      data: input,
    });
  }

  static async close(user: AuthUser, id: string, input: CloseMaintenanceInput) {
    const record = await this.getById(user, id);
    if (record.status !== "IN_PROGRESS" && record.status !== "SCHEDULED") {
      throw new ConflictError("Can only close scheduled or in-progress maintenance");
    }

    return prisma.maintenanceRecord.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: input.completedAt || new Date(),
        costAmount: input.costAmount || record.costAmount,
      },
    });
  }
}
