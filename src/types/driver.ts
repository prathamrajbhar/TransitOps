/**
 * src/types/driver.ts
 * Application-level types for drivers (DTOs for API responses).
 */

import type { DRIVER_STATUS } from "../lib/constants";

type DriverStatusValue = (typeof DRIVER_STATUS)[keyof typeof DRIVER_STATUS];

/** Core driver shape returned by the API */
export interface DriverDTO {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string;
  status: DriverStatusValue;
  organizationId: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Driver list item with trip count */
export interface DriverListItem extends DriverDTO {
  _count?: {
    trips: number;
  };
}

/** Driver detail with stats */
export interface DriverDetail extends DriverDTO {
  trips?: Array<{
    id: string;
    origin: string;
    destination: string;
    status: string;
    startTime: string;
  }>;
}

/** Driver performance stats */
export interface DriverStats {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalDistanceKm: number;
  completionRate: number;
}

/** Driver query filters */
export interface DriverFilters {
  status?: DriverStatusValue;
  search?: string;
  page?: number;
  limit?: number;
}
