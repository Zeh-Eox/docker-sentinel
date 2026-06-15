import type { Incident } from "../types/incident.type.js";
import { explainIncident } from "./incident-explainer.old.js";

export const formatIncidentDescription = (incident: Incident): string => {
  const explanation = explainIncident(incident.message);

  let description = incident.message;

  if (!explanation) {
    return description;
  }

  return [
    incident.message,
    "",
    "🔍 Cause probable",
    explanation.probableCause,
    "",
    "⚠️ Impact",
    explanation.impact,
    "",
    "💡 Recommendation",
    explanation.recommendation,
  ].join("\n");
};
