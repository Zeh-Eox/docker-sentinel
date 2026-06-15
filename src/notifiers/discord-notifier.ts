import axios from "axios";
import type { Notifier } from "./notifier.interface.js";
import type { Incident, NotificationType } from "../types/incident.type.js";
import type { AnalysisResult } from "../types/ai.type.js";

export class DiscordNotifier implements Notifier {
  constructor(private webhookUrl: string) {}

  async notify(
    incident: Incident,
    notificationType: NotificationType,
    analysis: AnalysisResult | null,
  ): Promise<void> {
    const title =
      notificationType === "new" ? "🚨 NEW INCIDENT" : "⚠️ ESCALATED INCIDENT";
    const color = incident.severity === "error" ? 0xff0000 : 0xffa500;

    const description = analysis
      ? [
          `**${analysis.summary}**`,
          "",
          "🔍 **Probable cause**",
          analysis.probableCause,
          "",
          "⚠️ **Impact**",
          analysis.impact,
          "",
          "💡 **Recommandation**",
          analysis.recommendation,
        ].join("\n")
      : incident.message;

    await axios.post(this.webhookUrl, {
      embeds: [
        {
          title,
          color,
          description,
          fields: [
            { name: "Container", value: incident.containerName, inline: true },
            {
              name: "Severity",
              value: incident.severity.toUpperCase(),
              inline: true,
            },
            {
              name: "Occurrences",
              value: String(incident.count),
              inline: true,
            },
          ],
          footer: { text: "Docker Sentinel • Incident Monitoring" },
          timestamp: incident.lastSeen.toISOString(),
        },
      ],
    });
  }
}
