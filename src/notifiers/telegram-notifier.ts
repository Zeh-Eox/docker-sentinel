import type { Notifier } from "./notifier.interface.js";
import type { Incident, NotificationType } from "../types/incident.type.js";
import type { AnalysisResult } from "../types/ai.type.js";

export class TelegramNotifier implements Notifier {
  private apiUrl: string;

  constructor(
    private botToken: string,
    private chatId: string,
  ) {
    this.apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  }

  async notify(
    incident: Incident,
    notificationType: NotificationType,
    analysis: AnalysisResult | null,
  ): Promise<void> {
    const title =
      notificationType === "new" ? "🚨 NEW INCIDENT" : "⚠️ ESCALATED INCIDENT";

    const lines = [
      `*${title}*`,
      "",
      `📦 *Container :* \`${incident.containerName}\``,
      `🔴 *Severity :* ${incident.severity.toUpperCase()}`,
      `🔁 *Occurrences :* ${incident.count}`,
      "",
      `*Message :*`,
      `\`\`\``,
      incident.rawMessage.slice(0, 300), // Telegram limits it to ~4096 characters
      `\`\`\``,
    ];

    if (analysis) {
      lines.push(
        "",
        `*🔍 Probable cause*`,
        analysis.probableCause,
        "",
        `*⚠️ Impact*`,
        analysis.impact,
        "",
        `*💡 Recommandation*`,
        analysis.recommendation,
      );
    }

    const text = lines.join("\n");

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: this.chatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`[Telegram] API Error: ${err}`);
    }
  }
}
