const mongoose = require('mongoose');
const { ISSUE_STATUSES, PRIORITIES } = require('../../../shared/constants/issueStatus');
const { Schema } = mongoose;

const issueSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ISSUE_STATUSES, default: 'pending', index: true },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    location: {
      address: String,
      lat: Number,
      lng: Number,
      point: {
        type: { type: String, enum: ['Point'] },
        coordinates: [Number], // [lng, lat]
      },
    },
    assignedOfficialId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    remarks: String,
    resolvedAt: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

issueSchema.index({ createdAt: -1 });
issueSchema.index({ 'location.point': '2dsphere' });
issueSchema.index({ title: 'text', description: 'text' });
issueSchema.index({ reporterId: 1, status: 1, createdAt: -1 });
issueSchema.index({ assignedOfficialId: 1, status: 1 });

module.exports = mongoose.model('Issue', issueSchema);