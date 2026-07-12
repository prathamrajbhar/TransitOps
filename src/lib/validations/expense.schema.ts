/**
 * src/lib/validations/expense.schema.ts
 * Zod schemas for expense operations — aligned with frontend MockDataContext types.
 */
import { z } from "zod";

// ─── Create ───────────────────────────────────────
export const CreateExpenseSchema = z.object({
  tripId: z.string().cuid("Invalid trip ID").nullable().optional(),
  vehicleId: z.string().cuid("Invalid vehicle ID").nullable().optional(),
  toll: z.number().nonnegative("Toll must be non-negative").default(0),
  other: z.number().nonnegative("Other must be non-negative").default(0),
  maintenanceLinked: z.number().nonnegative("Maintenance must be non-negative").default(0),
});
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

// ─── Update ───────────────────────────────────────
export const UpdateExpenseSchema = CreateExpenseSchema.partial();
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;
