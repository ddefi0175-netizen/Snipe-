const express = require('express');
const router = express.Router();
const DepositWallet = require('../models/DepositWallet');
const { verifyToken, requireMaster, requireAdmin } = require('./auth');

// Default deposit wallets
const DEFAULT_WALLETS = [
  { network: 'BTC', label: 'Bitcoin', address: '', status: 'active' },
  { network: 'ETH', label: 'Ethereum (ERC-20)', address: '', status: 'active' },
  { network: 'BSC', label: 'BNB Smart Chain (BEP-20)', address: '', status: 'active' },
  { network: 'TRC20', label: 'Tron (TRC-20)', address: '', status: 'active' },
  { network: 'SOL', label: 'Solana', address: '', status: 'active' },
  { network: 'MATIC', label: 'Polygon', address: '', status: 'active' }
];

// GET /api/deposit-wallets - Get all deposit wallets (public for users to see addresses)
router.get('/', async (req, res) => {
  try {
    let wallets = await DepositWallet.find().sort({ createdAt: 1 });
    
    if (wallets.length === 0) {
      await DepositWallet.insertMany(DEFAULT_WALLETS);
      wallets = await DepositWallet.find().sort({ createdAt: 1 });
    }
    
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/deposit-wallets/active - Get active deposit wallets (public)
router.get('/active', async (req, res) => {
  try {
    const wallets = await DepositWallet.find({ 
      status: 'active',
      address: { $ne: '' }
    }).sort({ createdAt: 1 });
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/deposit-wallets/:network - Get wallet by network (public)
router.get('/:network', async (req, res) => {
  try {
    const wallet = await DepositWallet.findOne({ 
      network: req.params.network.toUpperCase(),
      status: 'active'
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found for network' });
    }
    
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/deposit-wallets - Create deposit wallet (master only)
router.post('/', verifyToken, requireMaster, async (req, res) => {
  try {
    const { network, label, address, status } = req.body;
    
    const existing = await DepositWallet.findOne({ network: network.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Wallet for this network already exists' });
    }
    
    const wallet = new DepositWallet({
      network: network.toUpperCase(),
      label,
      address,
      status: status || 'active',
      updatedBy: req.user.username
    });
    
    await wallet.save();
    res.status(201).json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/deposit-wallets/:id - Update deposit wallet (master only)
router.put('/:id', verifyToken, requireMaster, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date(), updatedBy: req.user.username };
    delete updates._id;
    
    const wallet = await DepositWallet.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/deposit-wallets/:network/address - Update wallet address by network (master only)
router.patch('/:network/address', verifyToken, requireMaster, async (req, res) => {
  try {
    const { address } = req.body;
    
    const wallet = await DepositWallet.findOneAndUpdate(
      { network: req.params.network.toUpperCase() },
      { address, updatedAt: new Date(), updatedBy: req.user.username },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/deposit-wallets/:id - Delete deposit wallet (master only)
router.delete('/:id', verifyToken, requireMaster, async (req, res) => {
  try {
    const wallet = await DepositWallet.findByIdAndDelete(req.params.id);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json({ success: true, message: `Wallet ${wallet.network} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
