/**
 * src/lib/validations/maintenance.schema.ts
 * Zod schemas for maintenance record operations.
 */
import { z } from "zod";

const MAINTENANCE_TYPES = [
  "PREVENTIVE", "CORRECTIVE", "INSPECTION", "TIRE", "OIL_CHANGE", "OTHER",
] as const;

const MAINTENANCE_STATUSES = [
  "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED",
] as const;

// ─── Create ───────────────────────────────────────────────────────
export const CreateMaintenanceSchema = z.object({
  vehicleId: z.string().cuid("Invalid vehicle ID"),
  type: z.enum(MAINTENANCE_TYPES).default("OTHER"),
  description: z.string().min(5, "Description must be at least 5 characters").max(1000).trim(),
  scheduledAt: z.coerce.date({ error: "Invalid scheduled date" }),
  costAmount: z.number().nonnegative("Cost must be non-negative").optional(),
  status: z.enum(MAINTENANCE_STATUSES).default("SCHEDULED"),
});
export type CreateMaintenanceInput = z.infer<typeof CreateMaintenanceSchema>;

// ─── Update ───────────────────────────────────────────────────────
export const UpdateMaintenanceSchema = CreateMaintenanceSchema.partial();
export type UpdateMaintenanceInput = z.infer<typeof UpdateMaintenanceSchema>;

// ─── Close (mark completed) ───────────────────────────────────────
export const CloseMaintenanceSchema = z.object({
  completedAt: z.coerce.date().optional(),
  costAmount: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});
export type CloseMaintenanceInput = z.infer<typeof CloseMaintenanceSchema>;
