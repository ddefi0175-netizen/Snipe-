const express = require('express');
const router = express.Router();
const AdminActivity = require('../models/AdminActivity');
const { verifyToken, requireAdmin } = require('./auth');

// Middleware to log admin activity
const logActivity = async (req, action, actionType, targetType, targetId, targetName, details = {}) => {
  try {
    const activity = new AdminActivity({
      adminUsername: req.user?.username || 'system',
      adminId: req.user?.adminId || req.user?.username,
      action,
      actionType,
      targetType,
      targetId,
      targetName,
      details,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
      success: true,
      timestamp: new Date()
    });
    await activity.save();
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
};

// GET /api/admin-activity - Get activity logs (admin/master only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    
    const adminUsername = req.query.admin;
    const actionType = req.query.actionType;
    const targetType = req.query.targetType;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Build query
    let query = {};
    
    // If not master, only show their own activities
    if (req.user.role !== 'master') {
      query.adminUsername = req.user.username;
    } else if (adminUsername) {
      query.adminUsername = adminUsername;
    }

    if (actionType) query.actionType = actionType;
    if (targetType) query.targetType = targetType;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const [activities, total] = await Promise.all([
      AdminActivity.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminActivity.countDocuments(query)
    ]);

    res.json({
      success: true,
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      },
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (error) {
    console.error('Get admin activities error:', error);
    res.status(500).json({ error: 'Server error', success: false });
  }
});

// GET /api/admin-activity/stats - Get activity statistics
router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    let query = { timestamp: { $gte: startTime } };
    
    // If not master, only show their own stats
    if (req.user.role !== 'master') {
      query.adminUsername = req.user.username;
    }

    const [totalActions, actionsByType, actionsByTarget] = await Promise.all([
      AdminActivity.countDocuments(query),
      AdminActivity.aggregate([
        { $match: query },
        { $group: { _id: '$actionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AdminActivity.aggregate([
        { $match: query },
        { $group: { _id: '$targetType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalActions,
        period: `${hours} hours`,
        actionsByType,
        actionsByTarget
      },
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb'
      }
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Server error', success: false });
  }
});

// Export router and middleware
module.exports = router;
module.exports.logActivity = logActivity;
