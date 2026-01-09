// Firebase Service Layer - Complete Database Operations
import {
  db,
  auth,
  isFirebaseEnabled,
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignOut,
  onAuthChange,
  saveUser,
  getUser,
  subscribeToUsers
} from './firebase.service.js';

import { COLLECTIONS } from '../config/firebase.config.js';

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

// ==========================================
// USERS MANAGEMENT
// ==========================================

export const createUser = async (userData) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  return await saveUser(userData);
};

export const updateUser = async (userId, updates) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  return await getUser(userId);
};

export const getAllUsers = async () => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

// ==========================================
// TRADES MANAGEMENT
// ==========================================

export const createTrade = async (tradeData) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.TRADES), {
      ...tradeData,
      createdAt: serverTimestamp(),
      status: tradeData.status || 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error('Create trade error:', error);
    throw error;
  }
};

export const updateTrade = async (tradeId, updates) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const tradeRef = doc(db, 'trades', tradeId);
    await updateDoc(tradeRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Update trade error:', error);
    throw error;
  }
};

export const getTrade = async (tradeId) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const tradeRef = doc(db, 'trades', tradeId);
    const tradeSnap = await getDoc(tradeRef);
    return tradeSnap.exists() ? { id: tradeSnap.id, ...tradeSnap.data() } : null;
  } catch (error) {
    console.error('Get trade error:', error);
    throw error;
  }
};

export const getUserTrades = async (userId) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const q = query(
      collection(db, COLLECTIONS.TRADES),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const tradesSnapshot = await getDocs(q);
    return tradesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get user trades error:', error);
    throw error;
  }
};

export const subscribeToTrades = (userId, callback) => {
  if (!isFirebaseEnabled()) {
    callback([]);
    return () => {};
  }

  const q = userId
    ? query(collection(db, COLLECTIONS.TRADES), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(collection(db, COLLECTIONS.TRADES), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const trades = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(trades);
  }, (error) => {
    console.error('Subscribe to trades error:', error);
    callback([]);
  });
};

// ==========================================
// DEPOSITS & WITHDRAWALS
// ==========================================

export const createDeposit = async (depositData) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.DEPOSITS), {
      ...depositData,
      createdAt: serverTimestamp(),
      status: depositData.status || 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Create deposit error:', error);
    throw error;
  }
};

export const createWithdrawal = async (withdrawalData) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const docRef = await addDoc(collection(db, 'withdrawals'), {
      ...withdrawalData,
      createdAt: serverTimestamp(),
      status: withdrawalData.status || 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Create withdrawal error:', error);
    throw error;
  }
};

export const updateDeposit = async (depositId, updates) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const depositRef = doc(db, 'deposits', depositId);
    await updateDoc(depositRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Update deposit error:', error);
    throw error;
  }
};

export const updateWithdrawal = async (withdrawalId, updates) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const withdrawalRef = doc(db, COLLECTIONS.WITHDRAWALS, withdrawalId);
    await updateDoc(withdrawalRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Update withdrawal error:', error);
    throw error;
  }
};

export const getUserDeposits = async (userId) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const q = query(
      collection(db, COLLECTIONS.DEPOSITS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const depositsSnapshot = await getDocs(q);
    return depositsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get user deposits error:', error);
    throw error;
  }
};

export const getUserWithdrawals = async (userId) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const q = query(
      collection(db, 'withdrawals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const withdrawalsSnapshot = await getDocs(q);
    return withdrawalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get user withdrawals error:', error);
    throw error;
  }
};

// ==========================================
// ADMIN MANAGEMENT
// ==========================================

export const createAdmin = async (adminData) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const adminRef = doc(db, COLLECTIONS.ADMINS, adminData.username);
    await setDoc(adminRef, {
      ...adminData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return adminData.username;
  } catch (error) {
    console.error('Create admin error:', error);
    throw error;
  }
};

export const updateAdmin = async (adminId, updates) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const adminRef = doc(db, COLLECTIONS.ADMINS, adminId);
    await updateDoc(adminRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Update admin error:', error);
    throw error;
  }
};

export const getAdmin = async (adminId) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const adminRef = doc(db, COLLECTIONS.ADMINS, adminId);
    const adminSnap = await getDoc(adminRef);
    return adminSnap.exists() ? { id: adminSnap.id, ...adminSnap.data() } : null;
  } catch (error) {
    console.error('Get admin error:', error);
    throw error;
  }
};

export const getAllAdmins = async () => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const adminsSnapshot = await getDocs(collection(db, COLLECTIONS.ADMINS));
    return adminsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get all admins error:', error);
    throw error;
  }
};

// ==========================================
// NOTIFICATIONS
// ==========================================

export const createNotification = async (notificationData) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const notificationsSnapshot = await getDocs(q);
    return notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get user notifications error:', error);
    throw error;
  }
};

export const subscribeToNotifications = (userId, callback) => {
  if (!isFirebaseEnabled()) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notifications);
  }, (error) => {
    console.error('Subscribe to notifications error:', error);
    callback([]);
  });
};

// ==========================================
// SETTINGS
// ==========================================

export const getSettings = async () => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'global');
    const settingsSnap = await getDoc(settingsRef);
    return settingsSnap.exists() ? settingsSnap.data() : null;
  } catch (error) {
    console.error('Get settings error:', error);
    throw error;
  }
};

export const updateSettings = async (updates) => {
  if (!isFirebaseEnabled()) throw new Error('Firebase not available');
  
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'global');
    await setDoc(settingsRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Update settings error:', error);
    throw error;
  }
};

// Export auth functions
export {
  firebaseSignIn as signIn,
  firebaseSignUp as signUp,
  firebaseSignOut as signOut,
  onAuthChange,
  isFirebaseEnabled
};
