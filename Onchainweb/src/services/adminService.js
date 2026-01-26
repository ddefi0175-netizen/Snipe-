// Admin Service for Firestore
// Handles admin account management, permissions, and user quotas

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
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseEnabled, auth, firebaseSignUp } from '../lib/firebase.js';
import { COLLECTIONS } from '../config/firebase.config.js';

/**
 * Create a new admin account
 * @param {Object} adminData - Admin account details
 * @param {string} adminData.email - Admin email (must be unique)
 * @param {string} adminData.password - Admin password (min 8 characters)
 * @param {string} adminData.username - Admin username
 * @param {string} adminData.role - 'master' or 'admin'
 * @param {Array<string>} adminData.permissions - Array of permission strings
 * @param {string} adminData.userAccessMode - 'all' or 'assigned'
 * @param {Array<string>} adminData.assignedUserIds - User IDs this admin can manage (if mode is 'assigned')
 * @param {number} adminData.maxUsers - Maximum users this admin can manage (0 = unlimited)
 * @param {string} adminData.createdBy - Email of the creator (master account)
 */
export const createAdminAccount = async (adminData) => {
  if (!isFirebaseEnabled()) {
    throw new Error('Firebase not available');
  }

  try {
    // 1. Create Firebase Auth user
    const userCredential = await firebaseSignUp(adminData.email, adminData.password);
    const uid = userCredential.user.uid;

    // 2. Create admin document in Firestore
    const adminDoc = {
      uid,
      email: adminData.email.toLowerCase(),
      username: adminData.username,
      role: adminData.role || 'admin',
      permissions: adminData.permissions || [],
      userAccessMode: adminData.userAccessMode || 'all',
      assignedUserIds: adminData.assignedUserIds || [],
      maxUsers: adminData.maxUsers || 0, // 0 = unlimited
      currentUserCount: 0,
      status: 'active',
      createdBy: adminData.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: null
    };

    await setDoc(doc(db, COLLECTIONS.ADMINS, uid), adminDoc);

    return {
      success: true,
      uid,
      admin: adminDoc
    };
  } catch (error) {
    console.error('[AdminService] Create admin error:', error);
    throw error;
  }
};

/**
 * Get admin account by UID
 */
export const getAdminByUid = async (uid) => {
  if (!isFirebaseEnabled()) {
    throw new Error('Firebase not available');
  }

  try {
    const adminRef = doc(db, COLLECTIONS.ADMINS, uid);
    const adminSnap = await getDoc(adminRef);
    
    if (adminSnap.exists()) {
      return {
        uid: adminSnap.id,
        ...adminSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('[AdminService] Get admin error:', error);
    throw error;
  }
};

/**
 * Get admin account by email
 */
export const getAdminByEmail = async (email) => {
  if (!isFirebaseEnabled()) {
    throw new Error('Firebase not available');
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.ADMINS),
      where('email', '==', email.toLowerCase())
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const adminDoc = snapshot.docs[0];
      return {
        uid: adminDoc.id,
        ...adminDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('[AdminService] Get admin by email error:', error);
    throw error;
  }
};

/**
 * Update admin account
 */
export const updateAdminAccount = async (uid, updates) => {
  if (!isFirebaseEnabled()) {
    throw new Error('Firebase not available');
  }

  try {
    const adminRef = doc(db, COLLECTIONS.ADMINS, uid);
    await updateDoc(adminRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('[AdminService] Update admin error:', error);
    throw error;
  }
};

/**
 * Update admin last login timestamp
 */
export const updateAdminLastLogin = async (uid) => {
  if (!isFirebaseEnabled()) {
    throw new Error('Firebase not available');
  }

  try {
    const adminRef = doc(db, COLLECTIONS.ADMINS, uid);
    await updateDoc(adminRef, {
      lastLoginAt: serverTimestamp()
    });
  } catch (error) {
    console.error('[AdminService] Update last login error:', error);
    // Don't throw, this is not critical
  }
};

/**
 * Delete admin account
 */
export const deleteAdminAccount = async (uid) => {
  if (!isFirebaseEnabled()) {
    throw new Error('Firebase not available');
  }

  try {
    // Delete from Firestore
    const adminRef = doc(db, COLLECTIONS.ADMINS, uid);
    await deleteDoc(adminRef);

    // Note: Firebase Auth user deletion requires Admin SDK
    // For now, we just mark as deleted in Firestore
    // The actual Auth user can be deleted from Firebase Console

    return { success: true };
  } catch (error) {
    console.error('[AdminService] Delete admin error:', error);
    throw error;
  }
};

/**
 * Subscribe to all admin accounts (real-time)
 */
export const subscribeToAdmins = (callback) => {
  if (!isFirebaseEnabled()) {
    console.warn('Firebase not available, using empty array');
    callback([]);
    return () => {};
  }

  const q = query(collection(db, COLLECTIONS.ADMINS));

  return onSnapshot(q, (snapshot) => {
    const admins = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    callback(admins);
  }, (error) => {
    console.error('Subscribe to admins error:', error);
    callback([]);
  });
};

/**
 * Check if admin can manage a user
 */
export const canManageUser = async (adminUid, userId) => {
  if (!isFirebaseEnabled()) {
    return false;
  }

  try {
    const admin = await getAdminByUid(adminUid);
    if (!admin) return false;

    // Master can manage all users
    if (admin.role === 'master') {
      return true;
    }

    // Check access mode
    if (admin.userAccessMode === 'all') {
      // Check if within user limit
      if (admin.maxUsers === 0) return true; // Unlimited
      return admin.currentUserCount < admin.maxUsers;
    }

    // Check if user is in assigned list
    return admin.assignedUserIds.includes(userId);
  } catch (error) {
    console.error('[AdminService] Can manage user error:', error);
    return false;
  }
};

/**
 * Check if admin has permission
 */
export const hasPermission = (admin, permission) => {
  if (!admin) return false;
  
  // Master has all permissions
  if (admin.role === 'master') {
    return true;
  }

  // Check if permission exists in admin's permissions array
  return admin.permissions.includes(permission) || admin.permissions.includes('all');
};

/**
 * Initialize master account if not exists
 * This should be called on app initialization
 */
export const initializeMasterAccount = async (masterEmail, masterPassword) => {
  if (!isFirebaseEnabled()) {
    console.warn('[AdminService] Firebase not available, cannot initialize master');
    return { success: false, message: 'Firebase not configured' };
  }

  try {
    // Check if master already exists
    const existingMaster = await getAdminByEmail(masterEmail);
    if (existingMaster) {
      return {
        success: true,
        message: 'Master account already exists',
        uid: existingMaster.uid
      };
    }

    // Create master account
    const result = await createAdminAccount({
      email: masterEmail,
      password: masterPassword,
      username: 'master',
      role: 'master',
      permissions: ['all'],
      userAccessMode: 'all',
      assignedUserIds: [],
      maxUsers: 0,
      createdBy: 'system'
    });

    return {
      success: true,
      message: 'Master account created successfully',
      uid: result.uid
    };
  } catch (error) {
    console.error('[AdminService] Initialize master error:', error);
    
    // If the error is that the user already exists in Auth but not in Firestore
    if (error.code === 'auth/email-already-in-use') {
      // Try to get the UID from current auth state and create Firestore doc
      try {
        // User exists in Auth but not in Firestore, let's handle this
        return {
          success: false,
          message: 'Master email already exists in Firebase Auth. Please sign in to complete setup.',
          error: error.message
        };
      } catch (e) {
        console.error('Failed to handle existing auth user:', e);
      }
    }
    
    throw error;
  }
};

export default {
  createAdminAccount,
  getAdminByUid,
  getAdminByEmail,
  updateAdminAccount,
  updateAdminLastLogin,
  deleteAdminAccount,
  subscribeToAdmins,
  canManageUser,
  hasPermission,
  initializeMasterAccount
};
