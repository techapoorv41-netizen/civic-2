import AuditLogRepository from "../repositories/auditLog.repository";
import { IAuditLog } from "../entities/AuditLog.entity";
import UserRepository from "../../users/repositories/user.repository";
import OfficialProfile from "../../officials/entities/OfficialProfile.entity";
import RefreshToken from "../../auth/entities/RefreshToken.entity";
import User from "../../users/entities/User.entity";
import AppError from "../../../errors/AppError";
import { toFullUserDTO } from "../../users/mappers/users.mapper";
import { toAuditLogDTO } from "../mappers/admin.mapper";
import { parsePagination, buildPaginationMeta } from "../../../shared/utils/pagination";
import { ROLES } from "../../../shared/constants/roles";
import { AUDIT_ACTIONS } from "../../../shared/constants/auditActions";
import { registerAuditService, AuditPayload } from "../../../shared/contracts/audit";
import issueStatsService from "../../../shared/contracts/issueStats";
import { PaginatedAuditLogsDTO, PlatformStatsDTO } from "../dtos/admin.dto";
import { FullUserDTO } from "../../users/dtos/users.dto";
import { FilterQuery } from "mongoose";

export class AdminService {
  static async blockUser({
    adminId,
    targetUserId,
    reason,
  }: {
    adminId: string;
    targetUserId: string;
    reason: string;
  }): Promise<FullUserDTO> {
    if (adminId.toString() === targetUserId.toString()) {
      throw AppError.validation("You cannot block your own administrator account", [
        { path: "id", message: "Self-blocking is not permitted" },
      ]);
    }

    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (user.role === ROLES.ADMIN) {
      throw AppError.validation("Administrator accounts cannot be blocked", [
        { path: "id", message: "Target user is an administrator" },
      ]);
    }

    if (user.isBlocked) {
      throw AppError.conflict("User is already blocked");
    }

    user.isBlocked = true;
    user.blockedReason = reason.trim();
    user.blockedBy = adminId as any;
    user.blockedAt = new Date();
    await user.save();

    await RefreshToken.updateMany(
      { userId: user._id, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );

    await this.logAction({
      actorId: adminId,
      action: AUDIT_ACTIONS.USER_BLOCKED,
      targetType: "User",
      targetId: user._id.toString(),
      metadata: {
        reason: reason.trim(),
        userEmail: user.email,
        userRole: user.role,
      },
    });

    return toFullUserDTO(user);
  }

  static async unblockUser({
    adminId,
    targetUserId,
  }: {
    adminId: string;
    targetUserId: string;
  }): Promise<FullUserDTO> {
    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (!user.isBlocked) {
      throw AppError.conflict("User is not currently blocked");
    }

    user.isBlocked = false;
    user.blockedReason = null;
    user.blockedBy = null;
    user.blockedAt = null;
    await user.save();

    await this.logAction({
      actorId: adminId,
      action: AUDIT_ACTIONS.USER_UNBLOCKED,
      targetType: "User",
      targetId: user._id.toString(),
      metadata: {
        userEmail: user.email,
      },
    });

    return toFullUserDTO(user);
  }

  static async logAction(payload: AuditPayload): Promise<IAuditLog> {
    return await AuditLogRepository.create({
      actorId: payload.actorId as any,
      action: payload.action,
      targetType: payload.targetType,
      targetId: payload.targetId || "",
      metadata: payload.metadata || {},
    });
  }

  static async getAuditLogs(query: any = {}): Promise<PaginatedAuditLogsDTO> {
    const { page, limit, skip, sort } = parsePagination(query, [
      "createdAt",
      "action",
      "targetType",
      "actorId",
    ]);

    const filter: FilterQuery<IAuditLog> = {};

    if (query.action) filter.action = query.action;
    if (query.actorId) filter.actorId = query.actorId;
    if (query.targetType) filter.targetType = query.targetType;

    if (query.from || query.to) {
      filter.createdAt = {
        ...(query.from && { $gte: new Date(query.from) }),
        ...(query.to && { $lte: new Date(query.to) }),
      };
    }

    const { items, total } = await AuditLogRepository.list(filter, { skip, limit, sort });
    const logs = items.map((l: any) => toAuditLogDTO(l));
    const meta = buildPaginationMeta(total, page, limit);

    return {
      logs,
      meta,
    };
  }

  static async getStats(): Promise<PlatformStatsDTO> {
    const [userRoleAgg, blockedCount, pendingOfficialsCount, verifiedOfficialsCount, issueCounts] =
      await Promise.all([
        User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
        User.countDocuments({ isBlocked: true }),
        OfficialProfile.countDocuments({ isVerified: false }),
        OfficialProfile.countDocuments({ isVerified: true }),
        issueStatsService.getCounts(),
      ]);

    const usersByRole: Record<string, number> = {};
    userRoleAgg.forEach((curr: any) => {
      if (curr._id) usersByRole[curr._id] = curr.count;
    });

    const totalUsers = Object.values(usersByRole).reduce((a, b) => a + b, 0);

    return {
      users: {
        total: totalUsers,
        citizens: usersByRole[ROLES.CITIZEN] || 0,
        officials: usersByRole[ROLES.OFFICIAL] || 0,
        admins: usersByRole[ROLES.ADMIN] || 0,
        blocked: blockedCount,
      },
      officials: {
        pending: pendingOfficialsCount,
        verified: verifiedOfficialsCount,
      },
      issues: issueCounts,
    };
  }
}

// AuditContract registration
registerAuditService({
  async log(payload: AuditPayload): Promise<void> {
    await AdminService.logAction(payload);
  },
});

export default AdminService;
