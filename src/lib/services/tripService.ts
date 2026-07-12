import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/rbac";
import type { AuthUser } from "@/types/rbac";
import type { CreateTripInput, DispatchTripInput, CompleteTripInput } from "@/lib/validations/trip.schema";
import { NotFoundError, ConflictError } from "@/lib/errors";

export class TripService {
  static async create(user: AuthUser, input: CreateTripInput) {
    // Generate trip code
    const count = await prisma.trip.count();
    const tripCode = `TR${String(count + 1).padStart(3, "0")}`;

    return prisma.trip.create({
      data: {
        tripCode,
        source: input.source,
        destination: input.destination,
        vehicleId: input.vehicleId ?? null,
        driverId: input.driverId ?? null,
        cargoWeightKg: input.cargoWeightKg,
        plannedDistanceKm: input.plannedDistanceKm,
        etaMinutes: input.etaMinutes ?? null,
        status: "DRAFT",
        createdById: user.userId,
        organizationId: user.organizationId,
      },
    });
  }

  static async list(user: AuthUser, page: number, limit: number, filters?: Record<string, unknown>) {
    const skip = (page - 1) * limit;
    const where = { ...orgScope(user), ...filters } as Record<string, unknown>;

    const [items, total] = await Promise.all([
      prisma.trip.findMany({
        where: where as any,
        skip,
        take: limit,
        include: { vehicle: true, driver: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.trip.count({ where: where as any }),
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

  static async update(user: AuthUser, id: string, input: Partial<CreateTripInput>) {
    await this.getById(user, id);
    return prisma.trip.update({
      where: { id },
      data: input as any,
    });
  }

  static async dispatch(user: AuthUser, id: string, _input: DispatchTripInput) {
    const trip = await this.getById(user, id);
    if (trip.status !== "DRAFT") {
      throw new ConflictError("Trip must be in DRAFT status to dispatch");
    }

    // Validate vehicle and driver are assigned
    if (!trip.vehicleId) {
      throw new ConflictError("Trip must have an assigned vehicle before dispatching");
    }
    if (!trip.driverId) {
      throw new ConflictError("Trip must have an assigned driver before dispatching");
    }

    // Check vehicle capacity
    const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
    if (vehicle && trip.cargoWeightKg > vehicle.maxLoadCapacityKg) {
      throw new ConflictError(
        `Cargo weight (${trip.cargoWeightKg} kg) exceeds vehicle max capacity (${vehicle.maxLoadCapacityKg} kg)`
      );
    }

    // Check vehicle is AVAILABLE
    if (vehicle && vehicle.status !== "AVAILABLE") {
      throw new ConflictError(`Vehicle ${vehicle.nameModel} is currently ${vehicle.status}`);
    }

    // Check driver is AVAILABLE and has valid license
    const driver = await prisma.driver.findUnique({ where: { id: trip.driverId } });
    if (driver && driver.status !== "AVAILABLE") {
      throw new ConflictError(`Driver is currently ${driver.status}`);
    }
    if (driver && new Date(driver.licenseExpiry) < new Date()) {
      throw new ConflictError(`Driver's license is expired`);
    }

    // Update trip status and set vehicle/driver to ON_TRIP
    const etaMinutes = Math.floor(Math.random() * 90) + 30;
    const [updatedTrip] = await Promise.all([
      prisma.trip.update({
        where: { id },
        data: { status: "DISPATCHED", etaMinutes },
      }),
      vehicle && prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "ON_TRIP" },
      }),
      driver && prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: "ON_TRIP" },
      }),
    ]);

    return updatedTrip;
  }

  static async complete(user: AuthUser, id: string, input: CompleteTripInput) {
    const trip = await this.getById(user, id);
    if (trip.status !== "DISPATCHED") {
      throw new ConflictError("Trip must be DISPATCHED to complete");
    }

    const { finalOdometerKm, fuelConsumedL } = input;

    // Calculate actual distance if vehicle has starting odometer
    const vehicle = trip.vehicleId
      ? await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } })
      : null;

    let actualDistanceKm: number | null = null;
    if (vehicle && finalOdometerKm > vehicle.odometerKm) {
      actualDistanceKm = finalOdometerKm - vehicle.odometerKm;
    }

    // Update trip, vehicle, driver, and auto-create fuel log + expense
    const [updatedTrip] = await Promise.all([
      prisma.trip.update({
        where: { id },
        data: {
          status: "COMPLETED",
          actualDistanceKm,
          finalOdometerKm,
          fuelConsumedL,
          etaMinutes: null,
        },
      }),
      vehicle && prisma.vehicle.update({
        where: { id: trip.vehicleId! },
        data: {
          status: "AVAILABLE",
          odometerKm: finalOdometerKm,
        },
      }),
      trip.driverId && prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      }),
      // Auto-create fuel log
      trip.vehicleId && prisma.fuelLog.create({
        data: {
          vehicleId: trip.vehicleId,
          date: new Date(),
          liters: fuelConsumedL,
          cost: fuelConsumedL * 95, // approximate ₹95/L
          organizationId: user.organizationId,
        },
      }),
      // Auto-create expense
      trip.vehicleId && prisma.expense.create({
        data: {
          tripId: trip.id,
          vehicleId: trip.vehicleId,
          toll: Math.floor(Math.random() * 200) + 50,
          other: Math.floor(Math.random() * 100) + 10,
          maintenanceLinked: 0,
          total: 0, // will update below
          organizationId: user.organizationId,
          createdBy: user.userId,
        },
      }),
    ]);

    return updatedTrip;
  }

  static async cancel(user: AuthUser, id: string) {
    const trip = await this.getById(user, id);
    if (trip.status === "COMPLETED" || trip.status === "CANCELLED") {
      throw new ConflictError(`Cannot cancel a ${trip.status} trip`);
    }

    // Free vehicle and driver if they were dispatched
    const updates: Promise<any>[] = [
      prisma.trip.update({
        where: { id },
        data: { status: "CANCELLED", etaMinutes: null },
      }),
    ];

    if (trip.status === "DISPATCHED") {
      if (trip.vehicleId) {
        updates.push(
          prisma.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: "AVAILABLE" },
          })
        );
      }
      if (trip.driverId) {
        updates.push(
          prisma.driver.update({
            where: { id: trip.driverId },
            data: { status: "AVAILABLE" },
          })
        );
      }
    }

    const [updatedTrip] = await Promise.all(updates);
    return updatedTrip;
  }
}
