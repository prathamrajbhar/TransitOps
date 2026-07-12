/**
 * src/types/trip.ts
 * Application-level types for trips (DTOs for API responses).
 */

import type { TRIP_STATUS } from "../lib/constants";

type TripStatusValue = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];

/** Core trip shape returned by the API */
export interface TripDTO {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  distanceKm: number | null;
  startTime: string;
  endTime: string | null;
  status: TripStatusValue;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

/** Trip list item with driver and vehicle info */
export interface TripListItem extends TripDTO {
  vehicle?: {
    id: string;
    plateNumber: string;
    make: string;
    model: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string | null;
  };
}

/** Trip detail with full relations */
export interface TripDetail extends TripListItem {
  expenses?: Array<{
    id: string;
    category: string;
    amount: number;
    description: string;
  }>;
}

/** Trip state machine actions */
export type TripAction = "dispatch" | "complete" | "cancel";

/** Trip query filters */
export interface TripFilters {
  status?: TripStatusValue;
  vehicleId?: string;
  driverId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
