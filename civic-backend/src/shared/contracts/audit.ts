import AuditLog from "../../modules/admin/entities/AuditLog.entity";
import { logger } from "../utils/logger";

export interface AuditLogParams {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
}

export type AuditPayload = AuditLogParams;

export class AuditService {
  static async log({
    actorId,
    action,
    targetType,
    targetId,
    metadata = {},
  }: AuditLogParams): Promise<boolean> {
    try {
      const sanitizedMeta = this.sanitizeMetadata(metadata);

      await AuditLog.create({
        actorId,
        action,
        targetType,
        targetId: targetId ? targetId.toString() : "unknown",
        metadata: sanitizedMeta,
        createdAt: new Date(),
      });

      logger.info({ actorId, action, targetType, targetId }, "Audit event recorded");
      return true;
    } catch (error: any) {
      logger.error({ error: error.message, action, targetId }, "Audit log recording failed safely");
      return false;
    }
  }

  static sanitizeMetadata(meta: any): Record<string, any> {
    if (!meta || typeof meta !== "object") {
      return {};
    }

    const clean: Record<string, any> = {};
    const forbiddenKeys = ["password", "token", "secret", "apikey", "hash", "authorization"];

    for (const [key, value] of Object.entries(meta)) {
      const lowerKey = key.toLowerCase();
      if (forbiddenKeys.some((f) => lowerKey.includes(f))) {
        clean[key] = "[REDACTED]";
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        clean[key] = this.sanitizeMetadata(value);
      } else {
        clean[key] = value;
      }
    }

    return clean;
  }
}

export const registerAuditService = (_impl: any): void => {
  // Compatibility stub
};

export const auditService = AuditService;

// CJS interop
(AuditService as any).default = AuditService;
(AuditService as any).auditService = AuditService;
(AuditService as any).registerAuditService = registerAuditService;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = AuditService;
}

export default AuditService;
