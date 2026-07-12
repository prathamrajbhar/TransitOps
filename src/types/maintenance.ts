/**
 * src/types/maintenance.ts
 * Application-level types for maintenance records (DTOs for API responses).
 */

import type {
  MAINTENANCE_TYPE,
  MAINTENANCE_STATUS,
} from "../lib/constants";

type MaintenanceTypeValue = (typeof MAINTENANCE_TYPE)[keyof typeof MAINTENANCE_TYPE];
type MaintenanceStatusValue = (typeof MAINTENANCE_STATUS)[keyof typeof MAINTENANCE_STATUS];

/** Core maintenance record shape returned by the API */
export interface MaintenanceDTO {
  id: string;
  vehicleId: string;
  type: MaintenanceTypeValue;
  description: string;
  scheduledAt: string;
  completedAt: string | null;
  costAmount: number | null;
  status: MaintenanceStatusValue;
  organizationId: string;
  createdAt: string;
}

/** Maintenance list item with vehicle info */
export interface MaintenanceListItem extends MaintenanceDTO {
  vehicle?: {
    id: string;
    plateNumber: string;
    make: string;
    model: string;
  };
}

/** Maintenance query filters */
export interface MaintenanceFilters {
  status?: MaintenanceStatusValue;
  type?: MaintenanceTypeValue;
  vehicleId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
