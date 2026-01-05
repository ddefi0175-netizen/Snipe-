const express = require('express');
const Upload = require('../models/Upload');
const router = express.Router();

// Get uploads by userId (admin/master can filter by user)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const uploads = await Upload.find(filter).sort({ createdAt: -1 });
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create upload (user uploads screenshot)
router.post('/', async (req, res) => {
  try {
    const { userId, imageUrl } = req.body;
    const upload = new Upload({ userId, imageUrl });
    await upload.save();
    res.status(201).json(upload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update upload status (admin/master)
router.patch('/:id', async (req, res) => {
  try {
    const upload = await Upload.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(upload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
