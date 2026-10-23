import { AuthUserDTO } from "../dtos/auth.dto";

export const toAuthUserDTO = (user: any, officialProfile?: any): AuthUserDTO => {
  return {
    id: (user._id || user.id).toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    isBlocked: Boolean(user.isBlocked),
    isVerified: officialProfile ? Boolean(officialProfile.isVerified) : undefined,
    department: officialProfile?.department,
    designation: officialProfile?.designation,
    employeeId: officialProfile?.employeeId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt || null,
  };
};

export default { toAuthUserDTO };
