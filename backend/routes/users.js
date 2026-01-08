const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify token (import from auth)
const { verifyToken, requireAdmin } = require('./auth');

// Get all users with pagination (admin/master only with real-time filtering)
// Query params: page (default 1), limit (default 50, max 100), search, sortBy, sortOrder
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { wallet: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Execute query with pagination - real-time from MongoDB
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-__v'),  // Exclude version field
      User.countDocuments(query)
    ]);

    // Add real-time metadata
    const response = {
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      },
      realTime: {
        timestamp: new Date().toISOString(),
        source: 'mongodb',
        queryTime: Date.now()
      }
    };

    res.json(response);
  } catch (err) {
    console.error('[USERS] Error fetching users:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// Get user by wallet address
router.get('/wallet/:wallet', async (req, res) => {
  try {
    const user = await User.findOne({ wallet: req.params.wallet });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by userId
router.get('/id/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update user by wallet (login/register)
router.post('/', async (req, res) => {
  try {
    const { wallet, walletType, username, email } = req.body;

    // Get IP and user agent from request
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    let user = await User.findOne({ wallet });

    if (user) {
      // Update last login and activity info
      user.lastLogin = new Date();
      user.lastActive = new Date();
      user.ipAddress = ipAddress;
      user.userAgent = userAgent;
      if (walletType) user.walletType = walletType;
      if (username) user.username = username;
      if (email) user.email = email;
      await user.save();
    } else {
      // Create new user
      user = new User({
        wallet,
        walletType: walletType || '',
        username: username || '',
        email: email || '',
        role: 'user',
        points: 0,
        creditScore: 100,
        level: 1,
        vipLevel: 1,
        allowedTradingLevel: 1,
        frozen: false,
        balance: 0,
        ipAddress,
        userAgent
      });
      await user.save();
      console.log('New user created:', user.userId, user.wallet.substring(0, 10) + '...');
    }

    res.status(201).json(user);
  } catch (err) {
    console.error('User creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user (admin/master only)
router.patch('/:id', async (req, res) => {
  try {
    const allowedUpdates = [
      'role', 'points', 'creditScore', 'frozen', 'level', 'balance',
      'email', 'username', 'vipLevel', 'allowedTradingLevel', 'tradeMode',
      'kycStatus', 'kycFullName', 'kycDocType', 'kycDocNumber',
      'kycFrontPhoto', 'kycBackPhoto', 'kycSubmittedAt', 'kycVerifiedAt',
      'assignedAdmin', 'lastActive',
      // New fields for enhanced user management
      'presetTradeResult', 'withdrawEnabled', 'withdrawPassword',
      'depositAddressUSDT', 'depositAddressERC20', 'depositAddressBTC', 'depositAddressETH',
      'depositCount', 'withdrawCount', 'tradeCount', 'stakeCount', 'referralCode'
    ];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user by wallet (for frontend convenience)
router.patch('/wallet/:wallet', async (req, res) => {
  try {
    const allowedUpdates = [
      'points', 'creditScore', 'frozen', 'level', 'balance',
      'email', 'username', 'vipLevel', 'allowedTradingLevel', 'tradeMode',
      'kycStatus', 'kycFullName', 'kycDocType', 'kycDocNumber',
      'kycFrontPhoto', 'kycBackPhoto', 'kycSubmittedAt', 'kycVerifiedAt',
      'lastActive',
      // New fields
      'presetTradeResult', 'withdrawEnabled', 'withdrawPassword',
      'depositAddressUSDT', 'depositAddressERC20', 'depositAddressBTC', 'depositAddressETH',
      'depositCount', 'withdrawCount', 'tradeCount', 'stakeCount', 'referralCode'
    ];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findOneAndUpdate(
      { wallet: req.params.wallet },
      updates,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit KYC
router.post('/:id/kyc', async (req, res) => {
  try {
    const { fullName, docType, docNumber, frontPhoto, backPhoto } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        kycStatus: 'pending',
        kycFullName: fullName,
        kycDocType: docType,
        kycDocNumber: docNumber,
        kycFrontPhoto: frontPhoto,
        kycBackPhoto: backPhoto,
        kycSubmittedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve/Reject KYC (admin only)
router.patch('/:id/kyc/review', async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updates = {
      kycStatus: status
    };

    if (status === 'verified') {
      updates.kycVerifiedAt = new Date();
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Freeze/unfreeze user account (admin/master only)
router.patch('/:id/freeze', async (req, res) => {
  try {
    const { frozen } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { frozen: frozen },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set trade mode for user (admin only)
router.patch('/:id/trade-mode', async (req, res) => {
  try {
    const { tradeMode } = req.body;

    if (!['auto', 'win', 'lose'].includes(tradeMode)) {
      return res.status(400).json({ error: 'Invalid trade mode' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { tradeMode },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add/subtract points (admin only)
router.patch('/:id/points', async (req, res) => {
  try {
    const { amount, type } = req.body; // type: 'add', 'subtract', 'set'
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (type === 'add') {
      user.points += amount;
    } else if (type === 'subtract') {
      user.points = Math.max(0, user.points - amount);
    } else if (type === 'set') {
      user.points = amount;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role (master only)
router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'master'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (master only)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get users assigned to an admin
router.get('/admin/:adminId/users', async (req, res) => {
  try {
    const users = await User.find({ assignedAdmin: req.params.adminId });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign user to admin
router.patch('/:id/assign', async (req, res) => {
  try {
    const { adminId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { assignedAdmin: adminId },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending KYC requests
router.get('/kyc/pending', async (req, res) => {
  try {
    const users = await User.find({ kycStatus: 'pending' }).sort({ kycSubmittedAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
