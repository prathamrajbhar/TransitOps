/**
 * src/lib/utils/csv.ts
 * CSV generation helper for analytics exports.
 * Produces RFC 4180-compliant CSV output.
 */

/**
 * Escape a CSV field — wraps in quotes if it contains special characters.
 */
function escapeField(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to a CSV string.
 * @param headers Column definitions (key → label mapping)
 * @param rows Array of data objects
 * @returns CSV string ready for streaming
 */
export function toCsv<T extends Record<string, unknown>>(
  headers: Record<keyof T, string>,
  rows: T[]
): string {
  const headerRow = Object.values(headers).map(escapeField).join(",");
  const dataRows = rows.map((row) =>
    Object.keys(headers).map((key) => escapeField(row[key])).join(",")
  );
  return [headerRow, ...dataRows].join("\r\n") + "\r\n";
}

/**
 * Convert an array of objects to a CSV string with only selected columns.
 * @param rows Array of data objects
 * @param columns Keys to include (in order)
 * @param labels Optional label overrides
 */
export function toCsvSelected<T extends Record<string, unknown>>(
  rows: T[],
  columns: (keyof T)[],
  labels?: Partial<Record<keyof T, string>>
): string {
  const headers = columns.reduce(
    (acc, col) => {
      const key = col as string;
      acc[key] = labels?.[col] ?? key;
      return acc;
    },
    {} as Record<string, string>
  );
  return toCsv(headers as Record<keyof T, string>, rows);
}

/**
 * Create a Response with CSV content-type for streaming.
 */
export function csvResponse(csv: string, filename = "export.csv"): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
