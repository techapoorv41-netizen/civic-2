const mongoose = require('mongoose');
const { ISSUE_STATUSES } = require('../../../shared/constants/issueStatus');
const { Schema } = mongoose;

const historySchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    previousStatus: { type: String, enum: [...ISSUE_STATUSES, null], default: null },
    newStatus: { type: String, enum: ISSUE_STATUSES, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

historySchema.index({ issueId: 1, createdAt: 1 });

module.exports = mongoose.model('IssueHistory', historySchema);