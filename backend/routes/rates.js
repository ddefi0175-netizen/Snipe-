const express = require('express');
const router = express.Router();
const ExchangeRate = require('../models/ExchangeRate');
const { verifyToken, requireMaster, requireAdmin } = require('./auth');

// Default exchange rates
const DEFAULT_RATES = [
  { from: 'BTC', to: 'USDT', rate: 42500.00, status: 'active' },
  { from: 'ETH', to: 'USDT', rate: 2250.00, status: 'active' },
  { from: 'BNB', to: 'USDT', rate: 312.50, status: 'active' },
  { from: 'SOL', to: 'USDT', rate: 98.75, status: 'active' },
  { from: 'USDT', to: 'USD', rate: 1.00, status: 'active' },
  { from: 'MATIC', to: 'USDT', rate: 0.85, status: 'active' }
];

// GET /api/rates - Get all exchange rates (public)
router.get('/', async (req, res) => {
  try {
    let rates = await ExchangeRate.find().sort({ createdAt: 1 });
    
    if (rates.length === 0) {
      await ExchangeRate.insertMany(DEFAULT_RATES);
      rates = await ExchangeRate.find().sort({ createdAt: 1 });
    }
    
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rates/:from/:to - Get specific rate (public)
router.get('/:from/:to', async (req, res) => {
  try {
    const { from, to } = req.params;
    const rate = await ExchangeRate.findOne({ 
      from: from.toUpperCase(), 
      to: to.toUpperCase(),
      status: 'active'
    });
    
    if (!rate) {
      return res.status(404).json({ error: 'Rate not found' });
    }
    
    res.json(rate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rates - Create exchange rate (master only)
router.post('/', verifyToken, requireMaster, async (req, res) => {
  try {
    const { from, to, rate, status } = req.body;
    
    const existing = await ExchangeRate.findOne({ 
      from: from.toUpperCase(), 
      to: to.toUpperCase() 
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Rate pair already exists' });
    }
    
    const newRate = new ExchangeRate({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      status: status || 'active',
      updatedBy: req.user.username
    });
    
    await newRate.save();
    res.status(201).json({ success: true, rate: newRate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/rates/:id - Update exchange rate (master only)
router.put('/:id', verifyToken, requireMaster, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date(), updatedBy: req.user.username };
    delete updates._id;
    
    const rate = await ExchangeRate.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!rate) {
      return res.status(404).json({ error: 'Rate not found' });
    }
    
    res.json({ success: true, rate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rates/:id - Delete exchange rate (master only)
router.delete('/:id', verifyToken, requireMaster, async (req, res) => {
  try {
    const rate = await ExchangeRate.findByIdAndDelete(req.params.id);
    if (!rate) {
      return res.status(404).json({ error: 'Rate not found' });
    }
    res.json({ success: true, message: `Rate ${rate.from}/${rate.to} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
