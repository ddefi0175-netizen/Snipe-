const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { verifyToken, requireMaster, requireAdmin } = require('./auth');
const { logActivity } = require('./adminActivity');

// Default settings including all admin control settings
const DEFAULT_SETTINGS = {
  key: 'site_settings',
  siteName: 'OnchainWeb',
  siteUrl: 'https://onchainweb.app',
  supportEmail: 'support@onchainweb.com',
  maintenanceMode: false,
  registrationEnabled: true,
  withdrawalEnabled: true,
  depositEnabled: true,
  tradingEnabled: true,
  minWithdrawal: 10,
  maxWithdrawal: 100000,
  withdrawalFee: 1,
  referralBonus: 50,
  welcomeBonus: 100,
  tradeControl: {
    mode: 'auto',
    winRate: 50,
    targetUserId: ''
  },
  globalSettings: {
    tradingFee: 0.1,
    minDeposit: 10,
    kycRequired: true,
    announcement: ''
  },
  tradingLevels: [
    { level: 1, minCapital: 100, maxCapital: 19999, profit: 18, duration: 180 },
    { level: 2, minCapital: 20000, maxCapital: 30000, profit: 23, duration: 360 },
    { level: 3, minCapital: 30001, maxCapital: 50000, profit: 33.5, duration: 720 },
    { level: 4, minCapital: 50001, maxCapital: 100000, profit: 50, duration: 1080 },
    { level: 5, minCapital: 100001, maxCapital: 300000, profit: 100, duration: 3600 }
  ],
  aiArbitrageLevels: [
    { level: 1, minCapital: 1000, maxCapital: 30000, profit: 0.9, cycleDays: 2 },
    { level: 2, minCapital: 30001, maxCapital: 50000, profit: 2, cycleDays: 5 },
    { level: 3, minCapital: 50001, maxCapital: 300000, profit: 3.5, cycleDays: 7 },
    { level: 4, minCapital: 300001, maxCapital: 500000, profit: 15, cycleDays: 15 },
    { level: 5, minCapital: 500001, maxCapital: 999999999, profit: 20, cycleDays: 30 }
  ],
  bonusPrograms: {
    welcomeBonus: { amount: 100, enabled: true, description: 'Welcome bonus for new users' },
    referralBonus: { amount: 50, enabled: true, description: 'Referral bonus per friend' },
    tradingCashback: { percentage: 20, enabled: true, description: 'Trading cashback percentage' },
    stakingRewards: { apy: 12, enabled: true, description: 'Annual staking rewards' },
    vipBonus: {
      enabled: true,
      levels: [
        { level: 1, bonus: 0 },
        { level: 2, bonus: 5 },
        { level: 3, bonus: 10 },
        { level: 4, bonus: 15 },
        { level: 5, bonus: 25 }
      ]
    },
    promotionEnd: ''
  },
  depositAddresses: [
    { network: 'BTC', name: 'Bitcoin', address: '', enabled: true },
    { network: 'ETH', name: 'Ethereum (ERC-20)', address: '', enabled: true },
    { network: 'BSC', name: 'BNB Smart Chain (BEP-20)', address: '', enabled: true },
    { network: 'TRC20', name: 'Tron (TRC-20)', address: '', enabled: true },
    { network: 'SOL', name: 'Solana', address: '', enabled: true },
    { network: 'MATIC', name: 'Polygon', address: '', enabled: true }
  ]
};

// GET /api/settings - Get site settings (public for basic settings, full for admin)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'site_settings' });
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
      await settings.save();
    }
    
    res.json({
      success: true,
      settings,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// PUT /api/settings - Update site settings (master only)
router.put('/', verifyToken, requireMaster, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date(), updatedBy: req.user.username };
    delete updates._id;
    delete updates.key;
    
    let settings = await Settings.findOneAndUpdate(
      { key: 'site_settings' },
      updates,
      { new: true, upsert: true }
    );
    
    // Log activity
    await logActivity(req, 'Update all site settings', 'update', 'settings', 'site_settings', 'Site Settings', updates);
    
    res.json({
      success: true,
      settings,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// PATCH /api/settings - Partial update (master only)
router.patch('/', verifyToken, requireMaster, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date(), updatedBy: req.user.username };
    delete updates._id;
    delete updates.key;
    
    let settings = await Settings.findOneAndUpdate(
      { key: 'site_settings' },
      { $set: updates },
      { new: true, upsert: true }
    );
    
    // Log activity
    await logActivity(req, 'Partial update site settings', 'update', 'settings', 'site_settings', 'Site Settings', updates);
    
    res.json({
      success: true,
      settings,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Partial update settings error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// GET /api/settings/trade-control - Get trade control settings (master only)
router.get('/trade-control', verifyToken, requireMaster, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'site_settings' });
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
      await settings.save();
    }
    
    res.json({
      success: true,
      tradeControl: settings.tradeControl || DEFAULT_SETTINGS.tradeControl,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Get trade control error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// PATCH /api/settings/trade-control - Update trade control settings (master only)
router.patch('/trade-control', verifyToken, requireMaster, async (req, res) => {
  try {
    const { mode, winRate, targetUserId } = req.body;
    
    const tradeControlUpdate = {};
    if (mode) tradeControlUpdate['tradeControl.mode'] = mode;
    if (winRate !== undefined) tradeControlUpdate['tradeControl.winRate'] = winRate;
    if (targetUserId !== undefined) tradeControlUpdate['tradeControl.targetUserId'] = targetUserId;
    
    let settings = await Settings.findOneAndUpdate(
      { key: 'site_settings' },
      {
        $set: {
          ...tradeControlUpdate,
          updatedAt: new Date(),
          updatedBy: req.user.username
        }
      },
      { new: true, upsert: true }
    );
    
    // Log activity
    await logActivity(req, 'Update trade control settings', 'update', 'settings', 'trade_control', 'Trade Control', req.body);
    
    res.json({
      success: true,
      tradeControl: settings.tradeControl,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Update trade control error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// GET /api/settings/trading-levels - Get trading levels (admin can read)
router.get('/trading-levels', verifyToken, requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'site_settings' });
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
      await settings.save();
    }
    
    res.json({
      success: true,
      tradingLevels: settings.tradingLevels || DEFAULT_SETTINGS.tradingLevels,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Get trading levels error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// PATCH /api/settings/trading-levels - Update trading levels (master only)
router.patch('/trading-levels', verifyToken, requireMaster, async (req, res) => {
  try {
    const { tradingLevels } = req.body;
    
    let settings = await Settings.findOneAndUpdate(
      { key: 'site_settings' },
      {
        $set: {
          tradingLevels,
          updatedAt: new Date(),
          updatedBy: req.user.username
        }
      },
      { new: true, upsert: true }
    );
    
    // Log activity
    await logActivity(req, 'Update trading levels', 'update', 'settings', 'trading_levels', 'Trading Levels', { count: tradingLevels.length });
    
    res.json({
      success: true,
      tradingLevels: settings.tradingLevels,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Update trading levels error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// GET /api/settings/arbitrage-levels - Get AI arbitrage levels (admin can read)
router.get('/arbitrage-levels', verifyToken, requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'site_settings' });
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
      await settings.save();
    }
    
    res.json({
      success: true,
      aiArbitrageLevels: settings.aiArbitrageLevels || DEFAULT_SETTINGS.aiArbitrageLevels,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Get arbitrage levels error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// PATCH /api/settings/arbitrage-levels - Update AI arbitrage levels (master only)
router.patch('/arbitrage-levels', verifyToken, requireMaster, async (req, res) => {
  try {
    const { aiArbitrageLevels } = req.body;
    
    let settings = await Settings.findOneAndUpdate(
      { key: 'site_settings' },
      {
        $set: {
          aiArbitrageLevels,
          updatedAt: new Date(),
          updatedBy: req.user.username
        }
      },
      { new: true, upsert: true }
    );
    
    // Log activity
    await logActivity(req, 'Update AI arbitrage levels', 'update', 'settings', 'arbitrage_levels', 'Arbitrage Levels', { count: aiArbitrageLevels.length });
    
    res.json({
      success: true,
      aiArbitrageLevels: settings.aiArbitrageLevels,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Update arbitrage levels error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// GET /api/settings/bonus-programs - Get bonus programs (admin can read)
router.get('/bonus-programs', verifyToken, requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'site_settings' });
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
      await settings.save();
    }
    
    res.json({
      success: true,
      bonusPrograms: settings.bonusPrograms || DEFAULT_SETTINGS.bonusPrograms,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Get bonus programs error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// PATCH /api/settings/bonus-programs - Update bonus programs (master only)
router.patch('/bonus-programs', verifyToken, requireMaster, async (req, res) => {
  try {
    const { bonusPrograms } = req.body;
    
    let settings = await Settings.findOneAndUpdate(
      { key: 'site_settings' },
      {
        $set: {
          bonusPrograms,
          updatedAt: new Date(),
          updatedBy: req.user.username
        }
      },
      { new: true, upsert: true }
    );
    
    // Log activity
    await logActivity(req, 'Update bonus programs', 'update', 'settings', 'bonus_programs', 'Bonus Programs', bonusPrograms);
    
    res.json({
      success: true,
      bonusPrograms: settings.bonusPrograms,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Update bonus programs error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// GET /api/settings/deposit-addresses - Get deposit addresses (admin can read)
router.get('/deposit-addresses', verifyToken, requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'site_settings' });
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
      await settings.save();
    }
    
    res.json({
      success: true,
      depositAddresses: settings.depositAddresses || DEFAULT_SETTINGS.depositAddresses,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Get deposit addresses error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// PATCH /api/settings/deposit-addresses - Update deposit addresses (master only)
router.patch('/deposit-addresses', verifyToken, requireMaster, async (req, res) => {
  try {
    const { depositAddresses } = req.body;
    
    let settings = await Settings.findOneAndUpdate(
      { key: 'site_settings' },
      {
        $set: {
          depositAddresses,
          updatedAt: new Date(),
          updatedBy: req.user.username
        }
      },
      { new: true, upsert: true }
    );
    
    // Log activity
    await logActivity(req, 'Update deposit addresses', 'update', 'settings', 'deposit_addresses', 'Deposit Addresses', { count: depositAddresses.length });
    
    res.json({
      success: true,
      depositAddresses: settings.depositAddresses,
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (err) {
    console.error('Update deposit addresses error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

module.exports = router;