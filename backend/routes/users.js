const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get all users (admin/master only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update user by wallet
router.post('/', async (req, res) => {
  try {
    const { wallet } = req.body;
    let user = await User.findOne({ wallet });
    if (!user) {
      user = new User({ wallet });
      await user.save();
    }
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user points, role, etc. (admin/master only)
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
