const express = require('express');
const router = express.Router();
const Currency = require('../models/Currency');
const { verifyToken, requireMaster, requireAdmin } = require('./auth');

// Default currencies
const DEFAULT_CURRENCIES = [
  { name: 'Bitcoin', symbol: 'BTC', icon: '₿', status: 'active' },
  { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', status: 'active' },
  { name: 'Tether', symbol: 'USDT', icon: '₮', status: 'active' },
  { name: 'BNB', symbol: 'BNB', icon: '⬡', status: 'active' },
  { name: 'Solana', symbol: 'SOL', icon: '◎', status: 'active' }
];

// GET /api/currencies - Get all currencies (public)
router.get('/', async (req, res) => {
  try {
    let currencies = await Currency.find().sort({ createdAt: 1 });
    
    if (currencies.length === 0) {
      await Currency.insertMany(DEFAULT_CURRENCIES);
      currencies = await Currency.find().sort({ createdAt: 1 });
    }
    
    res.json(currencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/currencies/active - Get active currencies (public)
router.get('/active', async (req, res) => {
  try {
    const currencies = await Currency.find({ status: 'active' }).sort({ createdAt: 1 });
    res.json(currencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/currencies - Create currency (master only)
router.post('/', verifyToken, requireMaster, async (req, res) => {
  try {
    const { name, symbol, icon, status } = req.body;
    
    const existing = await Currency.findOne({ symbol: symbol.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Currency already exists' });
    }
    
    const currency = new Currency({
      name,
      symbol: symbol.toUpperCase(),
      icon,
      status: status || 'active',
      updatedBy: req.user.username
    });
    
    await currency.save();
    res.status(201).json({ success: true, currency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/currencies/:id - Update currency (master only)
router.put('/:id', verifyToken, requireMaster, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date(), updatedBy: req.user.username };
    delete updates._id;
    
    const currency = await Currency.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }
    
    res.json({ success: true, currency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/currencies/:id - Delete currency (master only)
router.delete('/:id', verifyToken, requireMaster, async (req, res) => {
  try {
    const currency = await Currency.findByIdAndDelete(req.params.id);
    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }
    res.json({ success: true, message: `Currency ${currency.symbol} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;