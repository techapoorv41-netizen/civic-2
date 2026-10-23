export const ISSUE_STATUSES = [
  "pending",
  "verified",
  "in_progress",
  "resolved",
  "rejected",
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export default { ISSUE_STATUSES, PRIORITIES };
