import { FullUserDTO, RestrictedUserDTO } from "../dtos/users.dto";

export const toFullUserDTO = (user: any): FullUserDTO => {
  return {
    id: (user._id || user.id).toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    isBlocked: Boolean(user.isBlocked),
    blockedReason: user.blockedReason || null,
    blockedAt: user.blockedAt || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt || null,
  };
};

export const toRestrictedUserDTO = (user: any): RestrictedUserDTO => {
  return {
    id: (user._id || user.id).toString(),
    name: user.name,
    role: user.role,
  };
};

export default { toFullUserDTO, toRestrictedUserDTO };
