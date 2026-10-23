export * from "./Attachment.entity";
import { IssueAttachment } from "./Attachment.entity";
(IssueAttachment as any).default = IssueAttachment;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = IssueAttachment;
}
export default IssueAttachment;
