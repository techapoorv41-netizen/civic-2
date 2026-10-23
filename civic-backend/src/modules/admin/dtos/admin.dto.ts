import { PaginationMeta } from "../../../shared/utils/pagination";

export interface BlockUserDTO {
  reason: string;
}

export interface AuditLogDTO {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, any>;
  createdAt: string | null;
}

export interface PaginatedAuditLogsDTO {
  logs: AuditLogDTO[];
  meta: PaginationMeta;
}

export interface PlatformStatsDTO {
  users: {
    total: number;
    citizens: number;
    officials: number;
    admins: number;
    blocked: number;
  };
  officials: {
    pending: number;
    verified: number;
  };
  issues: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
  };
}
