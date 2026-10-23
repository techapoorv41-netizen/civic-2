import { PaginationMeta } from "../../../shared/utils/pagination";

export interface AssignIssueDTO {
  issueId: string;
  officialId: string;
  dueDate?: string;
  remarks?: string;
}

export interface RejectAssignmentDTO {
  reason: string;
}

export interface CompleteAssignmentDTO {
  completionRemarks: string;
}

export interface AssignmentDTO {
  id: string;
  assignmentId: string;
  issueId: string;
  title?: string | null;
  description?: string | null;
  category?: string;
  priority?: string;
  issueStatus?: string | null;
  issue?: any;
  officialId: string;
  official?: any;
  assignedBy?: string;
  status: string;
  isActive: boolean;
  dueDate: string | null;
  remarks: string | null;
  rejectionReason: string | null;
  completionRemarks: string | null;
  statusLog: any[];
  assignedAt: string | null;
  acceptedAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PaginatedAssignmentsDTO {
  assignments: AssignmentDTO[];
  meta: PaginationMeta;
}
