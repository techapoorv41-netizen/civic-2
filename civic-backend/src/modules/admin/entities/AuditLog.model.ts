export * from "./AuditLog.entity";
import { AuditLog } from "./AuditLog.entity";
(AuditLog as any).default = AuditLog;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = AuditLog;
}
export default AuditLog;
