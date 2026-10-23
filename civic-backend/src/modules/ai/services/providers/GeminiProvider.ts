import env from "../../../../config/env";
import { AiProvider, AnalyzeIssueInput, AnalyzeIssueOutput, ChatInput } from "./AiProvider";

export class GeminiProvider extends AiProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = env.AI_API_KEY || "";
    this.model = env.AI_MODEL || "gemini-1.5-flash";
  }

  private async callGemini(contents: any[]): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 sec timeout per specification

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with HTTP ${response.status}`);
      }

      const data: any = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return text;
    } finally {
      clearTimeout(timeout);
    }
  }

  async analyzeIssue({
    title,
    description,
    categories = [],
    candidates = [],
  }: AnalyzeIssueInput): Promise<AnalyzeIssueOutput> {
    const systemPrompt = `You are an expert civic municipal issue classifier and severity analyst.
Analyze the following civic issue report.
Eligible Categories: ${JSON.stringify(categories)}
Nearby Duplicate Candidates (within 200m in past 30 days): ${JSON.stringify(candidates)}

Respond ONLY with a valid JSON object matching this schema:
{
  "severityScore": number from 1 to 10,
  "predictedCategory": string matching one of the eligible categories, or null,
  "duplicateIssueIds": array of matching candidate IDs (must ONLY be from the candidates provided above, empty if no duplicates),
  "reasoning": concise explanation (max 500 characters)
}`;

    const userContent = `Issue Title: "${title}"\nIssue Description: "${description}"`;

    const rawText = await this.callGemini([
      { role: "user", parts: [{ text: `${systemPrompt}\n\n${userContent}` }] },
    ]);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Gemini did not return a valid JSON structure");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      severityScore: Number(parsed.severityScore) || 5,
      predictedCategory: parsed.predictedCategory || null,
      duplicateIssueIds: Array.isArray(parsed.duplicateIssueIds) ? parsed.duplicateIssueIds : [],
      reasoning: String(parsed.reasoning || "Automated analysis completed.").slice(0, 1000),
      _mock: false,
    };
  }

  async chat({ prompt, issueContext = {}, history = [] }: ChatInput): Promise<string> {
    const systemContext = `You are CivicSense Assistant, an AI municipal support agent.
Assist citizens and municipal officials with questions regarding this specific civic issue.
Context:
- Title: "${issueContext.title || "Civic Report"}"
- Current Status: "${(issueContext.status || "pending").toUpperCase()}"
- Category: "${issueContext.category || "General"}"
- Location: "${issueContext.locationAddress || "Designated Municipal Area"}"
- Description: "${issueContext.description || ""}"

Respond politely, professionally, and concisely in 2 to 3 sentences. Do not make false promises.`;

    const contents: any[] = [
      { role: "user", parts: [{ text: systemContext }] },
      { role: "model", parts: [{ text: "Understood. I am ready to assist with this civic issue." }] },
    ];

    for (const h of history.slice(-10)) {
      if (h.prompt) contents.push({ role: "user", parts: [{ text: h.prompt }] });
      if (h.response) contents.push({ role: "model", parts: [{ text: h.response }] });
    }

    contents.push({ role: "user", parts: [{ text: prompt }] });

    const reply = await this.callGemini(contents);
    return reply.trim() || "Thank you for contacting CivicSense support regarding this report.";
  }
}

export default GeminiProvider;
