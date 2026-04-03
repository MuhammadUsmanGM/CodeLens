// lib/logger.ts — Structured logging with module context

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && env in LEVEL_PRIORITY) return env as LogLevel;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function formatDev(entry: LogEntry): string {
  const levelColors: Record<LogLevel, string> = {
    debug: "\x1b[36m",  // cyan
    info: "\x1b[32m",   // green
    warn: "\x1b[33m",   // yellow
    error: "\x1b[31m",  // red
  };
  const reset = "\x1b[0m";
  const dim = "\x1b[2m";
  const color = levelColors[entry.level];
  const tag = `${color}[${entry.module}]${reset}`;
  const level = `${color}${entry.level.toUpperCase().padEnd(5)}${reset}`;
  const ctx = entry.context
    ? ` ${dim}${JSON.stringify(entry.context)}${reset}`
    : "";
  return `${level} ${tag} ${entry.message}${ctx}`;
}

function formatProd(entry: LogEntry): string {
  return JSON.stringify(entry);
}

const isProd = process.env.NODE_ENV === "production";
const format = isProd ? formatProd : formatDev;

export function createLogger(module: string): Logger {
  const minPriority = LEVEL_PRIORITY[getMinLevel()];

  function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (LEVEL_PRIORITY[level] < minPriority) return;

    const entry: LogEntry = {
      level,
      module,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    const formatted = format(entry);

    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  return {
    debug: (msg, ctx?) => log("debug", msg, ctx),
    info: (msg, ctx?) => log("info", msg, ctx),
    warn: (msg, ctx?) => log("warn", msg, ctx),
    error: (msg, ctx?) => log("error", msg, ctx),
  };
}
