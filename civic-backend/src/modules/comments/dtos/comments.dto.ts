import { PaginationMeta } from "../../../shared/utils/pagination";

export interface CreateCommentDTO {
  message: string;
}

export interface CommentAuthorDTO {
  id: string;
  name: string;
  role: string;
}

export interface CommentDTO {
  id: string;
  issueId: string;
  author: CommentAuthorDTO;
  message: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PaginatedCommentsDTO {
  comments: CommentDTO[];
  meta: PaginationMeta;
}
