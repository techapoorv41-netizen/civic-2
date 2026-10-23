import User from "../../modules/users/entities/User.entity";
import OfficialProfile from "../../modules/officials/entities/OfficialProfile.entity";
import { ROLES } from "../constants/roles";

export interface BasicUserSummary {
  id: string;
  name: string;
  email?: string;
  role: string;
  isBlocked: boolean;
}

export type BasicUser = BasicUserSummary;

export class UserDirectory {
  static async getBasicById(id: string): Promise<BasicUserSummary | null> {
    if (!id) return null;
    try {
      const user: any = await User.findById(id).select("_id name role isBlocked").lean();
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        isBlocked: !!user.isBlocked,
      };
    } catch {
      return null;
    }
  }

  static async isAssignableOfficial(userId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      let user: any = await User.findOne({ _id: userId, role: ROLES.OFFICIAL, isBlocked: false }).lean();
      if (!user) {
        const profile: any = await OfficialProfile.findOne({ _id: userId, isVerified: true }).lean();
        if (profile) {
          user = await User.findOne({ _id: profile.userId, role: ROLES.OFFICIAL, isBlocked: false }).lean();
        }
      }
      if (!user) return false;

      const profile: any = await OfficialProfile.findOne({ userId: user._id, isVerified: true }).lean();
      return !!profile;
    } catch {
      return false;
    }
  }

  static async listAdminIds(): Promise<string[]> {
    try {
      const admins: any[] = await User.find({ role: ROLES.ADMIN, isBlocked: false }).select("_id").lean();
      return admins.map((a) => a._id.toString());
    } catch {
      return [];
    }
  }
}

export const registerUserDirectory = (_impl: any): void => {
  // Compatibility stub
};

// CJS interop
(UserDirectory as any).default = UserDirectory;
(UserDirectory as any).registerUserDirectory = registerUserDirectory;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = UserDirectory;
}

export default UserDirectory;
