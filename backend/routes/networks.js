const express = require('express');
const router = express.Router();
const Network = require('../models/Network');
const { verifyToken, requireMaster, requireAdmin } = require('./auth');

// Default networks
const DEFAULT_NETWORKS = [
  { name: 'Bitcoin Network', symbol: 'BTC', chainId: '-', confirmations: 3, status: 'active' },
  { name: 'Ethereum (ERC-20)', symbol: 'ETH', chainId: '1', confirmations: 12, status: 'active' },
  { name: 'BNB Smart Chain (BEP-20)', symbol: 'BSC', chainId: '56', confirmations: 15, status: 'active' },
  { name: 'Tron (TRC-20)', symbol: 'TRC20', chainId: '-', confirmations: 20, status: 'active' },
  { name: 'Solana', symbol: 'SOL', chainId: '-', confirmations: 32, status: 'active' },
  { name: 'Polygon', symbol: 'MATIC', chainId: '137', confirmations: 128, status: 'active' }
];

// GET /api/networks - Get all networks (public)
router.get('/', async (req, res) => {
  try {
    let networks = await Network.find().sort({ createdAt: 1 });
    
    if (networks.length === 0) {
      await Network.insertMany(DEFAULT_NETWORKS);
      networks = await Network.find().sort({ createdAt: 1 });
    }
    
    res.json(networks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/networks/active - Get active networks (public)
router.get('/active', async (req, res) => {
  try {
    const networks = await Network.find({ status: 'active' }).sort({ createdAt: 1 });
    res.json(networks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/networks - Create network (master only)
router.post('/', verifyToken, requireMaster, async (req, res) => {
  try {
    const { name, symbol, chainId, confirmations, status } = req.body;
    
    const existing = await Network.findOne({ symbol: symbol.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Network already exists' });
    }
    
    const network = new Network({
      name,
      symbol: symbol.toUpperCase(),
      chainId: chainId || '-',
      confirmations: confirmations || 12,
      status: status || 'active',
      updatedBy: req.user.username
    });
    
    await network.save();
    res.status(201).json({ success: true, network });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/networks/:id - Update network (master only)
router.put('/:id', verifyToken, requireMaster, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date(), updatedBy: req.user.username };
    delete updates._id;
    
    const network = await Network.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!network) {
      return res.status(404).json({ error: 'Network not found' });
    }
    
    res.json({ success: true, network });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/networks/:id - Delete network (master only)
router.delete('/:id', verifyToken, requireMaster, async (req, res) => {
  try {
    const network = await Network.findByIdAndDelete(req.params.id);
    if (!network) {
      return res.status(404).json({ error: 'Network not found' });
    }
    res.json({ success: true, message: `Network ${network.symbol} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;