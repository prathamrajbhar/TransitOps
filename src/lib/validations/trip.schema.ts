/**
 * src/lib/validations/trip.schema.ts
 * Zod schemas for trip lifecycle operations.
 */
import { z } from "zod";

const TRIP_STATUSES = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

// ─── Create ───────────────────────────────────────────────────────
export const CreateTripSchema = z.object({
  vehicleId: z.string().cuid("Invalid vehicle ID"),
  driverId: z.string().cuid("Invalid driver ID"),
  origin: z.string().min(2, "Origin is required").max(255).trim(),
  destination: z.string().min(2, "Destination is required").max(255).trim(),
  distanceKm: z.number().positive("Distance must be positive").optional(),
  startTime: z.coerce.date({ error: "Invalid start date/time" }),
  endTime: z.coerce.date().optional(),
});
export type CreateTripInput = z.infer<typeof CreateTripSchema>;

// ─── Update ───────────────────────────────────────────────────────
export const UpdateTripSchema = CreateTripSchema.partial();
export type UpdateTripInput = z.infer<typeof UpdateTripSchema>;

// ─── Dispatch ────────────────────────────────────────────────────
export const DispatchTripSchema = z.object({
  startTime: z.coerce.date().optional(),
});
export type DispatchTripInput = z.infer<typeof DispatchTripSchema>;

// ─── Complete ────────────────────────────────────────────────────
export const CompleteTripSchema = z.object({
  endTime: z.coerce.date().optional(),
  distanceKm: z.number().positive().optional(),
});
export type CompleteTripInput = z.infer<typeof CompleteTripSchema>;

// ─── Cancel ──────────────────────────────────────────────────────
export const CancelTripSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required").max(500).optional(),
});
export type CancelTripInput = z.infer<typeof CancelTripSchema>;
