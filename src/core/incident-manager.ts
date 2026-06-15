import type {
  Incident,
  NotificationType,
  RegisterIncidentResult,
} from "../types/incident.type.js";
import type { LogEvent } from "../types/log-event.type.js";
import { extractUsefulMessage, normalizeMessage } from "./parser.js";
import type { Severity } from "./rules-engine.js";

const incidents = new Map<string, Incident>();

export const registerIncident = (
  event: LogEvent,
  severity: Severity,
): RegisterIncidentResult => {
  const extractedMessage = extractUsefulMessage(event.message, event.source);
  const normalizedMessage = normalizeMessage(extractedMessage);

  const key: string = `${event.containerName}:${normalizedMessage}`;

  const existing: Incident | undefined = incidents.get(key);

  if (existing) {
    existing.count += 1;
    existing.lastSeen = new Date();

    let shouldNotify = false;
    let notificationType: NotificationType = null;

    if (existing.count >= existing.lastNotificationCount * 10) {
      shouldNotify = true;
      notificationType = "escalation";

      existing.lastNotificationCount = existing.count;
    }

    return {
      incident: existing,
      isNew: false,
      shouldNotify,
      notificationType,
    };
  }

  const incident: Incident = {
    key,
    containerName: event.containerName,
    severity,
    rawMessage: event.message,
    message: normalizedMessage,
    count: 1,
    firstSeen: new Date(),
    lastSeen: new Date(),
    lastNotificationCount: 1,
  };

  incidents.set(key, incident);

  return {
    incident,
    isNew: true,
    shouldNotify: true,
    notificationType: "new",
  };
};

export const clearIncidentsByContainer = (containerName: string) => {
  for (const key of incidents.keys()) {
    if (key.startsWith(`${containerName}:`)) {
      incidents.delete(key);
    }
  }
};
