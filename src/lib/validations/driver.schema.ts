/**
 * src/lib/validations/driver.schema.ts
 * Zod schemas for driver CRUD operations.
 */
import { z } from "zod";

const DRIVER_STATUSES = ["ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED"] as const;

// ─── Create ───────────────────────────────────────────────────────
export const CreateDriverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase().optional(),
  phone: z.string().max(20).trim().optional(),
  licenseNumber: z
    .string()
    .min(5, "License number must be at least 5 characters")
    .max(50)
    .trim(),
  status: z.enum(DRIVER_STATUSES).default("ACTIVE"),
  userId: z.string().cuid("Invalid user ID").optional(),
});
export type CreateDriverInput = z.infer<typeof CreateDriverSchema>;

// ─── Update ───────────────────────────────────────────────────────
export const UpdateDriverSchema = CreateDriverSchema.partial();
export type UpdateDriverInput = z.infer<typeof UpdateDriverSchema>;
