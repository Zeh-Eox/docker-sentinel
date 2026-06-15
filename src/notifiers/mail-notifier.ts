import nodemailer from "nodemailer";
import type { Notifier } from "./notifier.interface.js";
import type { Incident, NotificationType } from "../types/incident.type.js";
import type { AnalysisResult } from "../types/ai.type.js";

export interface MailNotifierConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
}

export class MailNotifier implements Notifier {
  private transporter: nodemailer.Transporter;

  constructor(private config: MailNotifierConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
    });
  }

  async notify(
    incident: Incident,
    notificationType: NotificationType,
    analysis: AnalysisResult | null,
  ): Promise<void> {
    const title =
      notificationType === "new" ? "🚨 NEW INCIDENT" : "⚠️ ESCALATED INCIDENT";

    const subject = `[Docker Sentinel] ${title} — ${incident.containerName}`;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; max-width: 640px; margin: auto; padding: 24px; color: #1a1a1a;">

  <h2 style="color: ${incident.severity === "error" ? "#dc2626" : "#d97706"};">${title}</h2>

  <table style="width:100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 8px; background:#f3f4f6; font-weight:bold;">Container</td>
      <td style="padding: 8px;">${incident.containerName}</td>
    </tr>
    <tr>
      <td style="padding: 8px; background:#f3f4f6; font-weight:bold;">Severity</td>
      <td style="padding: 8px;">${incident.severity.toUpperCase()}</td>
    </tr>
    <tr>
      <td style="padding: 8px; background:#f3f4f6; font-weight:bold;">Occurrences</td>
      <td style="padding: 8px;">${incident.count}</td>
    </tr>
    <tr>
      <td style="padding: 8px; background:#f3f4f6; font-weight:bold;">Fisrt occurrence</td>
      <td style="padding: 8px;">${incident.firstSeen.toLocaleString("fr-FR")}</td>
    </tr>
    <tr>
      <td style="padding: 8px; background:#f3f4f6; font-weight:bold;">Last occurrence</td>
      <td style="padding: 8px;">${incident.lastSeen.toLocaleString("fr-FR")}</td>
    </tr>
  </table>

  <div style="background:#fef9c3; border-left: 4px solid #ca8a04; padding: 12px; margin-bottom: 24px;">
    <strong>Raw Message :</strong><br/>
    <code style="font-size:13px;">${incident.rawMessage}</code>
  </div>

  ${
    analysis
      ? `
  <h3>🔍 IA Analysis</h3>
  <p><strong>Summary :</strong> ${analysis.summary}</p>

  <h4>Probable cause</h4>
  <p>${analysis.probableCause}</p>

  <h4>Impact</h4>
  <p>${analysis.impact}</p>

  <h4>💡 Recommandation</h4>
  <p style="background:#f0fdf4; border-left:4px solid #16a34a; padding:12px;">
    ${analysis.recommendation}
  </p>
  `
      : `<p><em>No AI analysis is available for this incident.</em></p>`
  }

  <hr style="margin-top:32px; border:none; border-top:1px solid #e5e7eb;">
  <p style="font-size:12px; color:#6b7280;">Docker Sentinel • Incident Monitoring</p>

</body>
</html>
    `.trim();

    await this.transporter.sendMail({
      from: this.config.from,
      to: this.config.to,
      subject,
      html,
    });
  }
}
