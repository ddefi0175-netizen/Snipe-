// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, addDoc, onSnapshot, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let db;
let auth;
let isFirebaseAvailable = false;

try {
  // Only initialize if we have required config
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseAvailable = true;
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase config incomplete. Some features may use fallback storage.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  isFirebaseAvailable = false;
}

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

export const firebaseSignIn = async (email, password) => {
  if (!isFirebaseAvailable) throw new Error('Firebase not available');
  return signInWithEmailAndPassword(auth, email, password);
};

export const firebaseSignUp = async (email, password) => {
  if (!isFirebaseAvailable) throw new Error('Firebase not available');
  return createUserWithEmailAndPassword(auth, email, password);
};

export const firebaseSignOut = async () => {
  if (!isFirebaseAvailable) throw new Error('Firebase not available');
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  if (!isFirebaseAvailable) return () => {};
  return onAuthStateChanged(auth, callback);
};

// ==========================================
// CHAT MESSAGES FUNCTIONS
// ==========================================

export const saveChatMessage = async (message) => {
  if (!isFirebaseAvailable) {
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

  try {
    const docRef = await addDoc(collection(db, 'chatMessages'), {
      sessionId: message.sessionId,
      message: message.message || message.text,
      senderName: message.username || message.senderName || 'User',
      senderWallet: message.wallet || message.senderWallet,
      sender: message.sender || 'user',
      createdAt: serverTimestamp(),
      delivered: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Save message error:', error);
    throw error;
  }
};

export const subscribeToChatMessages = (callback) => {
  if (!isFirebaseAvailable) {
    // Fallback to localStorage
    const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]');
    callback(logs);
    return () => {};
  }

  const q = query(
    collection(db, 'chatMessages'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      timestamp: doc.data().createdAt?.toMillis() || Date.now()
    }));
    callback(messages);
  }, (error) => {
    console.error('Subscribe to messages error:', error);
    const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]');
    callback(logs);
  });
};

// ==========================================
// ACTIVE CHATS FUNCTIONS
// ==========================================

export const saveActiveChat = async (chat) => {
  if (!isFirebaseAvailable) {
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

  try {
    const chatRef = doc(db, 'activeChats', chat.sessionId);
    await setDoc(chatRef, {
      ...chat,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return chat.sessionId;
  } catch (error) {
    console.error('Save active chat error:', error);
    throw error;
  }
};

export const updateActiveChat = async (sessionId, updates) => {
  if (!isFirebaseAvailable) {
    // Fallback to localStorage
    const chats = JSON.parse(localStorage.getItem('activeChats') || '[]');
    const chat = chats.find(c => c.sessionId === sessionId);
    if (chat) {
      Object.assign(chat, updates);
      localStorage.setItem('activeChats', JSON.stringify(chats));
      window.dispatchEvent(new Event('storage'));
    }
    return;
  }

  try {
    const chatRef = doc(db, 'activeChats', sessionId);
    await updateDoc(chatRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Update active chat error:', error);
    throw error;
  }
};

export const subscribeToActiveChats = (callback) => {
  if (!isFirebaseAvailable) {
    // Fallback to localStorage
    const chats = JSON.parse(localStorage.getItem('activeChats') || '[]');
    callback(chats);
    return () => {};
  }

  const q = query(collection(db, 'activeChats'), orderBy('updatedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      sessionId: doc.id,
      ...doc.data()
    }));
    callback(chats);
  }, (error) => {
    console.error('Subscribe to active chats error:', error);
    const chats = JSON.parse(localStorage.getItem('activeChats') || '[]');
    callback(chats);
  });
};

// ==========================================
// ADMIN REPLIES FUNCTIONS
// ==========================================

export const saveAdminReply = async (reply) => {
  if (!isFirebaseAvailable) {
    // Fallback to localStorage
    const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]');
    const newReply = { 
      ...reply, 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString() 
    };
    replies.push(newReply);
    localStorage.setItem('adminChatReplies', JSON.stringify(replies));
    window.dispatchEvent(new Event('storage'));
    return newReply.id;
  }

  try {
    const docRef = await addDoc(collection(db, 'chatMessages'), {
      sessionId: reply.sessionId,
      message: reply.message || reply.text,
      sender: 'admin',
      adminName: reply.adminName,
      adminId: reply.adminId,
      createdAt: serverTimestamp(),
      delivered: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Save admin reply error:', error);
    throw error;
  }
};

export const subscribeToAdminReplies = (sessionId, callback) => {
  if (!isFirebaseAvailable) {
    // Fallback to localStorage
    const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]');
    const sessionReplies = replies.filter(r => r.sessionId === sessionId);
    callback(sessionReplies);
    return () => {};
  }

  const q = query(
    collection(db, 'chatMessages'),
    where('sessionId', '==', sessionId),
    where('sender', '==', 'admin'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const replies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now()
    }));
    callback(replies);
  }, (error) => {
    console.error('Subscribe to admin replies error:', error);
    const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]');
    callback(replies.filter(r => r.sessionId === sessionId));
  });
};

export const markReplyDelivered = async (replyId) => {
  if (!isFirebaseAvailable) {
    const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]');
    const reply = replies.find(r => r.id === replyId);
    if (reply) {
      reply.delivered = true;
      localStorage.setItem('adminChatReplies', JSON.stringify(replies));
    }
    return;
  }

  try {
    const replyRef = doc(db, 'chatMessages', replyId);
    await updateDoc(replyRef, { delivered: true });
  } catch (error) {
    console.error('Mark reply delivered error:', error);
  }
};

export const subscribeToAllAdminReplies = (callback) => {
  if (!isFirebaseAvailable) {
    const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]');
    callback(replies);
    return () => {};
  }

  const q = query(
    collection(db, 'chatMessages'),
    where('sender', '==', 'admin'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const replies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now()
    }));
    callback(replies);
  }, (error) => {
    console.error('Subscribe to all admin replies error:', error);
    const replies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]');
    callback(replies);
  });
};

// ==========================================
// USER DATA FUNCTIONS
// ==========================================

export const saveUser = async (userData) => {
  if (!isFirebaseAvailable) throw new Error('Firebase not available');
  
  try {
    const userRef = doc(db, 'users', userData.wallet || userData.id);
    await setDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return userData.wallet || userData.id;
  } catch (error) {
    console.error('Save user error:', error);
    throw error;
  }
};

export const getUser = async (walletOrId) => {
  if (!isFirebaseAvailable) throw new Error('Firebase not available');
  
  try {
    const userRef = doc(db, 'users', walletOrId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

export const subscribeToUsers = (callback) => {
  if (!isFirebaseAvailable) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'users'));

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(users);
  }, (error) => {
    console.error('Subscribe to users error:', error);
    callback([]);
  });
};

// ==========================================
// USER DATA FUNCTIONS (For Admin Dashboards)
// ==========================================

export const subscribeToUsers = (callback) => {
  if (!isFirebaseAvailable) {
    console.warn('Firebase not available, using localStorage fallback');
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    callback(users);
    return () => {};
  }

  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt || Date.now()
    }));
    callback(users);
  }, (error) => {
    console.error('Subscribe to users error:', error);
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    callback(users);
  });
};

export const subscribeToDeposits = (callback) => {
  if (!isFirebaseAvailable) {
    console.warn('Firebase not available, using localStorage fallback');
    const deposits = JSON.parse(localStorage.getItem('adminDeposits') || '[]');
    callback(deposits);
    return () => {};
  }

  const q = query(
    collection(db, 'deposits'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const deposits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt || Date.now()
    }));
    callback(deposits);
  }, (error) => {
    console.error('Subscribe to deposits error:', error);
    const deposits = JSON.parse(localStorage.getItem('adminDeposits') || '[]');
    callback(deposits);
  });
};

export const subscribeToWithdrawals = (callback) => {
  if (!isFirebaseAvailable) {
    console.warn('Firebase not available, using localStorage fallback');
    const withdrawals = JSON.parse(localStorage.getItem('adminWithdrawals') || '[]');
    callback(withdrawals);
    return () => {};
  }

  const q = query(
    collection(db, 'withdrawals'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const withdrawals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt || Date.now()
    }));
    callback(withdrawals);
  }, (error) => {
    console.error('Subscribe to withdrawals error:', error);
    const withdrawals = JSON.parse(localStorage.getItem('adminWithdrawals') || '[]');
    callback(withdrawals);
  });
};

export const subscribeToTrades = (callback) => {
  if (!isFirebaseAvailable) {
    console.warn('Firebase not available, using localStorage fallback');
    const trades = JSON.parse(localStorage.getItem('tradeHistory') || '[]');
    callback(trades);
    return () => {};
  }

  const q = query(
    collection(db, 'trades'),
    orderBy('timestamp', 'desc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const trades = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis?.() || doc.data().timestamp || Date.now()
    }));
    callback(trades);
  }, (error) => {
    console.error('Subscribe to trades error:', error);
    const trades = JSON.parse(localStorage.getItem('tradeHistory') || '[]');
    callback(trades);
  });
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export const isFirebaseEnabled = () => isFirebaseAvailable;

export const cleanupChatPolling = () => {
  // No polling needed with Firebase real-time listeners
  console.log('Firebase uses real-time listeners, no polling to cleanup');
};

// Export Firebase instances for direct use if needed
export { db, auth };
export const database = db;
