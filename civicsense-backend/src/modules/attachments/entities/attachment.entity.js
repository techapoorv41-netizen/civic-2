const mongoose = require('mongoose');
const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    url: { type: String, required: true },
    storageKey: { type: String, required: true },
    provider: { type: String, enum: ['local', 'cloudinary'], required: true },
    mimeType: String,
    size: Number,
    originalName: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

attachmentSchema.index({ issueId: 1, createdAt: 1 });

module.exports = mongoose.model('Attachment', attachmentSchema);