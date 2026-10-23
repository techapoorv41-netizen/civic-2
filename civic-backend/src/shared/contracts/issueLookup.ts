import mongoose from "mongoose";

export interface BasicIssue {
  id: string;
  title?: string;
  reporterId: string;
  assignedOfficialId: string | null;
  status: string;
}

export class IssueLookup {
  private static _mockHandler: ((issueId: string) => Promise<BasicIssue | null>) | null = null;

  static setMockHandler(handler: ((issueId: string) => Promise<BasicIssue | null>) | null): void {
    this._mockHandler = handler;
  }

  static async getBasic(issueId: string): Promise<BasicIssue | null> {
    if (!issueId) return null;

    if (this._mockHandler) {
      return this._mockHandler(issueId);
    }

    try {
      if (mongoose.models.Issue) {
        const issue: any = await mongoose.models.Issue.findById(issueId).lean();
        if (!issue) return null;

        return {
          id: issue._id.toString(),
          reporterId: (issue.reportedBy || issue.reporterId)?.toString(),
          assignedOfficialId: (issue.assignedTo || issue.assignedOfficialId)?.toString() || null,
          status: issue.status || "pending",
        };
      }
    } catch {
      return null;
    }

    return null;
  }
}

export const registerIssueLookup = (_impl: any): void => {
  // Compatibility stub
};

// CJS interop
(IssueLookup as any).default = IssueLookup;
(IssueLookup as any).registerIssueLookup = registerIssueLookup;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = IssueLookup;
}

export default IssueLookup;
