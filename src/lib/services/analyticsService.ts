import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/rbac";
import type { AuthUser } from "@/types/rbac";

export class AnalyticsService {
  static async getDashboard(user: AuthUser) {
    const where = orgScope(user);

    const [vehiclesCount, activeTripsCount, driversCount, pendingMaintenance] = await Promise.all([
      prisma.vehicle.count({ where: { ...where, status: "AVAILABLE" } }),
      prisma.trip.count({ where: { ...where, status: "DISPATCHED" } }),
      prisma.driver.count({ where: { ...where, status: "AVAILABLE" } }),
      prisma.maintenanceRecord.count({ where: { ...where, status: "ACTIVE" } }),
    ]);

    return {
      vehiclesCount,
      activeTripsCount,
      driversCount,
      pendingMaintenance,
    };
  }

  static async getFuelAnalytics(user: AuthUser) {
    const where = orgScope(user);
    const logs = await prisma.fuelLog.findMany({
      where,
      include: { vehicle: true },
    });

    const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = logs.reduce((sum, log) => sum + Number(log.cost), 0);
    const avgLitersPerLog = logs.length > 0 ? totalLiters / logs.length : 0;

    return {
      totalLiters,
      totalCost,
      averageLitersPerLog: avgLitersPerLog,
      logs,
    };
  }

  static async getMaintenanceAnalytics(user: AuthUser) {
    const where = orgScope(user);
    const records = await prisma.maintenanceRecord.findMany({
      where,
      include: { vehicle: true },
    });

    const totalCost = records.reduce((sum, r) => sum + Number(r.cost), 0);
    const byStatus = {
      ACTIVE: records.filter(r => r.status === "ACTIVE").length,
      COMPLETED: records.filter(r => r.status === "COMPLETED").length,
    };

    return {
      totalCost,
      count: records.length,
      byStatus,
      records,
    };
  }

  static async getUtilizationAnalytics(user: AuthUser) {
    const where = orgScope(user);
    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        trips: {
          where: { status: "COMPLETED" },
        },
      },
    });

    return {
      totalVehicles: vehicles.length,
      vehicles: vehicles.map(v => ({
        id: v.id,
        registrationNo: v.registrationNo,
        nameModel: v.nameModel,
        tripsCompleted: v.trips.length,
      })),
    };
  }

  static async getTripsAnalytics(user: AuthUser) {
    const where = orgScope(user);
    const trips = await prisma.trip.findMany({
      where,
    });

    const completed = trips.filter(t => t.status === "COMPLETED");
    const avgDistance = completed.length > 0
      ? completed.reduce((sum, t) => sum + (t.plannedDistanceKm || 0), 0) / completed.length
      : 0;

    return {
      totalTrips: trips.length,
      completedTrips: completed.length,
      activeTrips: trips.filter(t => t.status === "DISPATCHED").length,
      cancelledTrips: trips.filter(t => t.status === "CANCELLED").length,
      completionRate: trips.length > 0 ? (completed.length / trips.length) * 100 : 0,
      averageDistance: avgDistance,
    };
  }

  static async getDriverAnalytics(user: AuthUser) {
    const where = orgScope(user);
    const drivers = await prisma.driver.findMany({
      where,
    });

    // Driver no longer has a direct trips relation; count via trip driverId
    const completedTrips = await prisma.trip.groupBy({
      by: ["driverId"],
      where: { ...where, status: "COMPLETED", driverId: { not: null } },
      _count: { id: true },
    });
    const tripCountMap = new Map(completedTrips.map(t => [t.driverId, t._count.id]));

    return {
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.status === "AVAILABLE").length,
      drivers: drivers.map(d => ({
        id: d.id,
        name: d.name,
        status: d.status,
        tripsCompleted: tripCountMap.get(d.id) ?? 0,
      })),
    };
  }
}
