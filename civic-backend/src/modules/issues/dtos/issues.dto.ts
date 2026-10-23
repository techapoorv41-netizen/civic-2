import { PaginationMeta } from "../../../shared/utils/pagination";

export interface CreateIssueDTO {
  title: string;
  description: string;
  category?: string;
  categoryId?: string;
  priority?: "low" | "medium" | "high" | "critical";
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

export interface UpdateIssueDTO {
  title?: string;
  description?: string;
  category?: string;
  categoryId?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
  remarks?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

export interface IssueDTO {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId: string | null;
  status: string;
  priority: string;
  location: {
    address: string | null;
    lat: number;
    lng: number;
  };
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  locationAddress: string | null;
  images: string[];
  isVerified: boolean;
  verifiedByAdmin: boolean;
  reportedBy:
    | {
        id: string;
        name: string;
        email: string;
      }
    | string
    | null;
  assignedTo:
    | {
        id: string;
        name: string;
        email: string;
      }
    | string
    | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PaginatedIssuesDTO {
  issues: IssueDTO[];
  meta: PaginationMeta;
}
