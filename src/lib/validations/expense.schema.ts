/**
 * src/lib/validations/expense.schema.ts
 * Zod schemas for expense CRUD operations.
 */
import { z } from "zod";

const EXPENSE_CATEGORIES = [
  "FUEL", "MAINTENANCE", "INSURANCE", "TOLL", "PARKING", "SALARY", "OFFICE", "OTHER",
] as const;

// ─── Create ───────────────────────────────────────────────────────
export const CreateExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES).default("OTHER"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(3, "Description must be at least 3 characters").max(500).trim(),
  date: z.coerce.date().optional(),
  vehicleId: z.string().cuid("Invalid vehicle ID").optional(),
  tripId: z.string().cuid("Invalid trip ID").optional(),
});
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

// ─── Update ───────────────────────────────────────────────────────
export const UpdateExpenseSchema = CreateExpenseSchema.partial();
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;
