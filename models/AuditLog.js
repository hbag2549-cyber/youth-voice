const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  action: String,
  resourceType: String,
  resourceId: mongoose.Schema.Types.ObjectId,
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now, index: true, expires: 7776000 }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
