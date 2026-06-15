import type { AnalysisResult } from "../types/ai.type.js";
import type { Incident } from "../types/incident.type.js";
import type { NotificationType } from "../types/incident.type.js";

export interface Notifier {
  notify(
    incident: Incident,
    notificationType: NotificationType,
    analysis: AnalysisResult | null,
  ): Promise<void>;
}
