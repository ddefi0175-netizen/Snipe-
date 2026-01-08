const mongoose = require('mongoose');

// Admin Activity Log for tracking admin actions in real-time
const AdminActivitySchema = new mongoose.Schema({
  adminUsername: { type: String, required: true, index: true },
  adminId: { type: String },
  action: { type: String, required: true },
  actionType: { 
    type: String, 
    enum: ['create', 'update', 'delete', 'login', 'logout', 'view', 'approve', 'reject'],
    required: true,
    index: true
  },
  targetType: { 
    type: String, 
    enum: ['user', 'admin', 'trade', 'kyc', 'deposit', 'withdrawal', 'settings', 'system'],
    index: true
  },
  targetId: { type: String },
  targetName: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  success: { type: Boolean, default: true },
  errorMessage: { type: String },
  timestamp: { type: Date, default: Date.now, index: true }
});

// Index for efficient querying
AdminActivitySchema.index({ adminUsername: 1, timestamp: -1 });
AdminActivitySchema.index({ actionType: 1, timestamp: -1 });
AdminActivitySchema.index({ targetType: 1, timestamp: -1 });

module.exports = mongoose.model('AdminActivity', AdminActivitySchema);
