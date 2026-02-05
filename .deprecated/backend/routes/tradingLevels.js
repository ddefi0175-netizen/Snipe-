const express = require('express');
const router = express.Router();
const TradingLevel = require('../models/TradingLevel');
const { verifyToken, requireMaster, requireAdmin } = require('./auth');

// Default trading levels
const DEFAULT_LEVELS = [
  { level: 1, name: 'Level-1', countdown: 180, profitPercent: 18, minCapital: 200, maxCapital: 20000, status: 'active' },
  { level: 2, name: 'Level-2', countdown: 240, profitPercent: 23, minCapital: 20001, maxCapital: 50000, status: 'active' },
  { level: 3, name: 'Level-3', countdown: 360, profitPercent: 35, minCapital: 50001, maxCapital: 100000, status: 'active' },
  { level: 4, name: 'Level-4', countdown: 480, profitPercent: 50, minCapital: 100001, maxCapital: 300000, status: 'active' },
  { level: 5, name: 'Level-5', countdown: 600, profitPercent: 100, minCapital: 300001, maxCapital: 500000, status: 'active' }
];

// GET /api/trading-levels - Get all trading levels (public)
router.get('/', async (req, res) => {
  try {
    let levels = await TradingLevel.find().sort({ level: 1 });
    
    // Initialize with defaults if empty
    if (levels.length === 0) {
      await TradingLevel.insertMany(DEFAULT_LEVELS);
      levels = await TradingLevel.find().sort({ level: 1 });
    }
    
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/trading-levels/active - Get active trading levels (public)
router.get('/active', async (req, res) => {
  try {
    const levels = await TradingLevel.find({ status: 'active' }).sort({ level: 1 });
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/trading-levels - Create new level (master only)
router.post('/', verifyToken, requireMaster, async (req, res) => {
  try {
    const { level, name, countdown, profitPercent, minCapital, maxCapital, status } = req.body;
    
    const existing = await TradingLevel.findOne({ level });
    if (existing) {
      return res.status(400).json({ error: 'Level already exists' });
    }
    
    const newLevel = new TradingLevel({
      level,
      name,
      countdown,
      profitPercent,
      minCapital,
      maxCapital,
      status: status || 'active',
      updatedBy: req.user.username
    });
    
    await newLevel.save();
    res.status(201).json({ success: true, level: newLevel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/trading-levels/:level - Update level (master only)
router.put('/:level', verifyToken, requireMaster, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date(), updatedBy: req.user.username };
    delete updates._id;
    delete updates.level; // Don't allow changing level number
    
    const level = await TradingLevel.findOneAndUpdate(
      { level: parseInt(req.params.level) },
      updates,
      { new: true }
    );
    
    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }
    
    res.json({ success: true, level });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/trading-levels/:level - Delete level (master only)
router.delete('/:level', verifyToken, requireMaster, async (req, res) => {
  try {
    const level = await TradingLevel.findOneAndDelete({ level: parseInt(req.params.level) });
    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }
    res.json({ success: true, message: `Level ${req.params.level} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/trading-levels/bulk - Bulk update all levels (master only)
router.put('/bulk/update', verifyToken, requireMaster, async (req, res) => {
  try {
    const { levels } = req.body;
    
    for (const levelData of levels) {
      await TradingLevel.findOneAndUpdate(
        { level: levelData.level },
        { ...levelData, updatedAt: new Date(), updatedBy: req.user.username },
        { upsert: true }
      );
    }
    
    const updatedLevels = await TradingLevel.find().sort({ level: 1 });
    res.json({ success: true, levels: updatedLevels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;