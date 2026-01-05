// Firebase Configuration for Real-time Chat Sync
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, onValue, set, get, update, remove } from 'firebase/database'

// Firebase configuration - Using a demo project for OnchainWeb
// In production, replace with your own Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyForOnchainWeb2024",
  authDomain: "onchainweb-chat.firebaseapp.com",
  databaseURL: "https://onchainweb-chat-default-rtdb.firebaseio.com",
  projectId: "onchainweb-chat",
  storageBucket: "onchainweb-chat.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789"
}

let app = null
let database = null
let isFirebaseAvailable = false

// Initialize Firebase with error handling
try {
  app = initializeApp(firebaseConfig)
  database = getDatabase(app)
  isFirebaseAvailable = true
  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.warn('⚠️ Firebase initialization failed, falling back to localStorage:', error.message)
  isFirebaseAvailable = false
}

// ==========================================
// CHAT LOGS FUNCTIONS
// ==========================================

// Save a new chat message
export const saveChatMessage = async (message) => {
  if (!isFirebaseAvailable) {
    // Fallback to localStorage
    const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]')
    logs.push({ ...message, id: Date.now() })
    localStorage.setItem('customerChatLogs', JSON.stringify(logs))
    window.dispatchEvent(new Event('storage'))
    return message.id || Date.now()
  }

  try {
    const messagesRef = ref(database, 'chatMessages')
    const newMessageRef = push(messagesRef)
    await set(newMessageRef, {
      ...message,
      id: newMessageRef.key,
      createdAt: Date.now()
    })
    return newMessageRef.key
  } catch (error) {
    console.error('Firebase save error:', error)
    // Fallback to localStorage
    const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]')
    logs.push({ ...message, id: Date.now() })
    localStorage.setItem('customerChatLogs', JSON.stringify(logs))
    return message.id || Date.now()
  }
}

// Subscribe to chat messages (real-time)
export const subscribeToChatMessages = (callback) => {
  if (!isFirebaseAvailable) {
    // Fallback to localStorage polling
    const checkMessages = () => {
      const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]')
      callback(logs)
    }
    checkMessages()
    const interval = setInterval(checkMessages, 500)
    return () => clearInterval(interval)
  }

  try {
    const messagesRef = ref(database, 'chatMessages')
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      const messages = data ? Object.values(data).sort((a, b) => a.createdAt - b.createdAt) : []
      callback(messages)
    })
    return unsubscribe
  } catch (error) {
    console.error('Firebase subscribe error:', error)
    // Fallback
    const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]')
    callback(logs)
    return () => {}
  }
}

// ==========================================
// ACTIVE CHATS FUNCTIONS
// ==========================================

// Save or update active chat
export const saveActiveChat = async (chat) => {
  if (!isFirebaseAvailable) {
    const chats = JSON.parse(localStorage.getItem('activeChats') || '[]')
    const existingIndex = chats.findIndex(c => c.sessionId === chat.sessionId)
    if (existingIndex >= 0) {
      chats[existingIndex] = { ...chats[existingIndex], ...chat }
    } else {
      chats.push(chat)
    }
    localStorage.setItem('activeChats', JSON.stringify(chats))
    window.dispatchEvent(new Event('storage'))
    return chat.sessionId
  }

  try {
    const chatRef = ref(database, `activeChats/${chat.sessionId}`)
    await set(chatRef, {
      ...chat,
      updatedAt: Date.now()
    })
    return chat.sessionId
  } catch (error) {
    console.error('Firebase save chat error:', error)
    // Fallback
    const chats = JSON.parse(localStorage.getItem('activeChats') || '[]')
    const existingIndex = chats.findIndex(c => c.sessionId === chat.sessionId)
    if (existingIndex >= 0) {
      chats[existingIndex] = { ...chats[existingIndex], ...chat }
    } else {
      chats.push(chat)
    }
    localStorage.setItem('activeChats', JSON.stringify(chats))
    return chat.sessionId
  }
}

// Update active chat partially
export const updateActiveChat = async (sessionId, updates) => {
  if (!isFirebaseAvailable) {
    const chats = JSON.parse(localStorage.getItem('activeChats') || '[]')
    const chat = chats.find(c => c.sessionId === sessionId)
    if (chat) {
      Object.assign(chat, updates)
      localStorage.setItem('activeChats', JSON.stringify(chats))
      window.dispatchEvent(new Event('storage'))
    }
    return
  }

  try {
    const chatRef = ref(database, `activeChats/${sessionId}`)
    await update(chatRef, {
      ...updates,
      updatedAt: Date.now()
    })
  } catch (error) {
    console.error('Firebase update chat error:', error)
  }
}

// Subscribe to active chats (real-time)
export const subscribeToActiveChats = (callback) => {
  if (!isFirebaseAvailable) {
    const checkChats = () => {
      const chats = JSON.parse(localStorage.getItem('activeChats') || '[]')
      callback(chats)
    }
    checkChats()
    const interval = setInterval(checkChats, 500)
    return () => clearInterval(interval)
  }

  try {
    const chatsRef = ref(database, 'activeChats')
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val()
      const chats = data ? Object.values(data) : []
      callback(chats)
    })
    return unsubscribe
  } catch (error) {
    console.error('Firebase subscribe chats error:', error)
    const chats = JSON.parse(localStorage.getItem('activeChats') || '[]')
    callback(chats)
    return () => {}
  }
}

// ==========================================
// ADMIN REPLIES FUNCTIONS
// ==========================================

// Save admin reply
export const saveAdminReply = async (reply) => {
  if (!isFirebaseAvailable) {
    const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]')
    replies.push({ ...reply, id: Date.now() })
    localStorage.setItem('adminChatReplies', JSON.stringify(replies))
    window.dispatchEvent(new Event('storage'))
    return reply.id || Date.now()
  }

  try {
    const repliesRef = ref(database, 'adminReplies')
    const newReplyRef = push(repliesRef)
    await set(newReplyRef, {
      ...reply,
      id: newReplyRef.key,
      createdAt: Date.now()
    })
    return newReplyRef.key
  } catch (error) {
    console.error('Firebase save reply error:', error)
    const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]')
    replies.push({ ...reply, id: Date.now() })
    localStorage.setItem('adminChatReplies', JSON.stringify(replies))
    return reply.id || Date.now()
  }
}

// Subscribe to admin replies for a specific session
export const subscribeToAdminReplies = (sessionId, callback) => {
  if (!isFirebaseAvailable) {
    const checkReplies = () => {
      const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]')
      const sessionReplies = replies.filter(r => r.sessionId === sessionId && !r.delivered)
      callback(sessionReplies)
    }
    checkReplies()
    const interval = setInterval(checkReplies, 500)
    return () => clearInterval(interval)
  }

  try {
    const repliesRef = ref(database, 'adminReplies')
    const unsubscribe = onValue(repliesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const replies = Object.entries(data)
          .map(([key, value]) => ({ ...value, firebaseKey: key }))
          .filter(r => r.sessionId === sessionId && !r.delivered)
        callback(replies)
      } else {
        callback([])
      }
    })
    return unsubscribe
  } catch (error) {
    console.error('Firebase subscribe replies error:', error)
    return () => {}
  }
}

// Mark reply as delivered
export const markReplyDelivered = async (replyId, firebaseKey) => {
  if (!isFirebaseAvailable) {
    const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]')
    const reply = replies.find(r => r.id === replyId)
    if (reply) {
      reply.delivered = true
      localStorage.setItem('adminChatReplies', JSON.stringify(replies))
    }
    return
  }

  try {
    const replyRef = ref(database, `adminReplies/${firebaseKey}`)
    await update(replyRef, { delivered: true })
  } catch (error) {
    console.error('Firebase mark delivered error:', error)
  }
}

// Get all admin replies (for admin dashboard)
export const subscribeToAllAdminReplies = (callback) => {
  if (!isFirebaseAvailable) {
    const checkReplies = () => {
      const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]')
      callback(replies)
    }
    checkReplies()
    const interval = setInterval(checkReplies, 500)
    return () => clearInterval(interval)
  }

  try {
    const repliesRef = ref(database, 'adminReplies')
    const unsubscribe = onValue(repliesRef, (snapshot) => {
      const data = snapshot.val()
      const replies = data ? Object.values(data) : []
      callback(replies)
    })
    return unsubscribe
  } catch (error) {
    console.error('Firebase subscribe all replies error:', error)
    return () => {}
  }
}

// Check if Firebase is available
export const isFirebaseEnabled = () => isFirebaseAvailable

// Export database reference for advanced usage
export { database, ref, push, onValue, set, get, update, remove }
