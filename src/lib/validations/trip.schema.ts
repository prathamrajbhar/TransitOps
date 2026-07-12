/**
 * src/lib/validations/trip.schema.ts
 * Zod schemas for trip lifecycle — aligned with frontend MockDataContext types.
 */
import { z } from "zod";

// ─── Create ───────────────────────────────────────
export const CreateTripSchema = z.object({
  source: z.string().min(2, "Source is required").max(255).trim(),
  destination: z.string().min(2, "Destination is required").max(255).trim(),
  vehicleId: z.string().nullable().optional(),
  driverId: z.string().nullable().optional(),
  cargoWeightKg: z.number().nonnegative("Cargo weight must be non-negative"),
  plannedDistanceKm: z.number().positive("Planned distance must be positive"),
  etaMinutes: z.number().int().nonnegative().optional().nullable(),
});
export type CreateTripInput = z.infer<typeof CreateTripSchema>;

// ─── Update ───────────────────────────────────────
export const UpdateTripSchema = CreateTripSchema.partial();
export type UpdateTripInput = z.infer<typeof UpdateTripSchema>;

// ─── Dispatch ────────────────────────────────────
export const DispatchTripSchema = z.object({});
export type DispatchTripInput = z.infer<typeof DispatchTripSchema>;

// ─── Complete ────────────────────────────────────
export const CompleteTripSchema = z.object({
  finalOdometerKm: z.number().positive("Final odometer is required"),
  fuelConsumedL: z.number().positive("Fuel consumed is required"),
});
export type CompleteTripInput = z.infer<typeof CompleteTripSchema>;

// ─── Cancel ──────────────────────────────────────
export const CancelTripSchema = z.object({});
export type CancelTripInput = z.infer<typeof CancelTripSchema>;
