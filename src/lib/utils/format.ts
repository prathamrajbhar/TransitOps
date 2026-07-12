/**
 * src/lib/utils/format.ts
 * Formatting helpers for currency, distance, and percentages.
 */

/** Default currency (INR) formatter */
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Format a numeric amount as currency (default INR).
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "—";
  return currencyFormatter.format(amount);
}

/**
 * Format distance in km with one decimal place.
 */
export function formatDistance(km: number | null | undefined): string {
  if (km == null || isNaN(km)) return "—";
  return `${km.toFixed(1)} km`;
}

/**
 * Format a decimal as a percentage string.
 */
export function formatPercent(
  value: number | null | undefined,
  decimals = 1
): string {
  if (value == null || isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a large number with Indian-style grouping (e.g. 12,34,567).
 */
export function formatNumber(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return "—";
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Format fuel efficiency as km/L.
 */
export function formatFuelEfficiency(kmpl: number | null | undefined): string {
  if (kmpl == null || isNaN(kmpl)) return "—";
  return `${kmpl.toFixed(1)} km/L`;
}
