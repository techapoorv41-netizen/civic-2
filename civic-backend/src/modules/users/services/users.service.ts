import UserRepository from "../repositories/user.repository";
import AppError from "../../../errors/AppError";
import { toFullUserDTO, toRestrictedUserDTO } from "../mappers/users.mapper";
import { parsePagination, buildPaginationMeta } from "../../../shared/utils/pagination";
import { ROLES } from "../../../shared/constants/roles";
import { UpdateMeDTO, FullUserDTO, RestrictedUserDTO, PaginatedUsersDTO } from "../dtos/users.dto";
import { registerUserDirectory, BasicUser } from "../../../shared/contracts/userDirectory";
import mongoose, { FilterQuery } from "mongoose";
import User, { IUser } from "../entities/User.entity";

export class UsersService {
  static async getUserById({
    targetUserId,
    requestingUser,
  }: {
    targetUserId: string;
    requestingUser: { id: string; role: string };
  }): Promise<FullUserDTO | RestrictedUserDTO> {
    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    const isSelf = requestingUser.id === user._id.toString();
    const isAdmin = requestingUser.role === ROLES.ADMIN;

    if (isSelf || isAdmin) {
      return toFullUserDTO(user);
    }

    return toRestrictedUserDTO(user);
  }

  static async updateMe({ userId, data }: { userId: string; data: UpdateMeDTO }): Promise<FullUserDTO> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (data.name !== undefined) {
      user.name = data.name.trim();
    }
    if (data.phone !== undefined) {
      user.phone = data.phone ? data.phone.trim() : null;
    }

    await user.save();
    return toFullUserDTO(user);
  }

  static async getUsers(query: any = {}): Promise<PaginatedUsersDTO> {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter: FilterQuery<IUser> = {};

    if (query.role) {
      filter.role = query.role;
    }

    if (query.isBlocked !== undefined) {
      filter.isBlocked = query.isBlocked;
    }

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ];
    }

    const { items, total } = await UserRepository.list(filter, { skip, limit, sort });
    const users = items.map(toFullUserDTO);
    const meta = buildPaginationMeta(total, page, limit);

    return {
      users,
      meta,
    };
  }
}

// UserDirectory cross-module contract implementation
export const userDirectoryImpl = {
  async getBasicById(userId: string): Promise<BasicUser | null> {
    const user = await UserRepository.findById(userId);
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    };
  },

  async isAssignableOfficial(userId: string): Promise<boolean> {
    const user = await UserRepository.findById(userId);
    if (!user || user.isBlocked || user.role !== ROLES.OFFICIAL) {
      return false;
    }

    const OfficialModel = mongoose.models.OfficialProfile;
    if (!OfficialModel) return false;

    const profile = await OfficialModel.findOne({ userId: user._id }).lean() as any;
    return Boolean(profile && profile.isVerified);
  },

  async listAdminIds(): Promise<string[]> {
    const admins = await User.find({ role: ROLES.ADMIN, isBlocked: false }).select("_id").lean();
    return admins.map((a: any) => a._id.toString());
  },
};

registerUserDirectory(userDirectoryImpl);

export default UsersService;
