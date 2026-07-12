import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/rbac";
import type { AuthUser } from "@/types/rbac";

export class AnalyticsService {
  static async getDashboard(user: AuthUser) {
    const where = orgScope(user);

    const [vehiclesCount, activeTripsCount, driversCount, pendingMaintenance] = await Promise.all([
      prisma.vehicle.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.trip.count({ where: { ...where, status: "IN_PROGRESS" } }),
      prisma.driver.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.maintenanceRecord.count({ where: { ...where, status: "SCHEDULED" } }),
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
    const totalCost = logs.reduce((sum, log) => sum + log.totalCost, 0);
    const avgMpg = totalLiters > 0 ? logs.length / totalLiters : 0;

    return {
      totalLiters,
      totalCost,
      averageMPG: avgMpg,
      logs,
    };
  }

  static async getMaintenanceAnalytics(user: AuthUser) {
    const where = orgScope(user);
    const records = await prisma.maintenanceRecord.findMany({
      where,
      include: { vehicle: true },
    });

    const totalCost = records.reduce((sum, r) => sum + (r.costAmount || 0), 0);
    const byStatus = {
      SCHEDULED: records.filter(r => r.status === "SCHEDULED").length,
      IN_PROGRESS: records.filter(r => r.status === "IN_PROGRESS").length,
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
        plateNumber: v.plateNumber,
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
      ? completed.reduce((sum, t) => sum + (t.distanceKm || 0), 0) / completed.length
      : 0;

    return {
      totalTrips: trips.length,
      completedTrips: completed.length,
      activeTrips: trips.filter(t => t.status === "IN_PROGRESS").length,
      cancelledTrips: trips.filter(t => t.status === "CANCELLED").length,
      completionRate: trips.length > 0 ? (completed.length / trips.length) * 100 : 0,
      averageDistance: avgDistance,
    };
  }

  static async getDriverAnalytics(user: AuthUser) {
    const where = orgScope(user);
    const drivers = await prisma.driver.findMany({
      where,
      include: {
        trips: {
          where: { status: "COMPLETED" },
        },
      },
    });

    return {
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.status === "ACTIVE").length,
      drivers: drivers.map(d => ({
        id: d.id,
        name: d.name,
        status: d.status,
        tripsCompleted: d.trips.length,
      })),
    };
  }
}
