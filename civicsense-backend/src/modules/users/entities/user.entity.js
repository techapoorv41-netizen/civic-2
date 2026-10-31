const mongoose = require('mongoose');
const { ROLES } = require('../../../shared/constants/roles');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ROLES, default: 'citizen' },
    isBlocked: { type: Boolean, default: false },
    blockedReason: String,
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    blockedAt: Date,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isBlocked: 1 });

module.exports = mongoose.model('User', userSchema);