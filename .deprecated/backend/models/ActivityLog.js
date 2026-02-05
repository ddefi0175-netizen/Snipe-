const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  // User activity or admin audit
  logType: { type: String, enum: ['user', 'admin'], required: true },
  userId: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  adminId: { type: String, default: '' },
  adminName: { type: String, default: '' },
  action: { type: String, required: true }, // login, deposit, withdraw, trade, kyc, etc.
  details: { type: String, default: '' },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
});

// Index for efficient queries
ActivityLogSchema.index({ logType: 1, timestamp: -1 });
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ adminId: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);