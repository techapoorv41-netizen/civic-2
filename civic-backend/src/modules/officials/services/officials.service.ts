import OfficialsRepository from "../repositories/officials.repository";
import UserRepository from "../../users/repositories/user.repository";
import AppError from "../../../errors/AppError";
import { toOfficialDTO } from "../mappers/officials.mapper";
import { parsePagination, buildPaginationMeta } from "../../../shared/utils/pagination";
import { ROLES } from "../../../shared/constants/roles";
import { NOTIFICATION_TYPES } from "../../../shared/constants/notificationTypes";
import { AUDIT_ACTIONS } from "../../../shared/constants/auditActions";
import notificationService from "../../../shared/contracts/notification";
import auditService from "../../../shared/contracts/audit";
import { CreateOfficialProfileDTO, OfficialDTO, PaginatedOfficialsDTO } from "../dtos/officials.dto";
import User from "../../users/entities/User.entity";
import { FilterQuery } from "mongoose";
import { IOfficialProfile } from "../entities/OfficialProfile.entity";

export class OfficialsService {
  static async createProfile({
    userId,
    data,
  }: {
    userId: string;
    data: CreateOfficialProfileDTO;
  }): Promise<OfficialDTO> {
    const existing = await OfficialsRepository.findByUserId(userId);
    if (existing) {
      throw AppError.conflict("An official profile already exists for this user account");
    }

    if (data.employeeId) {
      const dupEmp = await OfficialsRepository.findByEmployeeId(data.employeeId);
      if (dupEmp) {
        throw AppError.conflict("An official profile with this employeeId already exists");
      }
    }

    const profile = await OfficialsRepository.create({
      userId: userId as any,
      department: data.department.trim(),
      designation: data.designation?.trim() || null,
      employeeId: data.employeeId?.trim() || null,
      area: data.area?.trim() || null,
      isVerified: false,
    });

    const user = await UserRepository.findById(userId);
    return toOfficialDTO(profile, user);
  }

  static async getOfficials(query: any = {}): Promise<PaginatedOfficialsDTO> {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter: FilterQuery<IOfficialProfile> = {};

    if (query.isVerified !== undefined) {
      filter.isVerified = query.isVerified;
    }

    if (query.department) {
      filter.department = query.department;
    }

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matchedUsers = await User.find({
        $or: [
          { name: { $regex: escaped, $options: "i" } },
          { email: { $regex: escaped, $options: "i" } },
        ],
      })
        .select("_id")
        .lean();

      const userIds = matchedUsers.map((u: any) => u._id);

      filter.$or = [
        { userId: { $in: userIds } },
        { employeeId: { $regex: escaped, $options: "i" } },
        { department: { $regex: escaped, $options: "i" } },
        { designation: { $regex: escaped, $options: "i" } },
        { area: { $regex: escaped, $options: "i" } },
      ];
    }

    const { items, total } = await OfficialsRepository.list(filter, { skip, limit, sort });
    const officials = items.map((p: any) => toOfficialDTO(p));
    const meta = buildPaginationMeta(total, page, limit);

    return {
      officials,
      meta,
    };
  }

  static async getOfficialById({
    profileId,
    requestingUser,
  }: {
    profileId: string;
    requestingUser: { id: string; role: string };
  }): Promise<OfficialDTO> {
    const profile = await OfficialsRepository.findById(profileId);
    if (!profile) {
      throw AppError.notFound("Official profile not found");
    }

    const ownerUserId = ((profile.userId as any)?._id || profile.userId)?.toString();
    const isOwner = ownerUserId === requestingUser.id;
    const isAdmin = requestingUser.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden("Access forbidden: you can only view your own official profile");
    }

    return toOfficialDTO(profile);
  }

  static async verifyOfficial({
    profileId,
    adminId,
  }: {
    profileId: string;
    adminId: string;
  }): Promise<OfficialDTO> {
    const profile = await OfficialsRepository.findById(profileId);
    if (!profile) {
      throw AppError.notFound("Official profile not found");
    }

    if (profile.isVerified) {
      throw AppError.conflict("Official profile is already verified");
    }

    profile.isVerified = true;
    profile.verifiedBy = adminId as any;
    profile.verifiedAt = new Date();
    await profile.save();

    const targetUserId = ((profile.userId as any)?._id || profile.userId)?.toString();

    await auditService.log({
      actorId: adminId,
      action: AUDIT_ACTIONS.OFFICIAL_VERIFIED,
      targetType: "OfficialProfile",
      targetId: profile._id.toString(),
      metadata: {
        department: profile.department,
        userId: targetUserId,
      },
    });

    await notificationService.notify({
      type: NOTIFICATION_TYPES.OFFICIAL_VERIFIED,
      recipientIds: [targetUserId],
      message: `Your official profile for department '${profile.department}' has been verified by the administrator.`,
    });

    const user = await UserRepository.findById(profile.userId);
    return toOfficialDTO(profile, user);
  }
}

export default OfficialsService;
