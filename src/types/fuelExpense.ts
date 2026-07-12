/**
 * src/types/fuelExpense.ts
 * Application-level types for fuel logs and expenses (DTOs for API responses).
 */

import type { EXPENSE_CATEGORY } from "../lib/constants";

type ExpenseCategoryValue = (typeof EXPENSE_CATEGORY)[keyof typeof EXPENSE_CATEGORY];

// ─── Fuel Log ──────────────────────────────────────────────

/** Core fuel log shape returned by the API */
export interface FuelLogDTO {
  id: string;
  vehicleId: string;
  driverId: string | null;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometerKm: number | null;
  station: string | null;
  organizationId: string;
  createdAt: string;
}

/** Fuel log list item with relations */
export interface FuelLogListItem extends FuelLogDTO {
  vehicle?: {
    id: string;
    plateNumber: string;
  };
  driver?: {
    id: string;
    name: string;
  };
}

/** Fuel log query filters */
export interface FuelLogFilters {
  vehicleId?: string;
  driverId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// ─── Expense ───────────────────────────────────────────────

/** Core expense shape returned by the API */
export interface ExpenseDTO {
  id: string;
  category: ExpenseCategoryValue;
  amount: number;
  description: string;
  date: string;
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
    plateNumber: string;
  };
  trip?: {
    id: string;
    origin: string;
    destination: string;
  };
}

/** Expense query filters */
export interface ExpenseFilters {
  category?: ExpenseCategoryValue;
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
    plateNumber: string;
    totalCost: number;
  }>;
  costByCategory: Array<{
    category: string;
    total: number;
  }>;
}
