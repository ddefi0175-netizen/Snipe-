const mongoose = require('mongoose');

const StakingSchema = new mongoose.Schema({
  stakeId: { type: String, unique: true }, // Auto-generated stake ID
  userId: { type: String, required: true }, // User wallet or ID
  username: { type: String, default: '' },
  
  // Staking plan details
  planId: { type: String, required: true },
  planName: { type: String, required: true },
  tier: { type: String }, // bronze, silver, gold, platinum, diamond
  
  // Amounts
  amount: { type: Number, required: true },
  apy: { type: Number, required: true }, // Annual percentage yield
  dailyRate: { type: Number }, // Daily interest rate
  
  // Duration
  duration: { type: Number, required: true }, // Days
  lockPeriod: { type: Number, default: 0 }, // Lock period in days
  
  // Earnings
  totalEarnings: { type: Number, default: 0 },
  pendingEarnings: { type: Number, default: 0 },
  claimedEarnings: { type: Number, default: 0 },
  lastClaimDate: { type: Date },
  
  // Status
  status: { type: String, enum: ['active', 'completed', 'cancelled', 'withdrawn'], default: 'active' },
  autoCompound: { type: Boolean, default: false },
  
  // Timestamps
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  completedAt: { type: Date },
  
  // Admin control
  adminModified: { type: Boolean, default: false },
  assignedAdmin: { type: String, default: '' }
});

// Auto-generate stakeId before saving
StakingSchema.pre('save', async function(next) {
  if (!this.stakeId) {
    const count = await mongoose.model('Staking').countDocuments();
    this.stakeId = 'STK-' + String(count + 1).padStart(6, '0');
  }
  // Calculate end date based on duration
  if (!this.endDate && this.duration) {
    this.endDate = new Date(this.startDate.getTime() + this.duration * 24 * 60 * 60 * 1000);
  }
  // Calculate daily rate from APY
  if (!this.dailyRate && this.apy) {
    this.dailyRate = this.apy / 365;
  }
  next();
});

module.exports = mongoose.model('Staking', StakingSchema);
