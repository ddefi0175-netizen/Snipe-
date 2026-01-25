// Cloudflare D1 API Client - Replaces Firebase
// Handles chat messages with Server-Sent Events for real-time updates

const API_BASE = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'https://snipe-chat-api.YOUR-SUBDOMAIN.workers.dev';

// ==========================================
// CHAT MESSAGE FUNCTIONS
// ==========================================

/**
 * Send a new chat message
 */
export const sendChatMessage = async (message) => {
  try {
    const response = await fetch(`${API_BASE}/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: message.sessionId,
        message: message.message || message.text,
        senderName: message.username || message.senderName || 'User',
        senderWallet: message.wallet || message.senderWallet || '',
        senderType: message.sender || 'user',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    return data.messageId;
  } catch (error) {
    console.error('Send message error:', error);
    // Fallback to localStorage
    const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]');
    const newMsg = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    logs.push(newMsg);
    localStorage.setItem('customerChatLogs', JSON.stringify(logs));
    window.dispatchEvent(new Event('storage'));
    return newMsg.id;
  }
};

/**
 * Get chat messages for a session
 */
export const getChatMessages = async (sessionId, limit = 50) => {
  try {
    const response = await fetch(`${API_BASE}/api/chat/messages?sessionId=${sessionId}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.statusText}`);
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Get messages error:', error);
    // Fallback to localStorage
    const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]');
    return logs.filter(msg => msg.sessionId === sessionId);
  }
};

/**
 * Subscribe to real-time chat updates using Server-Sent Events
 */
export const subscribeToChatMessages = (sessionId, callback) => {
  try {
    const eventSource = new EventSource(`${API_BASE}/api/chat/stream?sessionId=${sessionId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.messages && data.messages.length > 0) {
          callback(data.messages);
        }
      } catch (error) {
        console.error('SSE parse error:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      // Fallback to polling
      const pollInterval = setInterval(() => {
        getChatMessages(sessionId).then(messages => {
          callback(messages);
        }).catch(console.error);
      }, 5000);
      
      return () => {
        clearInterval(pollInterval);
      };
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  } catch (error) {
    console.error('Subscribe error:', error);
    // Fallback to localStorage listener
    const handleStorage = () => {
      const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]');
      const messages = logs.filter(msg => msg.sessionId === sessionId);
      callback(messages);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }
};

/**
 * Send admin reply to a chat
 */
export const sendAdminReply = async (sessionId, message, adminName = 'Support') => {
  try {
    const response = await fetch(`${API_BASE}/api/chat/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        message,
        adminName,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send admin reply: ${response.statusText}`);
    }

    const data = await response.json();
    return data.messageId;
  } catch (error) {
    console.error('Send admin reply error:', error);
    throw error;
  }
};

/**
 * Get all active chats (for admin dashboard)
 */
export const getActiveChats = async (status = 'active', limit = 100) => {
  try {
    const response = await fetch(`${API_BASE}/api/chat/active?status=${status}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get active chats: ${response.statusText}`);
    }

    const data = await response.json();
    return data.chats || [];
  } catch (error) {
    console.error('Get active chats error:', error);
    return [];
  }
};

/**
 * Subscribe to admin chat updates (polls for new chats)
 */
export const subscribeToActiveChats = (callback, interval = 5000) => {
  let pollInterval;
  
  const poll = async () => {
    try {
      const chats = await getActiveChats();
      callback(chats);
    } catch (error) {
      console.error('Poll active chats error:', error);
    }
  };

  // Initial fetch
  poll();

  // Start polling
  pollInterval = setInterval(poll, interval);

  // Return cleanup function
  return () => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  };
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Check if Cloudflare API is available
 */
export const isCloudflareApiAvailable = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/chat/active?limit=1`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Export for compatibility
export { isCloudflareApiAvailable as isFirebaseEnabled };
