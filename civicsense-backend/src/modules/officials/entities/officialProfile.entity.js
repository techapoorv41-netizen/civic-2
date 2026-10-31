const mongoose = require('mongoose');
const { Schema } = mongoose;

const s = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
  },
  { timestamps: true }
);
s.index({ employeeId: 1 }, { unique: true, sparse: true });
s.index({ isVerified: 1, department: 1 });

module.exports = mongoose.model('OfficialProfile', s);