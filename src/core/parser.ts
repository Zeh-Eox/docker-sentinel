import type { LogEvent } from "../types/log-event.type.js";

export const createLogEvent = (
  containerId: string,
  containerName: string,
  message: string,
  source: "stdout" | "stderr",
): LogEvent => {
  return {
    containerId,
    containerName,
    message,
    source,
    timestamp: new Date(),
  };
};

export const normalizeMessage = (rawMessage: string): string => {
  return rawMessage
    .replace(/\b\d{4}-\d{2}-\d{2}T[\d:.Z]+\b/g, "<TIMESTAMP>")
    .replace(/\b\d+\.\d+\.\d+\.\d+\b/g, "<IP>")
    .replace(/\b\d+\b/g, "<NUMBER>"); 
};

export const extractUsefulMessage = (
  rawMessage: string,
  source: "stdout" | "stderr",
): string => {
  if (source === "stderr") return rawMessage;

  const errorIndex = rawMessage.search(/(error|warning|warn|fatal|exception)/i);
  return errorIndex === -1 ? rawMessage : rawMessage.slice(errorIndex);
};
