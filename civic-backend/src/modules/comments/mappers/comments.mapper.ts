import { CommentDTO } from "../dtos/comments.dto";

export const toCommentDTO = (comment: any, author: any = null): CommentDTO => {
  const raw = comment && comment.toObject ? comment.toObject() : { ...comment };
  const authorData =
    author || (raw.authorId && typeof raw.authorId === "object" ? raw.authorId : null);

  return {
    id: (raw._id || raw.id).toString(),
    issueId: (raw.issueId?._id || raw.issueId)?.toString(),
    author: {
      id: (authorData?._id || authorData?.id || raw.authorId)?.toString() || "",
      name: authorData?.name || "User",
      role: authorData?.role || "citizen",
    },
    message: raw.message,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : null,
  };
};

export default { toCommentDTO };
