const mongoose = require('mongoose');

// Site Settings Schema
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
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'master' }
});

module.exports = mongoose.model('Settings', SiteSettingsSchema);