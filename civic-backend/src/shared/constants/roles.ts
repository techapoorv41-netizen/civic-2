export const ROLES = {
  CITIZEN: "citizen",
  OFFICIAL: "official",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export default ROLES;
