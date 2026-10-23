import { IssueDTO } from "../dtos/issues.dto";

export const toIssueDTO = (issue: any): IssueDTO => {
  const raw = issue && issue.toObject ? issue.toObject() : { ...issue };

  const reporter = raw.reportedBy && typeof raw.reportedBy === "object" ? raw.reportedBy : null;
  const assigned = raw.assignedTo && typeof raw.assignedTo === "object" ? raw.assignedTo : null;
  const category = raw.category && typeof raw.category === "object" ? raw.category : null;

  const lat = raw.latitude !== null && raw.latitude !== undefined ? raw.latitude : raw.location?.lat;
  const lng = raw.longitude !== null && raw.longitude !== undefined ? raw.longitude : raw.location?.lng;

  return {
    id: (raw._id || raw.id).toString(),
    title: raw.title,
    description: raw.description,
    category: category?.name || raw.categoryName || (category?._id || raw.category)?.toString() || "General",
    categoryId: (category?._id || raw.category)?.toString() || null,
    status: raw.status || "pending",
    priority: raw.priority || "medium",
    location: {
      address: raw.locationAddress || raw.location?.address || null,
      lat: lat !== null && lat !== undefined ? Number(lat) : 28.6139,
      lng: lng !== null && lng !== undefined ? Number(lng) : 77.209,
    },
    latitude: lat,
    longitude: lng,
    locationAddress: raw.locationAddress || raw.location?.address || null,
    images: Array.isArray(raw.images) ? raw.images : [],
    isVerified: Boolean(raw.verifiedByAdmin),
    verifiedByAdmin: Boolean(raw.verifiedByAdmin),
    reportedBy: reporter
      ? {
          id: (reporter._id || reporter.id).toString(),
          name: reporter.name,
          email: reporter.email,
        }
      : (raw.reportedBy?._id || raw.reportedBy)?.toString() || null,
    assignedTo: assigned
      ? {
          id: (assigned._id || assigned.id).toString(),
          name: assigned.name,
          email: assigned.email,
        }
      : (raw.assignedTo?._id || raw.assignedTo)?.toString() || null,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : null,
  };
};

export default { toIssueDTO };
