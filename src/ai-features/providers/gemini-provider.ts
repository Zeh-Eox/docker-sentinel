import type { IncidentAnalyzer } from "../analyzer.js";
import type { AnalysisResult } from "../../types/ai.type.js";
import type { Incident } from "../../types/incident.type.js";

const GEMINI_API_URL =
  process.env.GEMINI_API_URL ||
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

const parseGeminiJson = (text: string): AnalysisResult | null => {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return JSON.parse(cleaned.slice(start, end + 1)) as AnalysisResult;
};

export class GeminiAnalyzer implements IncidentAnalyzer {
  constructor(private apiKey: string) {}

  async analyze(incident: Incident): Promise<AnalysisResult | null> {
    const prompt = `
You are a DevOps and SRE expert. Analyze this Docker incident and respond ONLY in valid JSON, without Markdown or backticks.

Incident :
- Container : ${incident.containerName}
- Severity : ${incident.severity}
- Raw Message : ${incident.rawMessage}
- Number of Occurences : ${incident.count}
- First Occurence : ${incident.firstSeen.toISOString()}
- Last Occurence : ${incident.lastSeen.toISOString()}

Respond with this exact JSON:
{ 
  "summary": "short summary of the incident (1 sentence)",
  "probableCause": "detailed probable cause",
  "impact": "potential impact on the system",
  "recommendation": "concrete actions to take to resolve the problem"
}
`.trim();

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        }),
      });

      if (!response.ok) {
        console.error(
          "[Gemini] API Error:",
          response.status,
          await response.text(),
        );
        return null;
      }

      const data = await response.json();
      const text: string =
        data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      return parseGeminiJson(text);
    } catch (error) {
      console.error("[Gemini] Analysis Error:", error);
      return null;
    }
  }
}
