export * from "./OfficialProfile.entity";
import { OfficialProfile } from "./OfficialProfile.entity";
(OfficialProfile as any).default = OfficialProfile;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = OfficialProfile;
}
export default OfficialProfile;
