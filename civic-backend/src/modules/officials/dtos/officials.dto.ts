import { PaginationMeta } from "../../../shared/utils/pagination";

export interface CreateOfficialProfileDTO {
  department: string;
  designation?: string;
  employeeId?: string;
  area?: string;
}

export interface OfficialQueryDTO {
  isVerified?: boolean;
  department?: string;
  search?: string;
  page?: string;
  limit?: string;
  sort?: string;
}

export interface OfficialDTO {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  department: string;
  designation?: string | null;
  employeeId?: string | null;
  area?: string | null;
  isVerified: boolean;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
  };
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PaginatedOfficialsDTO {
  officials: OfficialDTO[];
  meta: PaginationMeta;
}
