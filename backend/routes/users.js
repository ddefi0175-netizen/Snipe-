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

// Create or update user by wallet
router.post('/', async (req, res) => {
  try {
    const { wallet, role, points, creditScore, level, frozen, balance } = req.body;
    let user = await User.findOne({ wallet });
    if (!user) {
      user = new User({ 
        wallet, 
        role: role || 'user',
        points: points || 0,
        creditScore: creditScore || 100,
        level: level || 1,
        frozen: frozen || false,
        balance: balance || 0
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
    const allowedUpdates = ['role', 'points', 'creditScore', 'frozen', 'level', 'balance', 'email', 'username'];
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
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
