const mongoose = require('mongoose');

const DepositWalletSchema = new mongoose.Schema({
  network: { type: String, required: true },
  address: { type: String, default: '' },
  label: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'master' }
});

module.exports = mongoose.model('DepositWallet', DepositWalletSchema);