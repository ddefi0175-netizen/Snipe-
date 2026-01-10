/*
 * ========================================
 * DEPRECATION NOTICE (Phase 3C)
 * ========================================
 * This file contains legacy MongoDB-based trade endpoints.
 * These endpoints are now DEPRECATED in favor of Firestore.
 *
 * MIGRATION GUIDE:
 * Old (MongoDB): GET /api/trades → New (Firestore): onSnapshot('trades')
 * Old (MongoDB): POST /api/trades → New: setDoc(collection('trades'), ...)
 * Old (MongoDB): PATCH /api/trades/:id → New: updateDoc(doc('trades', id), ...)
 *
 * All REST trade endpoints are PRESERVED for backward compatibility but
 * will be REMOVED in Phase 4. New code should use Firestore exclusively.
 *
 * FRONTEND EQUIVALENT:
 * - See src/components/TradeHistory.jsx for Firestore migration example
 * - Use Firestore onSnapshot for real-time updates
 * - Use setDoc/updateDoc for mutations
 *
 * Status: DEPRECATED | Backward compatible | Use Firestore for new features
 * Last Updated: Phase 3C
 */

const express = require('express');
const Trade = require('../models/Trade');
const User = require('../models/User');
const router = express.Router();

// Get all trades (admin/master)
router.get('/', async (req, res) => {
  try {
    const { userId, type, status, limit } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const trades = await Trade.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 100);
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trades by user wallet/ID
router.get('/user/:userId', async (req, res) => {
  try {
    const trades = await Trade.find({ 
      $or: [
        { userId: req.params.userId },
        { username: req.params.userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active trades
router.get('/active', async (req, res) => {
  try {
    const trades = await Trade.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trade statistics
router.get('/stats', async (req, res) => {
  try {
    const totalTrades = await Trade.countDocuments();
    const activeTrades = await Trade.countDocuments({ status: 'active' });
    const wonTrades = await Trade.countDocuments({ result: 'win' });
    const lostTrades = await Trade.countDocuments({ result: 'lose' });
    
    const totalVolume = await Trade.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalProfit = await Trade.aggregate([
      { $match: { result: 'win' } },
      { $group: { _id: null, total: { $sum: '$profit' } } }
    ]);
    
    res.json({
      totalTrades,
      activeTrades,
      wonTrades,
      lostTrades,
      winRate: totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(2) : 0,
      totalVolume: totalVolume[0]?.total || 0,
      totalProfit: totalProfit[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new trade
router.post('/', async (req, res) => {
  try {
    const { userId, username, type, pair, direction, entryPrice, duration, level, levelName, amount, expectedProfit, profitPercent } = req.body;
    
    // Get user's trade mode
    const user = await User.findOne({ $or: [{ wallet: userId }, { userId: userId }] });
    
    const trade = new Trade({
      userId,
      username: username || user?.username || '',
      type,
      pair,
      direction,
      entryPrice,
      duration,
      level,
      levelName,
      amount,
      expectedProfit,
      profitPercent,
      expiryTime: duration ? new Date(Date.now() + duration * 1000) : null,
      assignedAdmin: user?.assignedAdmin || ''
    });
    
    await trade.save();
    res.status(201).json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete/settle a trade
router.patch('/:id/complete', async (req, res) => {
  try {
    const { exitPrice, result, profit, payout } = req.body;
    const trade = await Trade.findById(req.params.id);
    
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    
    // Check if admin forced result
    let finalResult = result;
    if (trade.forcedResult) {
      finalResult = trade.forcedResult;
    } else {
      // Check user's trade mode
      const user = await User.findOne({ $or: [{ wallet: trade.userId }, { userId: trade.userId }] });
      if (user && user.tradeMode !== 'auto') {
        finalResult = user.tradeMode; // 'win' or 'lose'
      }
    }
    
    // Calculate payout based on result
    let finalProfit = profit || 0;
    let finalPayout = payout || 0;
    
    if (finalResult === 'win') {
      finalProfit = trade.expectedProfit || (trade.amount * (trade.profitPercent || 85) / 100);
      finalPayout = trade.amount + finalProfit;
    } else if (finalResult === 'lose') {
      finalProfit = -trade.amount;
      finalPayout = 0;
    }
    
    trade.exitPrice = exitPrice;
    trade.result = finalResult;
    trade.profit = finalProfit;
    trade.payout = finalPayout;
    trade.status = finalResult === 'win' ? 'won' : finalResult === 'lose' ? 'lost' : 'completed';
    trade.completedAt = new Date();
    trade.adminForced = !!trade.forcedResult;
    
    await trade.save();
    
    // Update user balance if won
    if (finalResult === 'win' && finalPayout > 0) {
      await User.findOneAndUpdate(
        { $or: [{ wallet: trade.userId }, { userId: trade.userId }] },
        { $inc: { balance: finalPayout, points: Math.floor(finalProfit / 10) } }
      );
    }
    
    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin force trade result
router.patch('/:id/force', async (req, res) => {
  try {
    const { forcedResult } = req.body;
    
    if (!['win', 'lose'].includes(forcedResult)) {
      return res.status(400).json({ error: 'Invalid forced result. Must be win or lose.' });
    }
    
    const trade = await Trade.findByIdAndUpdate(
      req.params.id,
      { forcedResult, adminForced: true },
      { new: true }
    );
    
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    
    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel trade
router.patch('/:id/cancel', async (req, res) => {
  try {
    const trade = await Trade.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', completedAt: new Date() },
      { new: true }
    );
    
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    
    // Refund amount to user
    await User.findOneAndUpdate(
      { $or: [{ wallet: trade.userId }, { userId: trade.userId }] },
      { $inc: { balance: trade.amount } }
    );
    
    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete trade (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const trade = await Trade.findByIdAndDelete(req.params.id);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    res.json({ success: true, message: 'Trade deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
