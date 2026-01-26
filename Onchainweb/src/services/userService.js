// User Service for Firestore
// Handles user registration, management, and real-time updates

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseEnabled, saveUser } from '../lib/firebase.js';
import { COLLECTIONS } from '../config/firebase.config.js';

/**
 * Auto-register user when they connect wallet
 * Creates or updates user document in Firestore
 * 
 * @param {string} walletAddress - User's wallet address
 * @param {Object} additionalData - Optional additional user data
 * @returns {Promise<Object>} User document
 */
export const autoRegisterUser = async (walletAddress, additionalData = {}) => {
  if (!isFirebaseEnabled()) {
    console.warn('[UserService] Firebase not available, using localStorage fallback');
    return autoRegisterUserLocalStorage(walletAddress, additionalData);
  }

  try {
    const normalizedWallet = walletAddress.toLowerCase();
    const userRef = doc(db, COLLECTIONS.USERS, normalizedWallet);
    
    // Check if user already exists
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      console.log('[UserService] User already registered:', normalizedWallet);
      
      // Update last connected timestamp
      await setDoc(userRef, {
        lastConnectedAt: serverTimestamp(),
        ...additionalData
      }, { merge: true });
      
      return {
        id: userSnap.id,
        ...userSnap.data(),
        isNewUser: false
      };
    }

    // Create new user document
    const newUser = {
      wallet: walletAddress,
      walletNormalized: normalizedWallet,
      username: additionalData.username || `User_${normalizedWallet.slice(0, 8)}`,
      email: additionalData.email || null,
      balance: 0,
      points: 0,
      vipLevel: 1,
      status: 'active',
      kycStatus: 'not_submitted',
      referralCode: generateReferralCode(normalizedWallet),
      createdAt: serverTimestamp(),
      lastConnectedAt: serverTimestamp(),
      ...additionalData
    };

    await setDoc(userRef, newUser);

    console.log('[UserService] New user registered:', normalizedWallet);

    // Trigger notification event for admins
    window.dispatchEvent(new CustomEvent('newUserRegistered', {
      detail: { wallet: walletAddress, username: newUser.username }
    }));

    return {
      id: normalizedWallet,
      ...newUser,
      isNewUser: true
    };
  } catch (error) {
    console.error('[UserService] Auto-register error:', error);
    // Fallback to localStorage on error
    return autoRegisterUserLocalStorage(walletAddress, additionalData);
  }
};

/**
 * Fallback: Register user in localStorage when Firebase is unavailable
 */
const autoRegisterUserLocalStorage = (walletAddress, additionalData = {}) => {
  try {
    const normalizedWallet = walletAddress.toLowerCase();
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if user exists
    const existingUser = users.find(u => u.wallet?.toLowerCase() === normalizedWallet);
    if (existingUser) {
      console.log('[UserService] User already registered (localStorage):', normalizedWallet);
      // Update last connected
      existingUser.lastConnectedAt = new Date().toISOString();
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      return { ...existingUser, isNewUser: false };
    }

    // Create new user
    const newUser = {
      id: normalizedWallet,
      wallet: walletAddress,
      walletNormalized: normalizedWallet,
      username: additionalData.username || `User_${normalizedWallet.slice(0, 8)}`,
      email: additionalData.email || null,
      balance: 0,
      points: 0,
      vipLevel: 1,
      status: 'active',
      kycStatus: 'not_submitted',
      referralCode: generateReferralCode(normalizedWallet),
      createdAt: new Date().toISOString(),
      lastConnectedAt: new Date().toISOString(),
      ...additionalData
    };

    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    // Trigger notification event
    window.dispatchEvent(new CustomEvent('newUserRegistered', {
      detail: { wallet: walletAddress, username: newUser.username }
    }));

    console.log('[UserService] New user registered (localStorage):', normalizedWallet);
    return { ...newUser, isNewUser: true };
  } catch (error) {
    console.error('[UserService] localStorage fallback error:', error);
    throw error;
  }
};

/**
 * Generate a unique referral code based on wallet address
 */
const generateReferralCode = (walletAddress) => {
  const normalized = walletAddress.toLowerCase();
  // Take first 4 and last 4 chars, convert to uppercase
  return `REF${normalized.slice(2, 6)}${normalized.slice(-4)}`.toUpperCase();
};

/**
 * Get user by wallet address
 */
export const getUserByWallet = async (walletAddress) => {
  if (!isFirebaseEnabled()) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return users.find(u => u.wallet?.toLowerCase() === walletAddress.toLowerCase());
  }

  try {
    const normalizedWallet = walletAddress.toLowerCase();
    const userRef = doc(db, COLLECTIONS.USERS, normalizedWallet);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('[UserService] Get user error:', error);
    return null;
  }
};

/**
 * Update user data
 */
export const updateUser = async (walletAddress, updates) => {
  if (!isFirebaseEnabled()) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = users.findIndex(u => u.wallet?.toLowerCase() === walletAddress.toLowerCase());
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    }
    return;
  }

  try {
    const normalizedWallet = walletAddress.toLowerCase();
    await saveUser({
      wallet: walletAddress,
      ...updates
    });
  } catch (error) {
    console.error('[UserService] Update user error:', error);
    throw error;
  }
};

export default {
  autoRegisterUser,
  getUserByWallet,
  updateUser
};
