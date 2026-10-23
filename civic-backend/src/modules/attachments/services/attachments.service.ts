import crypto from "crypto";
import { fromBuffer } from "file-type";
import env from "../../../config/env";
import storage from "../../../infrastructure/storage";
import AttachmentsRepository from "../repositories/attachments.repository";
import IssuesRepository from "../../issues/repositories/issues.repository";
import Issue from "../../issues/entities/Issue.entity";
import AppError from "../../../errors/AppError";
import { ROLES } from "../../../shared/constants/roles";
import { toAttachmentDTO } from "../mappers/attachments.mapper";
import { AttachmentDTO } from "../dtos/attachments.dto";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class AttachmentsService {
  static async uploadAttachment({
    issueId,
    user,
    file,
  }: {
    issueId: string;
    user: { id: string; role: string };
    file: Express.Multer.File;
  }): Promise<AttachmentDTO> {
    if (!file || !file.buffer) {
      throw AppError.validation("No file uploaded", [
        { path: "file", message: "File is required" },
      ]);
    }

    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    const reporterId = (issue.reportedBy || issue.reporterId)?.toString();
    const isAdmin = user.role === ROLES.ADMIN;
    const isReporter = reporterId === user.id.toString();

    if (!isAdmin && !isReporter) {
      throw AppError.forbidden("Not allowed to add attachments to this issue");
    }

    const detectedType = await fromBuffer(file.buffer);
    if (!detectedType || !ALLOWED_IMAGE_TYPES.includes(detectedType.mime)) {
      throw AppError.validation("File content is not a valid image", [
        { path: "file", message: "File content must be a valid JPEG, PNG, or WebP image" },
      ]);
    }

    const currentCount = await AttachmentsRepository.countByIssueId(issueId);
    if (currentCount >= 5) {
      throw AppError.conflict("Max 5 attachments per issue");
    }

    const uniqueId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
    const key = `issues/${issueId}/${uniqueId}.${detectedType.ext}`;

    const stored = await storage.upload({
      buffer: file.buffer,
      key,
      mimeType: detectedType.mime,
    });

    const safeOriginalName = String(file.originalname || "image")
      .replace(/[^\w.\- ]/g, "_")
      .slice(0, 100);

    const attachment = await AttachmentsRepository.create({
      issueId: issue._id,
      uploadedBy: user.id as any,
      url: stored.url,
      fileUrl: stored.url,
      storageKey: stored.key,
      publicId: stored.key,
      provider: env.STORAGE_DRIVER === "cloudinary" ? "cloudinary" : "local",
      mimeType: detectedType.mime,
      fileType: "image",
      size: file.size,
      originalName: safeOriginalName,
      fileName: safeOriginalName,
    });

    await Issue.findByIdAndUpdate(issueId, {
      $addToSet: { images: stored.url },
    });

    return toAttachmentDTO(attachment);
  }

  static async getAttachments({
    issueId,
    user: _user,
  }: {
    issueId: string;
    user?: { id: string; role: string };
  }): Promise<AttachmentDTO[]> {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    const attachments = await AttachmentsRepository.listByIssueId(issueId);
    return attachments.map((a: any) => toAttachmentDTO(a));
  }

  static async deleteAttachment({
    attachmentId,
    user,
  }: {
    attachmentId: string;
    user: { id: string; role: string };
  }): Promise<{ id: string; deleted: boolean }> {
    const attachment = await AttachmentsRepository.findById(attachmentId);
    if (!attachment) {
      throw AppError.notFound("Attachment not found");
    }

    const isOwner = attachment.uploadedBy.toString() === user.id.toString();
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden("Not allowed to delete this attachment");
    }

    const key = attachment.storageKey || attachment.publicId;
    if (key) {
      await storage.delete({ key });
    }

    await AttachmentsRepository.deleteById(attachmentId);

    const effectiveUrl = attachment.url || attachment.fileUrl;
    if (effectiveUrl) {
      await Issue.findByIdAndUpdate(attachment.issueId, {
        $pull: { images: effectiveUrl },
      });
    }

    return { id: attachmentId, deleted: true };
  }
}

export default AttachmentsService;
