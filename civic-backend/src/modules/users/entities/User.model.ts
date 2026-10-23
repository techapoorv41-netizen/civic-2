export * from "./User.entity";
import { User } from "./User.entity";
(User as any).default = User;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = User;
}
export default User;
