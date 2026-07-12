import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/rbac";
import type { AuthUser } from "@/types/rbac";
import type { CreateDriverInput, UpdateDriverInput } from "@/lib/validations/driver.schema";
import { NotFoundError, ConflictError } from "@/lib/errors";

export class DriverService {
  static async create(user: AuthUser, input: CreateDriverInput) {
    const existing = await prisma.driver.findUnique({
      where: { licenseNo: input.licenseNo },
    });
    if (existing) throw new ConflictError("Driver with this license number already exists");

    return prisma.driver.create({
      data: { ...input, organizationId: user.organizationId },
    });
  }

  static async list(user: AuthUser, page: number, limit: number, filters?: Record<string, unknown>) {
    const skip = (page - 1) * limit;
    const where = { ...orgScope(user), ...filters } as Record<string, unknown>;

    const [items, total] = await Promise.all([
      prisma.driver.findMany({ where: where as any, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.driver.count({ where: where as any }),
    ]);

    return { items, total, page, limit };
  }

  static async getById(user: AuthUser, id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!driver) throw new NotFoundError("Driver");
    if (driver.organizationId !== user.organizationId) throw new NotFoundError("Driver");

    return driver;
  }

  static async update(user: AuthUser, id: string, input: UpdateDriverInput) {
    await this.getById(user, id);

    if (input.licenseNo) {
      const existing = await prisma.driver.findUnique({
        where: { licenseNo: input.licenseNo },
      });
      if (existing && existing.id !== id) {
        throw new ConflictError("Driver with this license number already exists");
      }
    }

    return prisma.driver.update({
      where: { id },
      data: input as any,
    });
  }

  static async delete(user: AuthUser, id: string) {
    await this.getById(user, id);
    return prisma.driver.update({
      where: { id },
      data: { status: "SUSPENDED" },
    });
  }
}
