/**
 * src/lib/validations/vehicle.schema.ts
 * Zod schemas for vehicle CRUD — aligned with frontend MockDataContext types.
 */
import { z } from "zod";

const VEHICLE_TYPES = ["VAN", "TRUCK", "MINI", "BUS", "OTHER"] as const;
const VEHICLE_STATUSES = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"] as const;

// ─── Create ───────────────────────────────────────
export const CreateVehicleSchema = z.object({
  registrationNo: z.string().min(1, "Registration No. is required").max(20).trim().toUpperCase(),
  nameModel: z.string().min(1, "Name/Model is required").max(100).trim(),
  type: z.enum(VEHICLE_TYPES).default("VAN"),
  maxLoadCapacityKg: z.number().nonnegative("Capacity must be non-negative").default(0),
  odometerKm: z.number().nonnegative("Odometer must be non-negative").default(0),
  acquisitionCost: z.number().nonnegative("Cost must be non-negative").default(0),
  region: z.string().min(1, "Region is required").max(100).trim().default("West"),
});
export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;

// ─── Update ───────────────────────────────────────
export const UpdateVehicleSchema = z.object({
  registrationNo: z.string().max(20).trim().toUpperCase().optional(),
  nameModel: z.string().max(100).trim().optional(),
  type: z.enum(VEHICLE_TYPES).optional(),
  maxLoadCapacityKg: z.number().nonnegative().optional(),
  odometerKm: z.number().nonnegative().optional(),
  acquisitionCost: z.number().nonnegative().optional(),
  region: z.string().max(100).trim().optional(),
  status: z.enum(VEHICLE_STATUSES).optional(),
});
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>;
