export * from "./Issue.entity";
import { Issue } from "./Issue.entity";
(Issue as any).default = Issue;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = Issue;
}
export default Issue;
