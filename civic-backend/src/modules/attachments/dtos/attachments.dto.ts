export interface AttachmentDTO {
  id: string;
  issueId: string;
  uploadedBy: string;
  url: string;
  fileUrl: string;
  storageKey: string | null;
  publicId: string | null;
  provider: string;
  mimeType: string;
  fileType: string;
  size: number;
  originalName: string | null;
  fileName: string | null;
  createdAt: string | null;
}
