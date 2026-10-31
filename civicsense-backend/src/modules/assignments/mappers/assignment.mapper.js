const idOf = (v) => (v && v._id ? String(v._id) : v ? String(v) : null);

const toAssignmentDto = (a) => {
  const issue = a.issueId && a.issueId.title ? a.issueId : null;
  return {
    id: String(a._id || a.id),
    issueId: idOf(a.issueId),
    issue: issue
      ? { id: idOf(issue), title: issue.title, status: issue.status, priority: issue.priority }
      : null,
    officialId: idOf(a.officialId),
    assignedBy: idOf(a.assignedBy),
    status: a.status,
    dueDate: a.dueDate || null,
    remarks: a.remarks || null,
    rejectionReason: a.rejectionReason || null,
    completionRemarks: a.completionRemarks || null,
    statusLog: a.statusLog || [],
    acceptedAt: a.acceptedAt || null,
    completedAt: a.completedAt || null,
    rejectedAt: a.rejectedAt || null,
    createdAt: a.createdAt,
  };
};

module.exports = { toAssignmentDto };