/**
 * src/lib/validations/vehicle.schema.ts
 * Zod schemas for vehicle CRUD operations.
 */
import { z } from "zod";

const VEHICLE_TYPES = ["BUS", "MINIBUS", "VAN", "TRUCK", "CAR", "OTHER"] as const;
const VEHICLE_STATUSES = ["ACTIVE", "INACTIVE", "IN_MAINTENANCE", "RETIRED"] as const;

// ─── Create ───────────────────────────────────────────────────────
export const CreateVehicleSchema = z.object({
  plateNumber: z
    .string()
    .min(1, "Plate number is required")
    .max(20)
    .trim()
    .toUpperCase(),
  make: z.string().min(1, "Make is required").max(100).trim(),
  model: z.string().min(1, "Model is required").max(100).trim(),
  year: z
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  type: z.enum(VEHICLE_TYPES).default("OTHER"),
  status: z.enum(VEHICLE_STATUSES).default("ACTIVE"),
});
export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;

// ─── Update ───────────────────────────────────────────────────────
export const UpdateVehicleSchema = CreateVehicleSchema.partial();
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>;
