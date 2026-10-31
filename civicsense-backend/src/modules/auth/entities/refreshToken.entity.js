const mongoose = require('mongoose');
const { Schema } = mongoose;

const s = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedBy: Schema.Types.ObjectId,
    userAgent: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
s.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', s);