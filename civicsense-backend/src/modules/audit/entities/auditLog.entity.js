const mongoose = require('mongoose');
const { AUDIT_ACTIONS } = require('../../../shared/constants/auditActions');
const { Schema } = mongoose;

const s = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    targetType: String,
    targetId: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
s.index({ createdAt: -1 });
s.index({ actorId: 1, createdAt: -1 });
s.index({ action: 1, createdAt: -1 });
s.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', s);