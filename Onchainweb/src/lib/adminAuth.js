/* eslint-disable no-unused-vars */
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { isFirebaseAvailable, auth } from './firebase'; // Assuming auth is exported from firebase.js

// Admin roles and permissions
export const ROLES = {
  MASTER: 'master',
  ADMIN: 'admin',
  USER: 'user',
};

export const PERMISSIONS = {
  MANAGE_USERS: 'manageUsers',
  MANAGE_BALANCES: 'manageBalances',
  MANAGE_KYC: 'manageKYC',
  MANAGE_TRADES: 'manageTrades',
  VIEW_REPORTS: 'viewReports',
  MANAGE_DEPOSITS: 'manageDeposits',
  MANAGE_WITHDRAWALS: 'manageWithdrawals',
  CUSTOMER_SERVICE: 'customerService',
  VIEW_LOGS: 'viewLogs',
  SITE_SETTINGS: 'siteSettings',
  CREATE_ADMINS: 'createAdmins',
};

/**
 * Get a list of allowed admin emails from environment variables.
 * @returns {string[]} An array of lowercase admin emails.
 */
export const getAllowedAdminEmails = () => {
  const allowlist = import.meta.env.VITE_ADMIN_ALLOWLIST || '';
  return allowlist.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

/**
 * Checks if an email is in the admin allowlist.
 * @param {string} email - The email to check.
 * @returns {boolean} True if the email is in the allowlist.
 */
const isEmailInAllowlist = (email) => {
  const allowedEmails = getAllowedAdminEmails();
  return allowedEmails.includes(email.toLowerCase());
};

/**
 * Handles the admin login process.
 * Validates credentials and checks if the user is an authorized admin.
 * @param {string} email - The admin's email.
 * @param {string} password - The admin's password.
 * @param {function} firebaseSignIn - The signInWithEmailAndPassword function from Firebase.
 * @returns {Promise<object>} An object containing user and admin data.
 * @throws {Error} If login fails or the user is not an authorized admin.
 */
export const handleAdminLogin = async (email, password, firebaseSignIn) => {
  if (!isEmailInAllowlist(email)) {
    throw new Error('Invalid credentials or unauthorized user.');
  }

  if (!isFirebaseAvailable()) {
    // Fallback to localStorage for development or offline mode
    const admins = JSON.parse(localStorage.getItem('admins') || '{}');
    const admin = Object.values(admins).find(a => a.email.toLowerCase() === email.toLowerCase());

    if (admin) {
      // NOTE: In a real app, you would have a secure way to verify the password.
      // For this fallback, we assume the login is successful.
      return {
        user: { email: admin.email, uid: admin.uid },
        role: admin.role,
        permissions: admin.permissions,
      };
    } else {
      throw new Error('Admin account not found in local storage.');
    }
  }

  // Primary Firebase authentication
  const userCredential = await firebaseSignIn(auth, email, password);
  // The rest of the admin data (role, permissions) should be fetched from Firestore
  // in the component after a successful login.
  return { user: userCredential.user };
};


/**
 * Formats Firebase Auth error messages into user-friendly strings.
 * @param {Error} error - The Firebase error object.
 * @returns {string} A user-friendly error message.
 */
export const formatFirebaseAuthError = (error) => {
  if (!error.code) {
    return error.message || 'An unexpected error occurred.';
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid credentials. Please check your email and password.';
    case 'auth/email-already-in-use':
      return 'This email is already in use by another account.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Checks if a user has a specific permission.
 * @param {string[]} userPermissions - An array of the user's permissions.
 * @param {string} requiredPermission - The permission to check for.
 * @returns {boolean} True if the user has the permission.
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions) return false;
  // Master admins with 'all' permission have access to everything
  if (userPermissions.includes('all')) return true;
  return userPermissions.includes(requiredPermission);
};
