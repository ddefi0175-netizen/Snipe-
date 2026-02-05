const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: String,
    enum: ['user', 'admin', 'system'],
    required: true
  },
  senderName: {
    type: String,
    default: 'User'
  },
  senderWallet: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  adminId: {
    type: String
  },
  adminName: {
    type: String
  },
  delivered: {
    type: Boolean,
    default: false
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ sender: 1, delivered: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
