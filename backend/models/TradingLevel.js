const mongoose = require('mongoose');

const TradingLevelSchema = new mongoose.Schema({
  level: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  countdown: { type: Number, default: 180 }, // seconds
  profitPercent: { type: Number, default: 18 },
  minCapital: { type: Number, default: 100 },
  maxCapital: { type: Number, default: 10000 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'master' }
});

module.exports = mongoose.model('TradingLevel', TradingLevelSchema);