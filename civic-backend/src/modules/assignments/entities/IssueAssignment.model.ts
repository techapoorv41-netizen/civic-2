export * from "./Assignment.entity";
import { IssueAssignment } from "./Assignment.entity";
(IssueAssignment as any).default = IssueAssignment;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = IssueAssignment;
}
export default IssueAssignment;
