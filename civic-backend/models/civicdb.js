const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },

    role: {
      type: String,
      enum: ["citizen", "official", "admin"],
      default: "citizen",
      required: true,
    },

    address: { type: String, default: null },
    profileImage: { type: String, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

/* ================================================================
 * 2. OFFICIALS
 * Extra profile info for government officials (extends User)
 * ================================================================ */
const officialSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    department: {
      type: String,
      required: true,
      enum: ["Roads", "Sanitation", "Water", "Electricity", "Other"],
    },

    designation: { type: String, default: null },
    employeeId: { type: String, default: null },

    isVerified: { type: Boolean, default: false },

    verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null }, // admin who verified
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Official = model("Official", officialSchema);

/* ================================================================
 * 3. ISSUES / REPORTS
 * Citizen reports an issue
 * Powers: Reports, Report Dashboard, Issue Details, All Issues, Handle Reports
 * ================================================================ */
const issueSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },

    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected", "verified"],
      default: "pending",
    },

    // Location
    locationAddress: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },

    // Images uploaded by citizen (quick access array; full detail in IssueAttachments)
    images: [{ type: String }],

    // Admin verification
    verifiedByAdmin: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Issue = model("Issue", issueSchema);

/* ================================================================
 * 4. ISSUE STATUS HISTORY
 * Tracks every status change made to an issue
 * Used in: Dashboard, Issue Details (timeline view)
 * ================================================================ */
const issueStatusHistorySchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true },

    oldStatus: { type: String, default: null },
    newStatus: { type: String, required: true },

    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    comment: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // only createdAt needed, history entries don't get "updated"
);

const IssueStatusHistory = model("IssueStatusHistory", issueStatusHistorySchema);

/* ================================================================
 * 5. ISSUE ASSIGNMENTS
 * Tracks which official handled which issue
 * Used in: Admin Dashboard, Official Dashboard (Handle Reports)
 * ================================================================ */
const issueAssignmentSchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    officialId: { type: Schema.Types.ObjectId, ref: "Official", required: true },

    assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // admin who assigned

    assignedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["assigned", "accepted", "completed", "rejected"],
      default: "assigned",
    },

    remarks: { type: String, default: null },
  },
  { timestamps: true }
);

const IssueAssignment = model("IssueAssignment", issueAssignmentSchema);

/* ================================================================
 * 6. ISSUE COMMENTS / RESPONSES
 
 * ================================================================ */
const issueCommentSchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    comment: { type: String, required: true },

    attachments: [{ type: String }], // optional image/file URLs
  },
  { timestamps: true }
);

const IssueComment = model("IssueComment", issueCommentSchema);

/* ================================================================
 * 7. NOTIFICATIONS
 * Common for Citizen + Official + Admin
 * Used in: Notification page
 * ================================================================ */
const notificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", default: null },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: ["issue_update", "assignment", "verification", "general"],
      default: "general",
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = model("Notification", notificationSchema);

/* ================================================================
 * 8. AI ANALYSIS
 * Used in: AI Report Analysis page
 * ================================================================ */
const aiAnalysisSchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true, unique: true },

    summary: { type: String, default: null },

    severityScore: { type: Number, min: 0, max: 100, default: null },

    predictedCategory: { type: String, default: null },
    suggestedDepartment: { type: String, default: null },
    suggestedPriority: { type: String, default: null },

    confidenceScore: { type: Number, default: null },

    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: Schema.Types.ObjectId, ref: "Issue", default: null },
  },
  { timestamps: true }
);

const AIAnalysis = model("AIAnalysis", aiAnalysisSchema);

/* ================================================================
 * 9. AI RESPONSES
 * "AI Bot for Report Response" — stores AI-generated reply to citizen
 * ================================================================ */
const aiResponseSchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    prompt: { type: String, default: null },
    response: { type: String, required: true },

    responseType: {
      type: String,
      enum: ["report_assistance", "status_update", "recommendation"],
      default: "report_assistance",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AIResponse = model("AIResponse", aiResponseSchema);

/* ================================================================
 * 10. ADMIN ACTIONS
 * Used in: Manage Officials/Citizens, Verify Officials, Verify Issues
 * ================================================================ */
const adminActionSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    targetUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    targetIssueId: { type: Schema.Types.ObjectId, ref: "Issue", default: null },

    actionType: {
      type: String,
      required: true,
      enum: [
        "verify_official",
        "verify_issue",
        "block_user",
        "unblock_user",
        "assign_issue",
        "reject_issue",
      ],
    },

    description: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AdminAction = model("AdminAction", adminActionSchema);

/* ================================================================
 * 11. CATEGORIES
 * Manage issue categories (road, sanitation, water, etc.)
 * ================================================================ */
const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Category = model("Category", categorySchema);

/* ================================================================
 * 12. ISSUE ATTACHMENTS
 * Photos / videos / documents uploaded as evidence with a report
 * ================================================================ */
const issueAttachmentSchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    fileUrl: { type: String, required: true },
    fileType: {
      type: String,
      enum: ["image", "video", "document"],
      default: "image",
    },
    fileName: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const IssueAttachment = model("IssueAttachment", issueAttachmentSchema);

/* ================================================================
 * EXPORT ALL MODELS
 * ================================================================ */
module.exports = {
  User,
  Official,
  Issue,
  IssueStatusHistory,
  IssueAssignment,
  IssueComment,
  Notification,
  AIAnalysis,
  AIResponse,
  AdminAction,
  Category,
  IssueAttachment,
};
