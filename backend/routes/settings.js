const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { verifyToken, requireMaster, requireAdmin } = require('./auth');

// Default settings
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
  welcomeBonus: 100
};

// GET /api/settings - Get site settings (public for basic settings, full for admin)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'site_settings' });
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;