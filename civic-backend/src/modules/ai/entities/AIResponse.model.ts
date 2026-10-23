export * from "./AIResponse.entity";
import { AIResponse } from "./AIResponse.entity";
(AIResponse as any).default = AIResponse;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = AIResponse;
}
export default AIResponse;
