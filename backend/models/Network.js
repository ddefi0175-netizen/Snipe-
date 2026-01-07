const mongoose = require('mongoose');

const NetworkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true, unique: true },
  chainId: { type: String, default: '-' },
  confirmations: { type: Number, default: 12 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'master' }
});

module.exports = mongoose.model('Network', NetworkSchema);