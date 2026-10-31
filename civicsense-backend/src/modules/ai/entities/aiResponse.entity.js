const mongoose = require('mongoose');
const { Schema } = mongoose;

const aiResponseSchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    model: String,
    isMock: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

aiResponseSchema.index({ issueId: 1, userId: 1, createdAt: 1 });

module.exports = mongoose.model('AIResponse', aiResponseSchema);