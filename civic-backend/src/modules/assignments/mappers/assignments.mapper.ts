import { AssignmentDTO } from "../dtos/assignments.dto";

export const toAssignmentDTO = (assign: any): AssignmentDTO => {
  const raw = assign && assign.toObject ? assign.toObject() : { ...assign };
  const issueObj = raw.issueId && typeof raw.issueId === "object" ? raw.issueId : null;

  return {
    id: (raw._id || raw.id).toString(),
    assignmentId: (raw._id || raw.id).toString(),
    issueId: (issueObj?._id || raw.issueId)?.toString(),
    title: issueObj?.title || null,
    description: issueObj?.description || null,
    category: issueObj?.categoryName || issueObj?.category || "General",
    priority: issueObj?.priority || "medium",
    issueStatus: issueObj?.status || null,
    issue: issueObj || undefined,
    officialId: (raw.officialId?._id || raw.officialId)?.toString(),
    official: raw.officialId && typeof raw.officialId === "object" ? raw.officialId : undefined,
    assignedBy: raw.assignedBy?.toString(),
    status: raw.status,
    isActive: Boolean(raw.isActive),
    dueDate: raw.dueDate ? new Date(raw.dueDate).toISOString() : null,
    remarks: raw.remarks || null,
    rejectionReason: raw.rejectionReason || null,
    completionRemarks: raw.completionRemarks || null,
    statusLog: Array.isArray(raw.statusLog) ? raw.statusLog : [],
    assignedAt: raw.assignedAt ? new Date(raw.assignedAt).toISOString() : null,
    acceptedAt: raw.acceptedAt ? new Date(raw.acceptedAt).toISOString() : null,
    completedAt: raw.completedAt ? new Date(raw.completedAt).toISOString() : null,
    rejectedAt: raw.rejectedAt ? new Date(raw.rejectedAt).toISOString() : null,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : null,
  };
};

export default { toAssignmentDTO };
