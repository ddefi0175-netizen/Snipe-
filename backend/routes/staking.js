const express = require('express');
const Staking = require('../models/Staking');
const User = require('../models/User');
const router = express.Router();

// Get all stakes (admin/master)
router.get('/', async (req, res) => {
  try {
    const { userId, status, limit } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    
    const stakes = await Staking.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 100);
    res.json(stakes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get stakes by user wallet/ID
router.get('/user/:userId', async (req, res) => {
  try {
    const stakes = await Staking.find({ 
      $or: [
        { userId: req.params.userId },
        { username: req.params.userId }
      ]
    }).sort({ startDate: -1 });
    res.json(stakes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active stakes
router.get('/active', async (req, res) => {
  try {
    const stakes = await Staking.find({ status: 'active' }).sort({ startDate: -1 });
    res.json(stakes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get staking statistics
router.get('/stats', async (req, res) => {
  try {
    const totalStakes = await Staking.countDocuments();
    const activeStakes = await Staking.countDocuments({ status: 'active' });
    const completedStakes = await Staking.countDocuments({ status: 'completed' });
    
    const totalStaked = await Staking.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalEarnings = await Staking.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
    ]);
    
    res.json({
      totalStakes,
      activeStakes,
      completedStakes,
      totalStaked: totalStaked[0]?.total || 0,
      totalEarnings: totalEarnings[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new stake
router.post('/', async (req, res) => {
  try {
    const { userId, username, planId, planName, tier, amount, apy, duration, lockPeriod, autoCompound } = req.body;
    
    // Get user info
    const user = await User.findOne({ $or: [{ wallet: userId }, { userId: userId }] });
    
    const stake = new Staking({
      userId,
      username: username || user?.username || '',
      planId,
      planName,
      tier,
      amount,
      apy,
      duration,
      lockPeriod: lockPeriod || 0,
      autoCompound: autoCompound || false,
      assignedAdmin: user?.assignedAdmin || ''
    });
    
    await stake.save();
    
    // Increment user's stake count
    if (user) {
      user.stakeCount = (user.stakeCount || 0) + 1;
      await user.save();
    }
    
    res.status(201).json(stake);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate and claim earnings
router.patch('/:id/claim', async (req, res) => {
  try {
    const stake = await Staking.findById(req.params.id);
    
    if (!stake) {
      return res.status(404).json({ error: 'Stake not found' });
    }
    
    if (stake.status !== 'active') {
      return res.status(400).json({ error: 'Stake is not active' });
    }
    
    // Calculate earnings since last claim
    const now = new Date();
    const lastClaim = stake.lastClaimDate || stake.startDate;
    const daysSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60 * 24);
    
    const dailyEarnings = stake.amount * (stake.dailyRate / 100);
    const newEarnings = dailyEarnings * daysSinceLastClaim;
    
    stake.pendingEarnings = 0;
    stake.claimedEarnings += newEarnings;
    stake.totalEarnings += newEarnings;
    stake.lastClaimDate = now;
    
    await stake.save();
    
    // Update user balance
    const user = await User.findOne({ $or: [{ wallet: stake.userId }, { userId: stake.userId }] });
    if (user) {
      user.balance = (user.balance || 0) + newEarnings;
      await user.save();
    }
    
    res.json({
      success: true,
      claimed: newEarnings,
      totalEarnings: stake.totalEarnings,
      stake
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Withdraw stake (after lock period)
router.patch('/:id/withdraw', async (req, res) => {
  try {
    const stake = await Staking.findById(req.params.id);
    
    if (!stake) {
      return res.status(404).json({ error: 'Stake not found' });
    }
    
    if (stake.status !== 'active') {
      return res.status(400).json({ error: 'Stake is not active' });
    }
    
    // Check lock period
    const now = new Date();
    const lockEndDate = new Date(stake.startDate.getTime() + stake.lockPeriod * 24 * 60 * 60 * 1000);
    
    if (now < lockEndDate) {
      return res.status(400).json({ 
        error: 'Stake is still locked',
        lockEndsAt: lockEndDate
      });
    }
    
    // Calculate final earnings
    const lastClaim = stake.lastClaimDate || stake.startDate;
    const daysSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60 * 24);
    const dailyEarnings = stake.amount * (stake.dailyRate / 100);
    const finalEarnings = dailyEarnings * daysSinceLastClaim;
    
    stake.totalEarnings += finalEarnings;
    stake.status = 'withdrawn';
    stake.completedAt = now;
    
    await stake.save();
    
    // Return stake amount + earnings to user
    const totalReturn = stake.amount + finalEarnings;
    const user = await User.findOne({ $or: [{ wallet: stake.userId }, { userId: stake.userId }] });
    if (user) {
      user.balance = (user.balance || 0) + totalReturn;
      await user.save();
    }
    
    res.json({
      success: true,
      withdrawn: stake.amount,
      finalEarnings,
      totalReturn,
      stake
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update stake
router.patch('/:id', async (req, res) => {
  try {
    const allowedUpdates = ['status', 'totalEarnings', 'pendingEarnings', 'apy', 'dailyRate', 'adminModified'];
    const updates = {};
    
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    
    if (Object.keys(updates).length > 0) {
      updates.adminModified = true;
    }
    
    const stake = await Staking.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!stake) {
      return res.status(404).json({ error: 'Stake not found' });
    }
    res.json(stake);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete stake
router.delete('/:id', async (req, res) => {
  try {
    const stake = await Staking.findByIdAndDelete(req.params.id);
    if (!stake) {
      return res.status(404).json({ error: 'Stake not found' });
    }
    res.json({ success: true, deleted: stake.stakeId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
