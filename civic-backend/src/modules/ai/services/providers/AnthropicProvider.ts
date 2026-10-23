import env from "../../../../config/env";
import { AiProvider, AnalyzeIssueInput, AnalyzeIssueOutput, ChatInput } from "./AiProvider";

export class AnthropicProvider extends AiProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = env.AI_API_KEY || "";
    this.model = env.AI_MODEL || "claude-3-haiku-20240307";
  }

  private async callAnthropic(system: string, messages: any[]): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 700,
          system,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic HTTP error ${response.status}`);
      }

      const json: any = await response.json();
      return json.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("");
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
    const system = `You are a civic issue classifier. Output valid JSON only with keys: severityScore (1-10), predictedCategory, duplicateIssueIds, reasoning. Categories: ${JSON.stringify(categories)}. Candidates: ${JSON.stringify(candidates)}.`;
    const text = await this.callAnthropic(system, [
      { role: "user", content: `Title: ${title}\nDescription: ${description}` },
    ]);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Anthropic output not valid JSON");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      severityScore: Number(parsed.severityScore) || 5,
      predictedCategory: parsed.predictedCategory || null,
      duplicateIssueIds: Array.isArray(parsed.duplicateIssueIds) ? parsed.duplicateIssueIds : [],
      reasoning: String(parsed.reasoning || "").slice(0, 1000),
      _mock: false,
    };
  }

  async chat({ prompt, issueContext = {} }: ChatInput): Promise<string> {
    const system = `You are CivicSense Assistant. Answer queries politely about this civic issue: ${JSON.stringify(issueContext)}. Keep response under 3 sentences.`;
    return await this.callAnthropic(system, [{ role: "user", content: prompt }]);
  }
}

export default AnthropicProvider;
