// Real-time Chat using Backend API
// DEPRECATED: This file is no longer used
// Firebase is now the primary and only backend

const API_BASE = import.meta.env.VITE_API_BASE || '';

// Helper for API calls
async function chatApiCall(endpoint, options = {}) {
  const url = `${API_BASE}/chat${endpoint}`;
  const token = localStorage.getItem('adminToken');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    return data;
  } catch (error) {
    console.error(`Chat API Error [${endpoint}]:`, error);
    throw error;
  }
}

let isFirebaseAvailable = true; // Now using backend API
let pollingIntervals = new Map();

// ==========================================
// CHAT MESSAGES FUNCTIONS
// ==========================================

// Save a new chat message
export const saveChatMessage = async (message) => {
  try {
    const result = await chatApiCall('/messages', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: message.sessionId,
        message: message.message || message.text,
        senderName: message.username || message.senderName || 'User',
        senderWallet: message.wallet || message.senderWallet
      })
    });
    return result.message?._id || result.message?.id || Date.now();
  } catch (error) {
    console.error('Save message error:', error);
    // Fallback to localStorage
    const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]');
    const newMsg = { ...message, id: Date.now(), createdAt: Date.now() };
    logs.push(newMsg);
    localStorage.setItem('customerChatLogs', JSON.stringify(logs));
    window.dispatchEvent(new Event('storage'));
    return newMsg.id;
  }
};

// Subscribe to chat messages (polling-based for backend)
export const subscribeToChatMessages = (callback) => {
  let lastTimestamp = 0;

  const fetchMessages = async () => {
    try {
      // Get all recent messages
      const messages = await chatApiCall(`/admin/messages?since=${lastTimestamp}`);
      if (Array.isArray(messages) && messages.length > 0) {
        // Update last timestamp
        const newest = messages.reduce((max, m) => {
          const t = new Date(m.createdAt).getTime();
          return t > max ? t : max;
        }, lastTimestamp);
        lastTimestamp = newest;

        // Convert to expected format
        const formattedMessages = messages.map(m => ({
          id: m._id,
          sessionId: m.sessionId,
          sender: m.sender,
          text: m.message,
          message: m.message,
          username: m.senderName,
          wallet: m.senderWallet,
          adminName: m.adminName,
          createdAt: new Date(m.createdAt).getTime(),
          timestamp: new Date(m.createdAt).getTime()
        }));

        callback(formattedMessages);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
      // Fallback to localStorage
      const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]');
      callback(logs);
    }
  };

  fetchMessages();
  const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds
  pollingIntervals.set('messages', interval);

  return () => {
    clearInterval(interval);
    pollingIntervals.delete('messages');
  };
};

// ==========================================
// ACTIVE CHATS FUNCTIONS
// ==========================================

// Save or update active chat
export const saveActiveChat = async (chat) => {
  try {
    const result = await chatApiCall('/session', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: chat.sessionId,
        username: chat.username,
        wallet: chat.wallet,
        userId: chat.userId,
        metadata: chat.metadata
      })
    });
    return result.chat?.sessionId || chat.sessionId;
  } catch (error) {
    console.error('Save active chat error:', error);
    // Fallback to localStorage
    const chats = JSON.parse(localStorage.getItem('activeChats') || '[]');
    const existingIndex = chats.findIndex(c => c.sessionId === chat.sessionId);
    if (existingIndex >= 0) {
      chats[existingIndex] = { ...chats[existingIndex], ...chat };
    } else {
      chats.push(chat);
    }
    localStorage.setItem('activeChats', JSON.stringify(chats));
    window.dispatchEvent(new Event('storage'));
    return chat.sessionId;
  }
};

// Update active chat partially
export const updateActiveChat = async (sessionId, updates) => {
  try {
    await chatApiCall(`/admin/chat/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  } catch (error) {
    console.error('Update active chat error:', error);
    // Fallback to localStorage
    const chats = JSON.parse(localStorage.getItem('activeChats') || '[]');
    const chat = chats.find(c => c.sessionId === sessionId);
    if (chat) {
      Object.assign(chat, updates);
      localStorage.setItem('activeChats', JSON.stringify(chats));
      window.dispatchEvent(new Event('storage'));
    }
  }
};

// Subscribe to active chats (for admin dashboard)
export const subscribeToActiveChats = (callback) => {
  const fetchChats = async () => {
    try {
      const chats = await chatApiCall('/admin/chats');
      if (Array.isArray(chats)) {
        const formattedChats = chats.map(c => ({
          sessionId: c.sessionId,
          username: c.username,
          wallet: c.wallet,
          userId: c.userId,
          status: c.status,
          lastMessage: c.lastMessage,
          lastMessageTime: c.lastMessageTime,
          unreadCount: c.unreadCount,
          assignedAdmin: c.assignedAdmin,
          assignedAdminName: c.assignedAdminName,
          priority: c.priority,
          updatedAt: c.updatedAt,
          createdAt: c.createdAt
        }));
        callback(formattedChats);
      }
    } catch (error) {
      console.error('Fetch active chats error:', error);
      // Fallback to localStorage
      const chats = JSON.parse(localStorage.getItem('activeChats') || '[]');
      callback(chats);
    }
  };

  fetchChats();
  const interval = setInterval(fetchChats, 2000); // Poll every 2 seconds
  pollingIntervals.set('activeChats', interval);

  return () => {
    clearInterval(interval);
    pollingIntervals.delete('activeChats');
  };
};

// ==========================================
// ADMIN REPLIES FUNCTIONS
// ==========================================

// Save admin reply
export const saveAdminReply = async (reply) => {
  try {
    const result = await chatApiCall('/admin/reply', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: reply.sessionId,
        message: reply.message || reply.text
      })
    });
    return result.message?._id || result.message?.id || Date.now();
  } catch (error) {
    console.error('Save admin reply error:', error);
    // Fallback to localStorage
    const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]');
    const newReply = { ...reply, id: Date.now(), createdAt: Date.now() };
    replies.push(newReply);
    localStorage.setItem('adminChatReplies', JSON.stringify(replies));
    window.dispatchEvent(new Event('storage'));
    return newReply.id;
  }
};

// Subscribe to admin replies for a specific session (user-side polling)
export const subscribeToAdminReplies = (sessionId, callback) => {
  let lastTimestamp = 0;

  const fetchReplies = async () => {
    try {
      const messages = await chatApiCall(`/poll/${sessionId}?since=${lastTimestamp}`);
      if (Array.isArray(messages) && messages.length > 0) {
        // Update last timestamp
        const newest = messages.reduce((max, m) => {
          const t = new Date(m.createdAt).getTime();
          return t > max ? t : max;
        }, lastTimestamp);
        lastTimestamp = newest;

        const formattedReplies = messages.map(m => ({
          id: m._id,
          sessionId: m.sessionId,
          message: m.message,
          text: m.message,
          adminName: m.adminName,
          createdAt: new Date(m.createdAt).getTime(),
          delivered: m.delivered
        }));

        callback(formattedReplies);
      }
    } catch (error) {
      console.error('Fetch admin replies error:', error);
      // Fallback to localStorage
      const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]');
      const sessionReplies = replies.filter(r => r.sessionId === sessionId && !r.delivered);
      callback(sessionReplies);
    }
  };

  fetchReplies();
  const intervalKey = `replies_${sessionId}`;
  const interval = setInterval(fetchReplies, 2000); // Poll every 2 seconds
  pollingIntervals.set(intervalKey, interval);

  return () => {
    clearInterval(interval);
    pollingIntervals.delete(intervalKey);
  };
};

// Mark reply as delivered
export const markReplyDelivered = async (replyId, firebaseKey) => {
  // With backend, messages are tracked by read status
  // This is handled server-side when admin marks as read
  const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]');
  const reply = replies.find(r => r.id === replyId);
  if (reply) {
    reply.delivered = true;
    localStorage.setItem('adminChatReplies', JSON.stringify(replies));
  }
};

// Get all admin replies (for admin dashboard)
export const subscribeToAllAdminReplies = (callback) => {
  const fetchReplies = async () => {
    try {
      const messages = await chatApiCall('/admin/messages');
      if (Array.isArray(messages)) {
        const adminReplies = messages
          .filter(m => m.sender === 'admin')
          .map(m => ({
            id: m._id,
            sessionId: m.sessionId,
            message: m.message,
            text: m.message,
            adminName: m.adminName,
            adminId: m.adminId,
            createdAt: new Date(m.createdAt).getTime(),
            delivered: m.delivered
          }));
        callback(adminReplies);
      }
    } catch (error) {
      console.error('Fetch all admin replies error:', error);
      const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]');
      callback(replies);
    }
  };

  fetchReplies();
  const interval = setInterval(fetchReplies, 3000);
  pollingIntervals.set('allReplies', interval);

  return () => {
    clearInterval(interval);
    pollingIntervals.delete('allReplies');
  };
};

// Check if Firebase/Backend is available
export const isFirebaseEnabled = () => isFirebaseAvailable;

// Clean up all polling intervals
export const cleanupChatPolling = () => {
  pollingIntervals.forEach((interval) => clearInterval(interval));
  pollingIntervals.clear();
};

// Export for compatibility (no longer using Firebase directly)
export const database = null;
export const ref = () => null;
export const push = () => null;
export const onValue = () => () => {};
export const set = () => Promise.resolve();
export const get = () => Promise.resolve({ val: () => null });
export const update = () => Promise.resolve();
export const remove = () => Promise.resolve();
