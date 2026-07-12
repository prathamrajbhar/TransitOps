/**
 * src/lib/validations/fuelExpense.schema.ts
 * Zod schemas for fuel log create and update operations.
 */
import { z } from "zod";

// ─── Create ───────────────────────────────────────────────────────
export const CreateFuelLogSchema = z.object({
  vehicleId: z.string().cuid("Invalid vehicle ID"),
  driverId: z.string().cuid("Invalid driver ID").optional(),
  liters: z.number().positive("Liters must be positive"),
  costPerLiter: z.number().positive("Cost per liter must be positive"),
  totalCost: z.number().positive("Total cost must be positive"),
  odometerKm: z.number().nonnegative("Odometer must be non-negative").optional(),
  station: z.string().max(255).trim().optional(),
});
export type CreateFuelLogInput = z.infer<typeof CreateFuelLogSchema>;

// ─── Update ───────────────────────────────────────────────────────
export const UpdateFuelLogSchema = CreateFuelLogSchema.partial();
export type UpdateFuelLogInput = z.infer<typeof UpdateFuelLogSchema>;
