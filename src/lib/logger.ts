/**
 * src/lib/logger.ts
 * Structured logging utility.
 * Outputs JSON in production, pretty-printed in development.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify(entry);
  }
  const { level, message, timestamp, ...rest } = entry;
  const extras = Object.keys(rest).length
    ? " " + JSON.stringify(rest, null, 2)
    : "";
  return `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${extras}`;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const formatted = formatEntry(entry);

  if (level === "error") {
    console.error(formatted);
  } else if (level === "warn") {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) =>
    log("info", message, meta),

  warn: (message: string, meta?: Record<string, unknown>) =>
    log("warn", message, meta),

  error: (message: string, meta?: Record<string, unknown>) =>
    log("error", message, meta),

  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") {
      log("debug", message, meta);
    }
  },

  /**
   * Log an API request — call at the start of every route handler.
   */
  request: (
    method: string,
    path: string,
    meta?: { userId?: string; durationMs?: number; status?: number }
  ) =>
    log("info", `${method} ${path}`, {
      type: "request",
      ...meta,
    }),

  /**
   * Log an error with stack trace — call in catch blocks.
   */
  exception: (message: string, error: unknown, meta?: Record<string, unknown>) => {
    const stack = error instanceof Error ? error.stack : String(error);
    log("error", message, { stack, type: "exception", ...meta });
  },
};
