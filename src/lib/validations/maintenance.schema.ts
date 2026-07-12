/**
 * src/lib/validations/maintenance.schema.ts
 * Zod schemas for maintenance records — aligned with frontend MockDataContext types.
 */
import { z } from "zod";

const MAINTENANCE_STATUSES = ["ACTIVE", "COMPLETED"] as const;

// ─── Create ───────────────────────────────────────
export const CreateMaintenanceSchema = z.object({
  vehicleId: z.string().cuid("Invalid vehicle ID"),
  serviceType: z.string().min(2, "Service type is required").max(255).trim(),
  cost: z.number().nonnegative("Cost must be non-negative"),
  serviceDate: z.coerce.date({ error: "Invalid service date" }),
  status: z.enum(MAINTENANCE_STATUSES).default("ACTIVE"),
});
export type CreateMaintenanceInput = z.infer<typeof CreateMaintenanceSchema>;

// ─── Update ───────────────────────────────────────
export const UpdateMaintenanceSchema = CreateMaintenanceSchema.partial();
export type UpdateMaintenanceInput = z.infer<typeof UpdateMaintenanceSchema>;

// ─── Close (mark completed) ───────────────────────
export const CloseMaintenanceSchema = z.object({});
export type CloseMaintenanceInput = z.infer<typeof CloseMaintenanceSchema>;
