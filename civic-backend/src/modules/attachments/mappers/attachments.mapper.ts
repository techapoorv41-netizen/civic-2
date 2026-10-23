import env from "../../../config/env";
import { AttachmentDTO } from "../dtos/attachments.dto";

export const toAttachmentDTO = (att: any): AttachmentDTO => {
  const raw = att && att.toObject ? att.toObject() : { ...att };
  const effectiveUrl = raw.url || raw.fileUrl;
  return {
    id: (raw._id || raw.id).toString(),
    issueId: (raw.issueId?._id || raw.issueId)?.toString(),
    uploadedBy: (raw.uploadedBy?._id || raw.uploadedBy)?.toString(),
    url: effectiveUrl,
    fileUrl: effectiveUrl,
    storageKey: raw.storageKey || raw.publicId || null,
    publicId: raw.publicId || raw.storageKey || null,
    provider: raw.provider || env.STORAGE_DRIVER,
    mimeType: raw.mimeType || "image/jpeg",
    fileType: raw.fileType || "image",
    size: raw.size || 0,
    originalName: raw.originalName || raw.fileName || null,
    fileName: raw.fileName || raw.originalName || null,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
  };
};

export default { toAttachmentDTO };
