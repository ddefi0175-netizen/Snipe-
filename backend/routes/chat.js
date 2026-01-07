const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const { verifyToken, requireAdmin } = require('./auth');

// Middleware to authenticate admin
const authenticateAdmin = verifyToken;

// Get all active chat sessions (admin/master only)
router.get('/sessions', authenticateAdmin, async (req, res) => {
  try {
    const sessions = await ChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$sessionId',
          lastMessage: { $first: '$message' },
          lastSender: { $first: '$sender' },
          senderName: { $first: '$senderName' },
          senderWallet: { $first: '$senderWallet' },
          lastMessageAt: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$sender', 'user'] }, { $eq: ['$read', false] }] }, 1, 0]
            }
          }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);
    
    // Format for frontend
    const formattedSessions = sessions.map(s => ({
      sessionId: s._id,
      lastMessage: s.lastMessage,
      lastSender: s.lastSender,
      username: s.senderName,
      wallet: s.senderWallet,
      lastMessageTime: s.lastMessageAt,
      unreadCount: s.unreadCount,
      status: 'active'
    }));
    
    res.json(formattedSessions);
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Failed to get chat sessions' });
  }
});

// Alias for sessions - /admin/chats
router.get('/admin/chats', authenticateAdmin, async (req, res) => {
  try {
    const sessions = await ChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$sessionId',
          lastMessage: { $first: '$message' },
          lastSender: { $first: '$sender' },
          senderName: { $first: '$senderName' },
          senderWallet: { $first: '$senderWallet' },
          lastMessageAt: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$sender', 'user'] }, { $eq: ['$read', false] }] }, 1, 0]
            }
          }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);
    
    const formattedSessions = sessions.map(s => ({
      sessionId: s._id,
      lastMessage: s.lastMessage,
      lastSender: s.lastSender,
      username: s.senderName,
      wallet: s.senderWallet,
      lastMessageTime: s.lastMessageAt,
      unreadCount: s.unreadCount,
      status: 'active'
    }));
    
    res.json(formattedSessions);
  } catch (error) {
    console.error('Get admin chats error:', error);
    res.status(500).json({ error: 'Failed to get chat sessions' });
  }
});

// Get all messages for admin dashboard
router.get('/admin/messages', authenticateAdmin, async (req, res) => {
  try {
    const { since } = req.query;
    const query = {};
    if (since) {
      query.createdAt = { $gt: new Date(parseInt(since)) };
    }
    
    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    
    res.json(messages);
  } catch (error) {
    console.error('Get admin messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get messages for a specific session
router.get('/messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, before } = req.query;
    
    const query = { sessionId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Poll for new messages (user side)
router.get('/poll/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { since } = req.query;
    
    const query = { sessionId, sender: 'admin' };
    if (since) {
      query.createdAt = { $gt: new Date(parseInt(since)) };
    }
    
    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .lean();
    
    res.json(messages);
  } catch (error) {
    console.error('Poll messages error:', error);
    res.status(500).json({ error: 'Failed to poll messages' });
  }
});

// Send a new message (user)
router.post('/messages', async (req, res) => {
  try {
    const { sessionId, sender, senderName, senderWallet, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }
    
    const chatMessage = new ChatMessage({
      sessionId,
      sender: sender || 'user',
      senderName: senderName || 'User',
      senderWallet,
      message,
      delivered: true,
      read: false
    });
    
    await chatMessage.save();
    res.status(201).json({ message: chatMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Send admin reply
router.post('/admin/reply', authenticateAdmin, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }
    
    const chatMessage = new ChatMessage({
      sessionId,
      sender: 'admin',
      senderName: req.user.username || 'Support',
      adminId: req.user.adminId || req.user.username,
      adminName: req.user.username,
      message,
      delivered: true,
      read: true
    });
    
    await chatMessage.save();
    res.status(201).json({ message: chatMessage });
  } catch (error) {
    console.error('Send admin reply error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// Mark messages as read
router.patch('/messages/:sessionId/read', authenticateAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await ChatMessage.updateMany(
      { sessionId, sender: 'user', read: false },
      { read: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Delete chat session (master only)
router.delete('/sessions/:sessionId', authenticateAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (req.user.role !== 'master') {
      return res.status(403).json({ error: 'Only master can delete chat sessions' });
    }
    
    await ChatMessage.deleteMany({ sessionId });
    res.json({ success: true, message: 'Chat session deleted' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

module.exports = router;
