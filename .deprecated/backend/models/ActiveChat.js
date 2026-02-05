const mongoose = require('mongoose');

const activeChatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    default: 'Anonymous'
  },
  wallet: {
    type: String
  },
  userId: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'waiting', 'closed', 'resolved'],
    default: 'active'
  },
  lastMessage: {
    type: String
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  assignedAdmin: {
    type: String
  },
  assignedAdminName: {
    type: String
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
activeChatSchema.index({ status: 1, lastMessageTime: -1 });
activeChatSchema.index({ assignedAdmin: 1, status: 1 });

module.exports = mongoose.model('ActiveChat', activeChatSchema);
