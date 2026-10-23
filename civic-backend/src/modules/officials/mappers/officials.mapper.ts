import { OfficialDTO } from "../dtos/officials.dto";

export const toOfficialDTO = (profile: any, user: any = null): OfficialDTO => {
  const raw = profile && profile.toObject ? profile.toObject() : { ...profile };
  const resolvedUser =
    user || (raw.userId && typeof raw.userId === "object" && raw.userId.name ? raw.userId : null);
  const userIdStr = (resolvedUser?._id || resolvedUser?.id || raw.userId?._id || raw.userId)?.toString();

  return {
    id: (raw._id || raw.id).toString(),
    userId: userIdStr,
    name: resolvedUser?.name || raw.name || "Official",
    email: resolvedUser?.email || raw.email || null,
    department: raw.department,
    designation: raw.designation || null,
    employeeId: raw.employeeId || null,
    area: raw.area || null,
    isVerified: Boolean(raw.isVerified),
    verifiedBy: raw.verifiedBy ? raw.verifiedBy.toString() : null,
    verifiedAt: raw.verifiedAt ? new Date(raw.verifiedAt).toISOString() : null,
    ...(resolvedUser
      ? {
          user: {
            id: userIdStr,
            name: resolvedUser.name,
            email: resolvedUser.email,
            phone: resolvedUser.phone || null,
            role: resolvedUser.role,
          },
        }
      : {}),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : null,
  };
};

export default { toOfficialDTO };
