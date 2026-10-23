import mongoose from "mongoose";

export interface IssueStatsCounts {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

export type IssueStats = IssueStatsCounts;

export class IssueStatsService {
  private static _mockHandler: (() => Promise<IssueStatsCounts>) | null = null;

  static setMockHandler(handler: (() => Promise<IssueStatsCounts>) | null): void {
    this._mockHandler = handler;
  }

  static async getCounts(): Promise<IssueStatsCounts> {
    if (this._mockHandler) {
      return this._mockHandler();
    }

    try {
      if (mongoose.models.Issue) {
        const total = await mongoose.models.Issue.countDocuments();
        const statusAgg: any[] = await mongoose.models.Issue.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const byStatus = statusAgg.reduce((acc: any, curr: any) => {
          if (curr._id) acc[curr._id] = curr.count;
          return acc;
        }, {});

        const categoryAgg: any[] = await mongoose.models.Issue.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ]);
        const byCategory = categoryAgg.reduce((acc: any, curr: any) => {
          if (curr._id) acc[curr._id] = curr.count;
          return acc;
        }, {});

        return {
          total,
          byStatus: {
            pending: 0,
            verified: 0,
            in_progress: 0,
            resolved: 0,
            rejected: 0,
            ...byStatus,
          },
          byCategory,
        };
      }
    } catch {
      // Fallback
    }

    return {
      total: 0,
      byStatus: {
        pending: 0,
        verified: 0,
        in_progress: 0,
        resolved: 0,
        rejected: 0,
      },
      byCategory: {},
    };
  }
}

export const registerIssueStatsService = (_impl: any): void => {
  // Compatibility stub
};

export const issueStatsService = IssueStatsService;

// CJS interop
(IssueStatsService as any).default = IssueStatsService;
(IssueStatsService as any).issueStatsService = IssueStatsService;
(IssueStatsService as any).registerIssueStatsService = registerIssueStatsService;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = IssueStatsService;
}

export default IssueStatsService;
