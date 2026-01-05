const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin', 'master'], default: 'user' },
  points: { type: Number, default: 0 },
  creditScore: { type: Number, default: 0 },
  frozen: { type: Boolean, default: false },
  level: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
