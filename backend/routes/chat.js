const express = require('express');const express = require('express');

















































































































































































































































































































































module.exports = router;});  }    res.status(500).json({ error: 'Failed to close chat' });    console.error('Close chat error:', error);  } catch (error) {    res.json({ success: true });        await systemMessage.save();    });      message: 'Chat closed by support'      sender: 'system',      sessionId,    const systemMessage = new ChatMessage({    // Add system message        );      { $set: { status: 'closed' } }      { sessionId },    await ActiveChat.findOneAndUpdate(        const { sessionId } = req.params;  try {router.post('/admin/close/:sessionId', authenticateToken, async (req, res) => {// Close chat});  }    res.status(500).json({ error: 'Failed to get unread count' });    console.error('Get unread error:', error);  } catch (error) {    res.json({ unreadCount: count[0]?.total || 0 });        ]);      { $group: { _id: null, total: { $sum: '$unreadCount' } } }      { $match: { status: { $in: ['active', 'waiting'] } } },    const count = await ActiveChat.aggregate([  try {router.get('/admin/unread', authenticateToken, async (req, res) => {// Get unread count for admin});  }    res.status(500).json({ error: 'Failed to mark as read' });    console.error('Mark read error:', error);  } catch (error) {    res.json({ success: true });        );      { $set: { unreadCount: 0 } }      { sessionId },    await ActiveChat.findOneAndUpdate(        );      { $set: { read: true } }      { sessionId, sender: 'user', read: false },    await ChatMessage.updateMany(        const { sessionId } = req.params;  try {router.patch('/admin/read/:sessionId', authenticateToken, async (req, res) => {// Mark messages as read});  }    res.status(500).json({ error: 'Failed to update chat' });    console.error('Update chat error:', error);  } catch (error) {    res.json({ success: true, chat });        }      return res.status(404).json({ error: 'Chat not found' });    if (!chat) {        );      { new: true }      { $set: update },      { sessionId },    const chat = await ActiveChat.findOneAndUpdate(        if (assignedAdminName) update.assignedAdminName = assignedAdminName;    if (assignedAdmin) update.assignedAdmin = assignedAdmin;    if (priority) update.priority = priority;    if (status) update.status = status;    const update = {};        const { status, priority, assignedAdmin, assignedAdminName } = req.body;    const { sessionId } = req.params;  try {router.patch('/admin/chat/:sessionId', authenticateToken, async (req, res) => {// Update chat status});  }    res.status(500).json({ error: 'Failed to send reply' });    console.error('Admin reply error:', error);  } catch (error) {    res.json({ success: true, message: chatMessage });        );      }        }          unreadCount: 0          status: 'active',          assignedAdminName: adminName,          assignedAdmin: adminId,          lastMessageTime: new Date(),          lastMessage: message,        $set: {      {      { sessionId },    await ActiveChat.findOneAndUpdate(    // Update active chat        await chatMessage.save();    });      message      adminName,      adminId,      sender: 'admin',      sessionId,    const chatMessage = new ChatMessage({    // Create admin message        }      return res.status(400).json({ error: 'sessionId and message are required' });    if (!sessionId || !message) {        const adminId = req.user.adminId;    const adminName = req.user.username;    const { sessionId, message } = req.body;  try {router.post('/admin/reply', authenticateToken, async (req, res) => {// Admin send reply});  }    res.status(500).json({ error: 'Failed to get messages' });    console.error('Get admin messages error:', error);  } catch (error) {    res.json(messages);          .limit(200);      .sort({ createdAt: -1 })    const messages = await ChatMessage.find(query)        }      query.createdAt = { $gt: new Date(parseInt(since)) };    if (since) {    }      query.sessionId = sessionId;    if (sessionId) {    let query = {};        const { sessionId, since } = req.query;  try {router.get('/admin/messages', authenticateToken, async (req, res) => {// Get messages for admin (all sessions or specific)});  }    res.status(500).json({ error: 'Failed to get chats' });    console.error('Get admin chats error:', error);  } catch (error) {    res.json(chats);          .limit(100);      .sort({ lastMessageTime: -1 })    const chats = await ActiveChat.find(query)        }      query.status = { $in: ['active', 'waiting'] };    } else {      query.status = status;    if (status) {    let query = {};        const { status } = req.query;  try {router.get('/admin/chats', authenticateToken, async (req, res) => {// Get all active chats (admin)// ============== ADMIN ENDPOINTS ==============});  }    res.status(500).json({ error: 'Failed to poll messages' });    console.error('Poll error:', error);  } catch (error) {    res.json(messages);          .limit(50);      .sort({ createdAt: 1 })    const messages = await ChatMessage.find(query)        }      query.createdAt = { $gt: new Date(parseInt(since)) };    if (since) {        };      sender: 'admin'      sessionId,    const query = {    // Get admin replies since timestamp        const { since } = req.query;    const { sessionId } = req.params;  try {router.get('/poll/:sessionId', async (req, res) => {// Poll for new messages (long polling alternative)});  }    res.status(500).json({ error: 'Failed to create session' });    console.error('Create session error:', error);  } catch (error) {    res.json({ success: true, chat });        );      { upsert: true, new: true }      },        }          status: 'active'          sessionId,        $setOnInsert: {        },          lastMessageTime: new Date()          metadata,          userId,          wallet,          username: username || 'User',        $set: {      {      { sessionId },    const chat = await ActiveChat.findOneAndUpdate(        }      return res.status(400).json({ error: 'sessionId is required' });    if (!sessionId) {        const { sessionId, username, wallet, userId, metadata } = req.body;  try {router.post('/session', async (req, res) => {// Create or update chat session});  }    res.status(500).json({ error: 'Failed to get session' });    console.error('Get session error:', error);  } catch (error) {    res.json({ exists: true, chat });        }      return res.json({ exists: false });    if (!chat) {        const chat = await ActiveChat.findOne({ sessionId });    const { sessionId } = req.params;  try {router.get('/session/:sessionId', async (req, res) => {// Get chat session info});  }    res.status(500).json({ error: 'Failed to send message' });    console.error('Send message error:', error);  } catch (error) {    res.json({ success: true, message: chatMessage });        );      { upsert: true, new: true }      },        }          status: 'active'          sessionId,        $setOnInsert: {        $inc: { unreadCount: 1 },        },          wallet: senderWallet          username: senderName || 'User',          lastMessageTime: new Date(),          lastMessage: message,        $set: {      {      { sessionId },    await ActiveChat.findOneAndUpdate(    // Update or create active chat        await chatMessage.save();    });      message      senderWallet,      senderName: senderName || 'User',      sender: 'user',      sessionId,    const chatMessage = new ChatMessage({    // Create message        }      return res.status(400).json({ error: 'sessionId and message are required' });    if (!sessionId || !message) {        const { sessionId, message, senderName, senderWallet } = req.body;  try {router.post('/messages', async (req, res) => {// Send a message (user)});  }    res.status(500).json({ error: 'Failed to get messages' });    console.error('Get messages error:', error);  } catch (error) {    res.json(messages);          .limit(100);      .sort({ createdAt: 1 })    const messages = await ChatMessage.find(query)        }      query.createdAt = { $gt: new Date(parseInt(since)) };    if (since) {    let query = { sessionId };        const { since } = req.query; // Optional: get messages since timestamp    const { sessionId } = req.params;  try {router.get('/messages/:sessionId', async (req, res) => {// Get messages for a session (user can access their own session)// ============== PUBLIC ENDPOINTS (for users) ==============const { authenticateToken, requireAdmin, requireMaster } = require('./auth');const ActiveChat = require('../models/ActiveChat');const ChatMessage = require('../models/ChatMessage');const router = express.Router();const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const { authenticateAdmin } = require('./auth');

// Get all active chat sessions (admin/master only)
router.get('/sessions', authenticateAdmin, async (req, res) => {
  try {
    // Get distinct session IDs with their latest message
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
    res.json(sessions);
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Failed to get chat sessions' });
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

// Send a new message (user or admin)
router.post('/messages', async (req, res) => {
  try {
    const { sessionId, sender, senderName, senderWallet, message, adminId, adminName } = req.body;
    
    if (!sessionId || !sender || !message) {
      return res.status(400).json({ error: 'sessionId, sender, and message are required' });
    }
    
    const chatMessage = new ChatMessage({
      sessionId,
      sender,
      senderName: senderName || (sender === 'user' ? 'User' : 'Support'),
      senderWallet,
      message,
      adminId,
      adminName,
      delivered: true,
      read: sender === 'admin'
    });
    
    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
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

// Get new messages since timestamp (polling endpoint)
router.get('/messages/:sessionId/new', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { since } = req.query;
    
    const query = { sessionId };
    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }
    
    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .lean();
    
    res.json(messages);
  } catch (error) {
    console.error('Get new messages error:', error);
    res.status(500).json({ error: 'Failed to get new messages' });
  }
});

// Delete chat session (admin only)
router.delete('/sessions/:sessionId', authenticateAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Only master can delete
    if (req.admin.role !== 'master') {
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
