import { prisma } from "@/src/lib/prisma";
import { orgScope } from "@/src/lib/rbac";
import type { AuthUser } from "@/src/types/rbac";
import type { CreateVehicleInput, UpdateVehicleInput } from "@/src/lib/validations/vehicle.schema";
import { NotFoundError, ConflictError } from "@/src/lib/errors";

export class VehicleService {
  static async create(user: AuthUser, input: CreateVehicleInput) {
    const existing = await prisma.vehicle.findUnique({
      where: { plateNumber: input.plateNumber },
    });
    if (existing) throw new ConflictError("Vehicle with this plate number already exists");

    return prisma.vehicle.create({
      data: { ...input, organizationId: user.organizationId },
    });
  }

  static async list(user: AuthUser, page: number, limit: number, filters?: any) {
    const skip = (page - 1) * limit;
    const where = { ...orgScope(user), ...filters };

    const [items, total] = await Promise.all([
      prisma.vehicle.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.vehicle.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  static async getById(user: AuthUser, id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: { select: { id: true } },
        maintenanceRecords: { select: { id: true } },
        fuelLogs: { select: { id: true } },
      },
    });

    if (!vehicle) throw new NotFoundError("Vehicle");
    if (vehicle.organizationId !== user.organizationId) throw new NotFoundError("Vehicle");

    return vehicle;
  }

  static async update(user: AuthUser, id: string, input: UpdateVehicleInput) {
    const vehicle = await this.getById(user, id);

    if (input.plateNumber && input.plateNumber !== vehicle.plateNumber) {
      const existing = await prisma.vehicle.findUnique({
        where: { plateNumber: input.plateNumber },
      });
      if (existing) throw new ConflictError("Vehicle with this plate number already exists");
    }

    return prisma.vehicle.update({
      where: { id },
      data: input,
    });
  }

  static async delete(user: AuthUser, id: string) {
    await this.getById(user, id);
    return prisma.vehicle.update({
      where: { id },
      data: { status: "RETIRED" },
    });
  }
}
