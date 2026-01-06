const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  email: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'master'], default: 'user' },
  points: { type: Number, default: 0 },
  creditScore: { type: Number, default: 100 },
  balance: { type: Number, default: 0 },
  frozen: { type: Boolean, default: false },
  level: { type: Number, default: 1 },
  kycVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
