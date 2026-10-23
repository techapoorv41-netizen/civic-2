export * from "./AIAnalysis.entity";
import { AIAnalysis } from "./AIAnalysis.entity";
(AIAnalysis as any).default = AIAnalysis;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = AIAnalysis;
}
export default AIAnalysis;
