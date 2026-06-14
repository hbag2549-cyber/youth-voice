const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['Post', 'Comment', 'User'], required: true, index: true },
  target: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'hate_speech', 'explicit_content', 'misinformation', 'copyright', 'other'],
    required: true
  },
  description: { type: String, maxlength: 1000 },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'rejected'], default: 'pending', index: true },
  resolution: {
    action: { type: String, enum: ['warning', 'suspension', 'ban', 'delete', 'no_action'] },
    notes: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
