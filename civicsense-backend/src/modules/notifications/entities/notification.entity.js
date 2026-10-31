const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../../../shared/constants/notificationTypes');
const { Schema } = mongoose;

const s = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    issueId: { type: Schema.Types.ObjectId },
    assignmentId: { type: Schema.Types.ObjectId },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
s.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', s);