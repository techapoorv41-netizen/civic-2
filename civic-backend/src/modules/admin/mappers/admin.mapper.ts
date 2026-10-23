import { AuditLogDTO } from "../dtos/admin.dto";

export const toAuditLogDTO = (log: any): AuditLogDTO => {
  const raw = log && log.toObject ? log.toObject() : { ...log };
  return {
    id: (raw._id || raw.id).toString(),
    actorId: (raw.actorId?._id || raw.actorId)?.toString(),
    action: raw.action,
    targetType: raw.targetType,
    targetId: raw.targetId,
    metadata: raw.metadata || {},
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
  };
};

export default { toAuditLogDTO };
