import type { LogEvent } from "../types/log-event.type.js";
import { config } from "../config.js";

export type Severity = "info" | "warning" | "error";

export const detectSeverity = (event: LogEvent): Severity => {
  const message = event.message.toLowerCase();

  if (config.ignoredPatterns.some((p) => message.includes(p.toLowerCase()))) {
    return "info";
  }

  if (
    message.includes("error") ||
    message.includes("exception") ||
    message.includes("fatal")
  ) {
    return "error";
  }

  if (message.includes("warning") || message.includes("warn")) {
    return "warning";
  }

  return "info";
};
