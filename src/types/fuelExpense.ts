/**
 * src/types/fuelExpense.ts
 * Application-level types for fuel logs and expenses (DTOs for API responses).
 */

// ─── Fuel Log ──────────────────────────────────────────────

/** Core fuel log shape returned by the API */
export interface FuelLogDTO {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
  organizationId: string;
  createdAt: string;
}

/** Fuel log list item with relations */
export interface FuelLogListItem extends FuelLogDTO {
  vehicle?: {
    id: string;
    registrationNo: string;
    nameModel: string;
  };
}

/** Fuel log query filters */
export interface FuelLogFilters {
  vehicleId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// ─── Expense ───────────────────────────────────────────────

/** Core expense shape returned by the API */
export interface ExpenseDTO {
  id: string;
  toll: number;
  other: number;
  maintenanceLinked: number;
  total: number;
  vehicleId: string | null;
  tripId: string | null;
  organizationId: string;
  createdBy: string;
  createdAt: string;
}

/** Expense list item with relations */
export interface ExpenseListItem extends ExpenseDTO {
  vehicle?: {
    id: string;
    registrationNo: string;
    nameModel: string;
  };
  trip?: {
    id: string;
    tripCode: string;
    source: string;
    destination: string;
  };
}

/** Expense query filters */
export interface ExpenseFilters {
  vehicleId?: string;
  tripId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// ─── Operational Costs ────────────────────────────────────

/** Aggregated operational cost summary */
export interface OperationalCostSummary {
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalExpenses: number;
  costByVehicle: Array<{
    vehicleId: string;
    registrationNo: string;
    nameModel: string;
    totalCost: number;
  }>;
}
