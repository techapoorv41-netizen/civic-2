export * from "../../issues/entities/IssueHistory.entity";
import { IssueStatusHistory } from "../../issues/entities/IssueHistory.entity";
(IssueStatusHistory as any).default = IssueStatusHistory;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = IssueStatusHistory;
}
export default IssueStatusHistory;
