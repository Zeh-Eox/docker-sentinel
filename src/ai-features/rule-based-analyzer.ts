import { explainIncident } from "../core/incident-explainer.js";
import type { AnalysisResult } from "../types/ai.type.js";
import type { Incident } from "../types/incident.type.js";
import type { IncidentAnalyzer } from "./analyzer.js";

export class RuleBasedAnalyzer implements IncidentAnalyzer {
  async analyze(incident: Incident): Promise<AnalysisResult | null> {
    const explanation = explainIncident(incident.message);

    if (!explanation) {
      return null;
    }

    return {
      summary: `[${explanation.category}] ${incident.message.slice(0, 100)}`,
      probableCause: explanation.probableCause,
      impact: explanation.impact,
      recommendation: explanation.recommendation,
    };
  }
}
