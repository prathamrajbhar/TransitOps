/**
 * src/lib/validations/fuelExpense.schema.ts
 * Zod schemas for fuel log operations — aligned with frontend MockDataContext types.
 */
import { z } from "zod";

// ─── Create ───────────────────────────────────────
export const CreateFuelLogSchema = z.object({
  vehicleId: z.string().cuid("Invalid vehicle ID"),
  date: z.coerce.date({ error: "Invalid date" }).optional(),
  liters: z.number().positive("Liters must be positive"),
  cost: z.number().positive("Cost must be positive"),
});
export type CreateFuelLogInput = z.infer<typeof CreateFuelLogSchema>;

// ─── Update ───────────────────────────────────────
export const UpdateFuelLogSchema = CreateFuelLogSchema.partial();
export type UpdateFuelLogInput = z.infer<typeof UpdateFuelLogSchema>;
