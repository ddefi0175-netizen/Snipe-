const express = require('express');
const Upload = require('../models/Upload');
const User = require('../models/User');
const Notification = require('../models/Notification');
const router = express.Router();

// Get uploads by userId (admin/master can filter by user)
router.get('/', async (req, res) => {
  try {
    const { userId, status } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    const uploads = await Upload.find(filter).sort({ createdAt: -1 });
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending uploads count (for admin dashboard)
router.get('/pending/count', async (req, res) => {
  try {
    const count = await Upload.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create upload (user uploads screenshot)
router.post('/', async (req, res) => {
  try {
    const { userId, imageUrl, amount, network, txHash } = req.body;
    const upload = new Upload({ 
      userId, 
      imageUrl, 
      amount: amount || 0,
      network: network || '',
      txHash: txHash || '',
      status: 'pending'
    });
    await upload.save();
    res.status(201).json(upload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update upload status (admin/master) - approve/reject
router.patch('/:id', async (req, res) => {
  try {
    const { status, amount, adminNote } = req.body;
    const upload = await Upload.findById(req.params.id);
    
    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }
    
    upload.status = status || upload.status;
    if (amount !== undefined) upload.amount = amount;
    if (adminNote) upload.adminNote = adminNote;
    upload.reviewedAt = new Date();
    
    await upload.save();
    
    // If approved, update user balance and send notification
    if (status === 'approved' && upload.amount > 0) {
      await User.findOneAndUpdate(
        { wallet: upload.userId },
        { $inc: { balance: upload.amount } }
      );
      
      // Create notification for user
      const notification = new Notification({
        userId: upload.userId,
        message: `Your deposit of $${upload.amount} has been approved!`,
        type: 'deposit_approved'
      });
      await notification.save();
    }
    
    // If rejected, send notification
    if (status === 'rejected') {
      const notification = new Notification({
        userId: upload.userId,
        message: `Your deposit was rejected. ${adminNote || 'Please contact support.'}`,
        type: 'deposit_rejected'
      });
      await notification.save();
    }
    
    res.json(upload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete upload
router.delete('/:id', async (req, res) => {
  try {
    const upload = await Upload.findByIdAndDelete(req.params.id);
    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }
    res.json({ message: 'Upload deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
