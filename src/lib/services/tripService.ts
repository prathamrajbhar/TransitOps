import { prisma } from "@/src/lib/prisma";
import { orgScope } from "@/src/lib/rbac";
import type { AuthUser } from "@/src/types/rbac";
import type { CreateTripInput, UpdateTripInput, DispatchTripInput, CompleteTripInput, CancelTripInput } from "@/src/lib/validations/trip.schema";
import { NotFoundError, ConflictError } from "@/src/lib/errors";

export class TripService {
  static async create(user: AuthUser, input: CreateTripInput) {
    return prisma.trip.create({
      data: {
        ...input,
        status: "SCHEDULED",
        organizationId: user.organizationId,
      },
    });
  }

  static async list(user: AuthUser, page: number, limit: number, filters?: any) {
    const skip = (page - 1) * limit;
    const where = { ...orgScope(user), ...filters };

    const [items, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: limit,
        include: { vehicle: true, driver: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.trip.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  static async getById(user: AuthUser, id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        expenses: true,
      },
    });

    if (!trip) throw new NotFoundError("Trip");
    if (trip.organizationId !== user.organizationId) throw new NotFoundError("Trip");

    return trip;
  }

  static async update(user: AuthUser, id: string, input: UpdateTripInput) {
    await this.getById(user, id);
    return prisma.trip.update({
      where: { id },
      data: input,
    });
  }

  static async dispatch(user: AuthUser, id: string, input: DispatchTripInput) {
    const trip = await this.getById(user, id);
    if (trip.status !== "SCHEDULED") {
      throw new ConflictError("Trip must be in SCHEDULED status to dispatch");
    }

    return prisma.trip.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        startTime: input.startTime || new Date(),
      },
    });
  }

  static async complete(user: AuthUser, id: string, input: CompleteTripInput) {
    const trip = await this.getById(user, id);
    if (trip.status !== "IN_PROGRESS") {
      throw new ConflictError("Trip must be IN_PROGRESS to complete");
    }

    return prisma.trip.update({
      where: { id },
      data: {
        status: "COMPLETED",
        endTime: input.endTime || new Date(),
        distanceKm: input.distanceKm || trip.distanceKm,
      },
    });
  }

  static async cancel(user: AuthUser, id: string, input: CancelTripInput) {
    const trip = await this.getById(user, id);
    if (trip.status === "COMPLETED" || trip.status === "CANCELLED") {
      throw new ConflictError(`Cannot cancel a ${trip.status} trip`);
    }

    return prisma.trip.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }
}
