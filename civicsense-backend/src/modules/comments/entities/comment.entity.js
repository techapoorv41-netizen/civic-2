const mongoose = require('mongoose');
const { Schema } = mongoose;

const s = new Schema(
  {
    issueId: { type: Schema.Types.ObjectId, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
  },
  { timestamps: true }
);
s.index({ issueId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', s);