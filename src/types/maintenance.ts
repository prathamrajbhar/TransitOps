/**
 * src/types/maintenance.ts
 * Application-level types for maintenance records (DTOs for API responses).
 */

/** Core maintenance record shape returned by the API */
export interface MaintenanceDTO {
  id: string;
  vehicleId: string;
  serviceType: string;
  cost: number;
  serviceDate: string;
  status: "ACTIVE" | "COMPLETED";
  organizationId: string;
  createdAt: string;
}

/** Maintenance list item with vehicle info */
export interface MaintenanceListItem extends MaintenanceDTO {
  vehicle?: {
    id: string;
    registrationNo: string;
    nameModel: string;
  };
}

/** Maintenance query filters */
export interface MaintenanceFilters {
  status?: "ACTIVE" | "COMPLETED";
  vehicleId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
