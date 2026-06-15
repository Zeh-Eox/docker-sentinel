import type { Incident, NotificationType } from "../types/incident.type.js";
import type { AnalysisResult } from "../types/ai.type.js";
import type { Notifier } from "./notifier.interface.js";

export class ConsoleNotifier implements Notifier {
  async notify(
    incident: Incident,
    notificationType: NotificationType,
    analysis: AnalysisResult | null,
  ): Promise<void> {
    const title =
      notificationType === "new" ? "🚨 NEW INCIDENT" : "⚠️ ESCALATED INCIDENT";

    const lines = [
      "",
      title,
      "",
      `Container  : ${incident.containerName}`,
      `Severity   : ${incident.severity}`,
      `Occurrences: ${incident.count}`,
      "",
      `Message => ${incident.message}`,
    ];

    if (analysis) {
      lines.push(
        "",
        "🔍 Probable cause",
        analysis.probableCause,
        "",
        "⚠️  Impact",
        analysis.impact,
        "",
        "💡 Recommandation",
        analysis.recommendation,
      );
    }

    console.log(lines.join("\n"));
  }
}
