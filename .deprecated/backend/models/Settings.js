const mongoose = require('mongoose');

// Site Settings Schema - Extended for all admin control settings
const SiteSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'site_settings', unique: true },
  siteName: { type: String, default: 'OnchainWeb' },
  siteUrl: { type: String, default: 'https://onchainweb.app' },
  supportEmail: { type: String, default: 'support@onchainweb.com' },
  maintenanceMode: { type: Boolean, default: false },
  registrationEnabled: { type: Boolean, default: true },
  withdrawalEnabled: { type: Boolean, default: true },
  depositEnabled: { type: Boolean, default: true },
  tradingEnabled: { type: Boolean, default: true },
  minWithdrawal: { type: Number, default: 10 },
  maxWithdrawal: { type: Number, default: 100000 },
  withdrawalFee: { type: Number, default: 1 },
  referralBonus: { type: Number, default: 50 },
  welcomeBonus: { type: Number, default: 100 },
  
  // Trade Control Settings (master only)
  tradeControl: {
    mode: { type: String, enum: ['auto', 'win', 'lose'], default: 'auto' },
    winRate: { type: Number, default: 50, min: 0, max: 100 },
    targetUserId: { type: String, default: '' }
  },
  
  // Global Admin Settings
  globalSettings: {
    tradingFee: { type: Number, default: 0.1 },
    minDeposit: { type: Number, default: 10 },
    kycRequired: { type: Boolean, default: true },
    announcement: { type: String, default: '' }
  },
  
  // Trading Levels Configuration
  tradingLevels: [{
    level: { type: Number, required: true },
    minCapital: { type: Number, required: true },
    maxCapital: { type: Number, required: true },
    profit: { type: Number, required: true },
    duration: { type: Number, required: true }
  }],
  
  // AI Arbitrage Levels Configuration
  aiArbitrageLevels: [{
    level: { type: Number, required: true },
    minCapital: { type: Number, required: true },
    maxCapital: { type: Number, required: true },
    profit: { type: Number, required: true },
    cycleDays: { type: Number, required: true }
  }],
  
  // Bonus Programs Configuration
  bonusPrograms: {
    welcomeBonus: {
      amount: { type: Number, default: 100 },
      enabled: { type: Boolean, default: true },
      description: { type: String, default: 'Welcome bonus for new users' }
    },
    referralBonus: {
      amount: { type: Number, default: 50 },
      enabled: { type: Boolean, default: true },
      description: { type: String, default: 'Referral bonus per friend' }
    },
    tradingCashback: {
      percentage: { type: Number, default: 20 },
      enabled: { type: Boolean, default: true },
      description: { type: String, default: 'Trading cashback percentage' }
    },
    stakingRewards: {
      apy: { type: Number, default: 12 },
      enabled: { type: Boolean, default: true },
      description: { type: String, default: 'Annual staking rewards' }
    },
    vipBonus: {
      enabled: { type: Boolean, default: true },
      levels: [{
        level: { type: Number },
        bonus: { type: Number }
      }]
    },
    promotionEnd: { type: String, default: '' }
  },
  
  // Deposit Addresses per Network
  depositAddresses: [{
    network: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, default: '' },
    enabled: { type: Boolean, default: true }
  }],
  
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'master' }
});

// Update timestamp on save
SiteSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Settings', SiteSettingsSchema);