import type { AnalysisResult } from "../types/ai.type.js";
import type { Incident } from "../types/incident.type.js";

export interface IncidentAnalyzer {
  analyze(incident: Incident): Promise<AnalysisResult | null>;
}
