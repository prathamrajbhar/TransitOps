/**
 * src/types/vehicle.ts
 * Application-level types for vehicles (DTOs for API responses).
 *
 * These types define the shape of data the API returns.
 * They mirror the Prisma schema but decouple the API contract from the ORM.
 */

import type {
  VEHICLE_TYPE,
  VEHICLE_STATUS,
} from "../lib/constants";

// ─── Value types from constants ─────────────────────────────
type VehicleTypeValue = (typeof VEHICLE_TYPE)[keyof typeof VEHICLE_TYPE];
type VehicleStatusValue = (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

// ─── DTOs ───────────────────────────────────────────────────

/** Core vehicle shape returned by the API */
export interface VehicleDTO {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleTypeValue;
  status: VehicleStatusValue;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

/** Vehicle list item with related counts */
export interface VehicleListItem extends VehicleDTO {
  _count?: {
    trips: number;
    maintenanceRecords: number;
    fuelLogs: number;
  };
}

/** Vehicle detail with related records */
export interface VehicleDetail extends VehicleDTO {
  trips?: Array<{
    id: string;
    origin: string;
    destination: string;
    status: string;
    startTime: string;
  }>;
  maintenanceRecords?: Array<{
    id: string;
    type: string;
    status: string;
    scheduledAt: string;
  }>;
}

/** Vehicle stats computed at query time */
export interface VehicleStats {
  totalTrips: number;
  totalDistanceKm: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  fuelEfficiencyKmpl: number | null;
  utilizationRate: number;
}

/** Vehicle query filters */
export interface VehicleFilters {
  status?: VehicleStatusValue;
  type?: VehicleTypeValue;
  search?: string;
  page?: number;
  limit?: number;
}
