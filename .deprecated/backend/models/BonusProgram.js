const mongoose = require('mongoose');

const BonusProgramSchema = new mongoose.Schema({
  key: { type: String, default: 'bonus_programs', unique: true },
  welcomeBonus: {
    enabled: { type: Boolean, default: true },
    amount: { type: Number, default: 100 },
    description: { type: String, default: 'Sign up and complete KYC' }
  },
  referralBonus: {
    enabled: { type: Boolean, default: true },
    amount: { type: Number, default: 50 },
    description: { type: String, default: 'Per successful referral' }
  },
  tradingCashback: {
    enabled: { type: Boolean, default: true },
    percentage: { type: Number, default: 20 },
    minTrades: { type: Number, default: 10 },
    description: { type: String, default: 'Up to 20% on trading fees' }
  },
  stakingBonus: {
    enabled: { type: Boolean, default: true },
    percentage: { type: Number, default: 12 },
    description: { type: String, default: 'APY on staking' }
  },
  vipBonus: {
    enabled: { type: Boolean, default: true },
    levels: [{
      level: Number,
      minDeposit: Number,
      bonus: Number,
      cashback: Number
    }]
  },
  promotionEndDate: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'master' }
});

module.exports = mongoose.model('BonusProgram', BonusProgramSchema);