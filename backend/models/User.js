const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  userId: { type: String, unique: true }, // Generated user ID like 00001
  username: { type: String, default: '' },
  email: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'master'], default: 'user' },
  points: { type: Number, default: 0 },
  creditScore: { type: Number, default: 100 },
  balance: { type: Number, default: 0 },
  frozen: { type: Boolean, default: false },
  level: { type: Number, default: 1 },
  vipLevel: { type: Number, default: 1 },
  allowedTradingLevel: { type: Number, default: 1 },
  
  // KYC Information
  kycStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
  kycFullName: { type: String, default: '' },
  kycDocType: { type: String, default: '' },
  kycDocNumber: { type: String, default: '' },
  kycFrontPhoto: { type: String, default: '' },
  kycBackPhoto: { type: String, default: '' },
  kycSubmittedAt: { type: Date },
  kycVerifiedAt: { type: Date },
  
  // Trade Control (admin sets for this user)
  tradeMode: { type: String, enum: ['auto', 'win', 'lose'], default: 'auto' },
  
  // Activity
  lastLogin: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  
  // Admin assignment (which admin manages this user)
  assignedAdmin: { type: String, default: '' }
});

// Auto-generate userId before saving
UserSchema.pre('save', async function(next) {
  if (!this.userId) {
    const count = await mongoose.model('User').countDocuments();
    this.userId = String(count + 1).padStart(5, '0');
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
