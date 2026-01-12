/**
 * Admin Login Helper Utilities
 * Shared functions for admin authentication across MasterAdminDashboard and AdminPanel
 */

import { firebaseSignIn, firebaseSignOut, ensureAdminProfile } from './firebase.js';
import { convertToAdminEmail, determineAdminRole, getDefaultPermissions } from './adminAuth.js';
import { validatePassword } from './errorHandling.js';

/**
 * Handle admin login with Firebase Authentication and Firestore profile creation
 * 
 * @param {string} username - Admin username or email
 * @param {string} password - Admin password
 * @param {Object} options - Additional options
 * @param {boolean} options.checkAllowlist - Whether to check admin allowlist (default: false)
 * @param {Function} options.isEmailAllowed - Function to check if email is allowed (required if checkAllowlist is true)
 * @returns {Promise<Object>} Result object with success status and data/error
 */
export const handleAdminLogin = async (username, password, options = {}) => {
  const { checkAllowlist = false, isEmailAllowed = null } = options;

  // Validate inputs
  if (!username || !password) {
    return {
      success: false,
      error: 'Please enter username and password',
      code: 'MISSING_CREDENTIALS'
    };
  }

  // Validate password
  const passwordValidation = validatePassword(password, 6);
  if (!passwordValidation.valid) {
    return {
      success: false,
      error: passwordValidation.error,
      code: 'INVALID_PASSWORD'
    };
  }

  try {
    // Convert username to email format
    const email = convertToAdminEmail(username);
    
    console.log('[AdminLogin] Attempting Firebase authentication for:', email);
    
    // Sign in with Firebase Authentication
    const userCredential = await firebaseSignIn(email, password);
    const user = userCredential.user;
    
    console.log('[AdminLogin] Firebase auth successful for:', user.email);

    // Get Firebase ID token for API authorization
    const token = await user.getIdToken();
    
    // Determine role and permissions based on email
    const role = determineAdminRole(user.email);
    const permissions = getDefaultPermissions(role);

    // Check allowlist if required
    if (checkAllowlist && isEmailAllowed) {
      if (!isEmailAllowed(user.email)) {
        // Clean up and reject
        await firebaseSignOut();
        return {
          success: false,
          error: 'This account is not authorized for admin access.',
          code: 'NOT_IN_ALLOWLIST'
        };
      }
    }

    // Create/update admin profile in Firestore
    console.log('[AdminLogin] Creating/updating admin profile in Firestore...');
    const profileResult = await ensureAdminProfile(user.uid, user.email, role, permissions);
    
    if (!profileResult.success) {
      // Log warning but continue - email-based rule will still work
      console.warn('[AdminLogin] Failed to create admin profile:', profileResult.error);
      
      // If the error is critical (e.g., validation error), return failure
      if (profileResult.error.includes('Invalid') || profileResult.error.includes('must')) {
        return {
          success: false,
          error: `Profile creation failed: ${profileResult.error}`,
          code: 'PROFILE_CREATION_FAILED'
        };
      }
      
      // Otherwise, continue with warning
      console.log('[AdminLogin] Continuing without Firestore profile (email-based auth will work)');
    } else {
      console.log('[AdminLogin] Admin profile ensured:', profileResult.created ? 'created' : 'updated');
    }

    // Return success with admin data
    return {
      success: true,
      data: {
        username,
        email: user.email,
        uid: user.uid,
        role,
        permissions,
        token,
        profileCreated: profileResult.success
      }
    };

  } catch (error) {
    console.error('[AdminLogin] Error:', error);

    // Map Firebase errors to user-friendly messages
    let errorMessage = 'Login failed. Please try again.';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Admin account not found. Please check your credentials or set VITE_MASTER_PASSWORD in .env to auto-create the account.';
      errorCode = 'USER_NOT_FOUND';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. If you set VITE_MASTER_PASSWORD in .env, make sure it matches the password used in Firebase Console.';
      errorCode = 'WRONG_PASSWORD';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid credentials. Set VITE_MASTER_PASSWORD in .env to auto-create the account, or manually create it in Firebase Console (Authentication → Users → Add user with email: master@admin.onchainweb.app).';
      errorCode = 'INVALID_CREDENTIAL';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format.';
      errorCode = 'INVALID_EMAIL';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later (usually 5-15 minutes).';
      errorCode = 'TOO_MANY_REQUESTS';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection and try again.';
      errorCode = 'NETWORK_ERROR';
    } else if (error.message === 'Firebase not available') {
      errorMessage = 'Firebase authentication is not configured. Check your .env file and ensure all VITE_FIREBASE_* variables are set correctly.';
      errorCode = 'FIREBASE_UNAVAILABLE';
    } else {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      code: errorCode,
      originalError: error
    };
  }
};

/**
 * Handle admin logout
 * Clears Firebase session and local storage
 * 
 * @returns {Promise<void>}
 */
export const handleAdminLogout = async () => {
  try {
    // Sign out from Firebase
    await firebaseSignOut();
    console.log('[AdminLogin] Firebase sign out successful');
  } catch (error) {
    console.error('[AdminLogin] Firebase signout error:', error);
  }
  
  // Clear local session data
  localStorage.removeItem('masterAdminSession');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('firebaseAdminUid');
  localStorage.removeItem('adminUser');
  
  console.log('[AdminLogin] Local session cleared');
};
