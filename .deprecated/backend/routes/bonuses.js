const express = require('express');
const router = express.Router();
const BonusProgram = require('../models/BonusProgram');
const { verifyToken, requireMaster, requireAdmin } = require('./auth');

// Default bonus programs
const DEFAULT_BONUSES = {
  key: 'bonus_programs',
  welcomeBonus: { enabled: true, amount: 100, description: 'Sign up and complete KYC' },
  referralBonus: { enabled: true, amount: 50, description: 'Per successful referral' },
  tradingCashback: { enabled: true, percentage: 20, minTrades: 10, description: 'Up to 20% on trading fees' },
  stakingBonus: { enabled: true, percentage: 12, description: 'APY on staking' },
  vipBonus: {
    enabled: true,
    levels: [
      { level: 1, minDeposit: 0, bonus: 0, cashback: 5 },
      { level: 2, minDeposit: 1000, bonus: 50, cashback: 10 },
      { level: 3, minDeposit: 5000, bonus: 100, cashback: 15 },
      { level: 4, minDeposit: 10000, bonus: 200, cashback: 20 },
      { level: 5, minDeposit: 50000, bonus: 500, cashback: 25 }
    ]
  },
  promotionEndDate: '2026-12-31'
};

// GET /api/bonuses - Get bonus programs (public)
router.get('/', async (req, res) => {
  try {
    let bonuses = await BonusProgram.findOne({ key: 'bonus_programs' });
    if (!bonuses) {
      bonuses = new BonusProgram(DEFAULT_BONUSES);
      await bonuses.save();
    }
    res.json(bonuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bonuses - Update bonus programs (master only)
router.put('/', verifyToken, requireMaster, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date(), updatedBy: req.user.username };
    delete updates._id;
    delete updates.key;
    
    let bonuses = await BonusProgram.findOneAndUpdate(
      { key: 'bonus_programs' },
      updates,
      { new: true, upsert: true }
    );
    
    res.json({ success: true, bonuses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bonuses/:type - Update specific bonus type (master only)
router.patch('/:type', verifyToken, requireMaster, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['welcomeBonus', 'referralBonus', 'tradingCashback', 'stakingBonus', 'vipBonus', 'promotionEndDate'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid bonus type' });
    }
    
    const update = { [type]: req.body, updatedAt: new Date(), updatedBy: req.user.username };
    
    let bonuses = await BonusProgram.findOneAndUpdate(
      { key: 'bonus_programs' },
      { $set: update },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, bonuses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;