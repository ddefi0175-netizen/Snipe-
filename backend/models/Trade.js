const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  tradeId: { type: String, unique: true }, // Auto-generated trade ID
  userId: { type: String, required: true }, // User wallet or ID
  username: { type: String, default: '' },
  
  // Trade Type
  type: { type: String, enum: ['binary', 'arbitrage', 'spot'], required: true },
  
  // Binary Options specific
  pair: { type: String }, // BTC/USDT, ETH/USDT, etc.
  direction: { type: String, enum: ['up', 'down', 'buy', 'sell'] },
  entryPrice: { type: Number },
  exitPrice: { type: Number },
  duration: { type: Number }, // seconds
  expiryTime: { type: Date },
  
  // AI Arbitrage specific
  level: { type: Number }, // Level 1-5
  levelName: { type: String },
  expectedProfit: { type: Number },
  profitPercent: { type: Number },
  
  // Common fields
  amount: { type: Number, required: true },
  profit: { type: Number, default: 0 },
  payout: { type: Number, default: 0 },
  
  // Status
  status: { type: String, enum: ['active', 'pending', 'won', 'lost', 'completed', 'cancelled'], default: 'active' },
  result: { type: String, enum: ['win', 'lose', 'pending'], default: 'pending' },
  
  // Admin control (can force win/lose)
  adminForced: { type: Boolean, default: false },
  forcedResult: { type: String, enum: ['win', 'lose', null], default: null },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  
  // Reference to assigned admin
  assignedAdmin: { type: String, default: '' }
});

// Auto-generate tradeId before saving
TradeSchema.pre('save', async function(next) {
  if (!this.tradeId) {
    const count = await mongoose.model('Trade').countDocuments();
    this.tradeId = 'TRD-' + String(count + 1).padStart(6, '0');
  }
  next();
});

module.exports = mongoose.model('Trade', TradeSchema);
