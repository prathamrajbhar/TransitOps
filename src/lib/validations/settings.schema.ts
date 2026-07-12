/**
 * src/lib/validations/settings.schema.ts
 * Zod schemas for org settings upsert.
 */
import { z } from "zod";

// ─── Upsert single setting ────────────────────────────────────────
export const UpsertSettingSchema = z.object({
  key: z.string().min(1, "Key is required").max(100).trim(),
  value: z.unknown(), // JSON — any value
});
export type UpsertSettingInput = z.infer<typeof UpsertSettingSchema>;

// ─── Upsert multiple settings (bulk) ─────────────────────────────
export const UpsertSettingsBulkSchema = z.object({
  settings: z.array(UpsertSettingSchema).min(1, "At least one setting required"),
});
export type UpsertSettingsBulkInput = z.infer<typeof UpsertSettingsBulkSchema>;
