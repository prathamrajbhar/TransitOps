/**
 * src/lib/validations/driver.schema.ts
 * Zod schemas for driver CRUD — aligned with frontend MockDataContext types.
 */
import { z } from "zod";

const LICENSE_CATEGORIES = ["LMV", "HMV", "OTHER"] as const;
const DRIVER_STATUSES = ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"] as const;

// ─── Create ───────────────────────────────────────
export const CreateDriverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase(),
  licenseNo: z.string().min(5, "License number must be at least 5 characters").max(50).trim(),
  licenseCategory: z.enum(LICENSE_CATEGORIES).default("LMV"),
  licenseExpiry: z.coerce.date({ error: "Invalid license expiry date" }),
  contactNumber: z.string().min(7, "Contact number is required").max(20).trim(),
  safetyScore: z.number().int().min(0).max(100).default(100),
});
export type CreateDriverInput = z.infer<typeof CreateDriverSchema>;

// ─── Update ───────────────────────────────────────
export const UpdateDriverSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  licenseNo: z.string().min(5).max(50).trim().optional(),
  licenseCategory: z.enum(LICENSE_CATEGORIES).optional(),
  licenseExpiry: z.coerce.date().optional(),
  contactNumber: z.string().min(7).max(20).trim().optional(),
  safetyScore: z.number().int().min(0).max(100).optional(),
  status: z.enum(DRIVER_STATUSES).optional(),
});
export type UpdateDriverInput = z.infer<typeof UpdateDriverSchema>;
