import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/rbac";
import type { AuthUser } from "@/types/rbac";
import type { CreateMaintenanceInput, UpdateMaintenanceInput } from "@/lib/validations/maintenance.schema";
import { NotFoundError, ConflictError } from "@/lib/errors";

export class MaintenanceService {
  static async create(user: AuthUser, input: CreateMaintenanceInput) {
    const record = await prisma.maintenanceRecord.create({
      data: {
        vehicleId: input.vehicleId,
        serviceType: input.serviceType,
        cost: input.cost,
        serviceDate: input.serviceDate,
        status: input.status,
        organizationId: user.organizationId,
      },
    });

    // If active maintenance, set the vehicle to IN_SHOP
    if (input.status === "ACTIVE") {
      await prisma.vehicle.update({
        where: { id: input.vehicleId },
        data: { status: "IN_SHOP" },
      }).catch(() => {}); // Vehicle might not exist
    }

    // Auto-create expense entry for maintenance cost
    await prisma.expense.create({
      data: {
        vehicleId: input.vehicleId,
        toll: 0,
        other: 0,
        maintenanceLinked: input.cost,
        total: input.cost,
        organizationId: user.organizationId,
        createdBy: user.userId,
      },
    }).catch(() => {});

    return record;
  }

  static async list(user: AuthUser, page: number, limit: number, filters?: Record<string, unknown>) {
    const skip = (page - 1) * limit;
    const where = { ...orgScope(user), ...filters } as Record<string, unknown>;

    const [items, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where: where as any,
        skip,
        take: limit,
        include: { vehicle: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.maintenanceRecord.count({ where: where as any }),
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
      data: input as any,
    });
  }

  static async close(user: AuthUser, id: string) {
    const record = await this.getById(user, id);
    if (record.status !== "ACTIVE") {
      throw new ConflictError("Can only close active maintenance records");
    }

    const updated = await prisma.maintenanceRecord.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    // Set vehicle back to AVAILABLE (unless retired)
    const vehicle = await prisma.vehicle.findUnique({ where: { id: record.vehicleId } });
    if (vehicle && vehicle.status !== "RETIRED") {
      await prisma.vehicle.update({
        where: { id: record.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    return updated;
  }
}
