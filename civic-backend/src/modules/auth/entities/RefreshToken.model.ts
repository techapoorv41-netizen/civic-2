export * from "./RefreshToken.entity";
import { RefreshToken } from "./RefreshToken.entity";
(RefreshToken as any).default = RefreshToken;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = RefreshToken;
}
export default RefreshToken;
