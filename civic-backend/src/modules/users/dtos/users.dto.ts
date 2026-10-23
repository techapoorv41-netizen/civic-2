import { PaginationMeta } from "../../../shared/utils/pagination";

export interface UpdateMeDTO {
  name?: string;
  phone?: string;
}

export interface UserQueryDTO {
  role?: string;
  isBlocked?: boolean;
  search?: string;
  page?: string;
  limit?: string;
  sort?: string;
}

export interface FullUserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isBlocked: boolean;
  blockedReason?: string | null;
  blockedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

export interface RestrictedUserDTO {
  id: string;
  name: string;
  role: string;
}

export interface PaginatedUsersDTO {
  users: FullUserDTO[];
  meta: PaginationMeta;
}
