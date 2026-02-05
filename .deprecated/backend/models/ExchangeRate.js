const mongoose = require('mongoose');

const ExchangeRateSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true, default: 'USDT' },
  rate: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'master' }
});

// Compound index for unique pairs
ExchangeRateSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('ExchangeRate', ExchangeRateSchema);