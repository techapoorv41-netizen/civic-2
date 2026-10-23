export * from "./Notification.entity";
import { Notification } from "./Notification.entity";
(Notification as any).default = Notification;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = Notification;
}
export default Notification;
