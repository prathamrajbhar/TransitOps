/**
 * src/lib/utils/date.ts
 * Date formatting and manipulation helpers.
 */

/**
 * Format a Date or ISO string to a human-readable date (e.g. "12 Jul 2026").
 */
export function formatDate(
  input: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!input) return "—";
  const date = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

/**
 * Format a Date or ISO string to a human-readable date + time.
 */
export function formatDateTime(input: Date | string | number | null | undefined): string {
  return formatDate(input, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a Date or ISO string as ISO without time (YYYY-MM-DD).
 */
export function toDateOnly(input: Date | string | number): string {
  const date = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
  return date.toISOString().split("T")[0];
}

/**
 * Get the start of the current day in ISO format.
 */
export function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Get the end of the current day in ISO format.
 */
export function todayEnd(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

/**
 * Return a Date N days ago (for default date-range queries).
 */
export function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculate duration in minutes between two ISO/Date values.
 */
export function durationMinutes(
  start: Date | string,
  end: Date | string
): number {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  return Math.round((e.getTime() - s.getTime()) / 60000);
}
