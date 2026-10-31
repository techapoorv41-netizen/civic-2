const mongoose = require('mongoose');
const { Schema } = mongoose;

const aiAnalysisSchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    severityScore: { type: Number, min: 1, max: 10, required: true },
    predictedCategory: { type: String, default: null },
    duplicateIssueIds: [{ type: Schema.Types.ObjectId, ref: 'Issue' }],
    reasoning: String,
    model: String,
    isMock: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

aiAnalysisSchema.index({ issueId: 1, createdAt: -1 });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);