const mongoose = require('mongoose');
const { Schema } = mongoose;

const assignmentSchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    officialId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User id (D12)
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'rejected', 'completed'],
      default: 'assigned',
    },
    isActive: { type: Boolean, default: true }, // assigned/accepted में true
    dueDate: Date,
    remarks: String,
    rejectionReason: String,
    completionRemarks: String,
    statusLog: [{ status: String, at: Date, remarks: String, _id: false }],
    acceptedAt: Date,
    completedAt: Date,
    rejectedAt: Date,
  },
  { timestamps: true }
);

assignmentSchema.index({ officialId: 1, status: 1, createdAt: -1 });
// एक issue पर एक ही active assignment, DB स्तर की गारंटी
assignmentSchema.index({ issueId: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model('Assignment', assignmentSchema);