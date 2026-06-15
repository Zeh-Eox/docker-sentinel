import { registerIncident } from "../core/incident-manager.js";
import { createLogEvent } from "../core/parser.js";
import { detectSeverity } from "../core/rules-engine.js";
import type { Notifier } from "../notifiers/notifier.interface.js";
import type { IncidentAnalyzer } from "../ai-features/analyzer.js";
import type { AnalysisResult } from "../types/ai.type.js";

export const processLog = async (
  message: string,
  source: "stdout" | "stderr",
  containerId: string,
  containerName: string,
  notifiers: Notifier[],
  analyzer: IncidentAnalyzer,
) => {
  const event = createLogEvent(containerId, containerName, message, source);
  const severity = detectSeverity(event);

  if (severity === "info") return;

  const result = registerIncident(event, severity);

  if (!result.shouldNotify) return;

  const analysis: AnalysisResult | null = await analyzer.analyze(
    result.incident,
  );

  await Promise.allSettled(
    notifiers.map((n) =>
      n
        .notify(result.incident, result.notificationType, analysis)
        .catch((err) => console.error("Erreur notifier:", err)),
    ),
  );
};
