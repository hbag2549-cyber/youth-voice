const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetType: { type: String, enum: ['Post', 'Comment'], required: true },
  target: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, refPath: 'targetType' },
  createdAt: { type: Date, default: Date.now }
});

likeSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
