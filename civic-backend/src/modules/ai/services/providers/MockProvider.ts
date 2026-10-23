import { AiProvider, AnalyzeIssueInput, AnalyzeIssueOutput, ChatInput } from "./AiProvider";

export class MockProvider extends AiProvider {
  async analyzeIssue({
    title,
    description,
    categories = [],
    candidates = [],
  }: AnalyzeIssueInput): Promise<AnalyzeIssueOutput> {
    const text = `${title} ${description}`.toLowerCase();
    let cat = categories[0] || "General";
    let score = 5;
    let reasoning = "Mock heuristic analysis based on reported keyword matching.";

    if (text.includes("pothole") || text.includes("road") || text.includes("crack")) {
      cat = categories.find((c) => /road|pothole/i.test(c)) || "Roads & Potholes";
      score = 8;
      reasoning = "Road surface degradation identified as potential traffic and vehicular hazard.";
    } else if (text.includes("light") || text.includes("electric") || text.includes("wire")) {
      cat = categories.find((c) => /light|electric/i.test(c)) || "Electrical & Lighting";
      score = 7;
      reasoning = "Lighting or electrical fixture failure reported; public safety impact evaluated.";
    } else if (text.includes("garbage") || text.includes("waste") || text.includes("trash")) {
      cat = categories.find((c) => /sanitation|garbage|waste/i.test(c)) || "Sanitation & Waste";
      score = 7.5;
      reasoning = "Waste accumulation detected; municipal clearance requested.";
    } else if (text.includes("water") || text.includes("drain") || text.includes("pipe")) {
      cat = categories.find((c) => /water|drain/i.test(c)) || "Water Supply & Drainage";
      score = 8.5;
      reasoning = "Water or drainage flow disruption requiring maintenance inspection.";
    }

    return {
      severityScore: score,
      predictedCategory: cat,
      duplicateIssueIds: candidates.length > 0 ? [candidates[0].id] : [],
      reasoning,
      _mock: true,
    };
  }

  async chat({ prompt = "", issueContext = {} }: ChatInput): Promise<string> {
    const q = prompt.toLowerCase();
    if (q.includes("timeline") || q.includes("when") || q.includes("time") || q.includes("faster")) {
      return `Based on municipal guidelines for ${issueContext.title || "this issue"} (Status: ${(issueContext.status || "pending").toUpperCase()}): Standard field inspection takes place within 24 to 48 business hours after administrative verification.`;
    }
    if (q.includes("official") || q.includes("who") || q.includes("assigned")) {
      return issueContext.assignedTo
        ? "This issue is assigned to the designated zonal official for investigation."
        : "This issue is in the verification queue and will be assigned to a field inspector shortly.";
    }
    if (q.includes("status") || q.includes("update")) {
      return `The current status of this ticket is '${(issueContext.status || "pending").toUpperCase()}'. You will receive real-time notifications on further progress.`;
    }
    return `Thank you for your inquiry regarding "${issueContext.title || "this civic report"}". Department inspectors track reports through the CivicSense resolution platform.`;
  }
}

export default MockProvider;
