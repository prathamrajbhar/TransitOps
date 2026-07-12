import { prisma } from "@/src/lib/prisma";
import { orgScope } from "@/src/lib/rbac";
import type { AuthUser } from "@/src/types/rbac";
import { NotFoundError } from "@/src/lib/errors";

export class FuelExpenseService {
  static async createFuelLog(user: AuthUser, input: any) {
    return prisma.fuelLog.create({
      data: {
        ...input,
        organizationId: user.organizationId,
      },
    });
  }

  static async listFuelLogs(user: AuthUser, page: number, limit: number, filters?: any) {
    const skip = (page - 1) * limit;
    const where = { ...orgScope(user), ...filters };

    const [items, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where,
        skip,
        take: limit,
        include: { vehicle: true, driver: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.fuelLog.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  static async getFuelLogById(user: AuthUser, id: string) {
    const log = await prisma.fuelLog.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });

    if (!log) throw new NotFoundError("Fuel log");
    if (log.organizationId !== user.organizationId) throw new NotFoundError("Fuel log");

    return log;
  }

  static async updateFuelLog(user: AuthUser, id: string, input: any) {
    await this.getFuelLogById(user, id);
    return prisma.fuelLog.update({
      where: { id },
      data: input,
    });
  }

  static async deleteFuelLog(user: AuthUser, id: string) {
    await this.getFuelLogById(user, id);
    return prisma.fuelLog.delete({ where: { id } });
  }
}
