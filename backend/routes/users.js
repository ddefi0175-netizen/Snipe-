const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get all users (admin/master only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const { wallet, username, email } = req.body;
    let user = await User.findOne({ wallet });
    
    if (user) {
      // Update last login
      user.lastLogin = new Date();
      user.lastActive = new Date();
      if (username) user.username = username;
      if (email) user.email = email;
      await user.save();
    } else {
      // Create new user
      user = new User({ 
        wallet,
        username: username || '',
        email: email || '',
        role: 'user',
        points: 0,
        creditScore: 100,
        level: 1,
        vipLevel: 1,
        allowedTradingLevel: 1,
        frozen: false,
        balance: 0
      });
      await user.save();
    }
    
    res.status(201).json(user);
  } catch (err) {
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
      'assignedAdmin', 'lastActive'
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
      'lastActive'
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
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
