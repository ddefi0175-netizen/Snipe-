// Firebase Admin Authentication Utilities
// Helper functions for admin authentication with Firebase

// Admin allowlist derived from environment for gated access
const rawAllowlist = (import.meta.env?.VITE_ADMIN_ALLOWLIST || '')
  .split(',')
  .map(entry => entry.trim().toLowerCase())
  .filter(Boolean);

const adminFeatureEnabled = import.meta.env?.VITE_ENABLE_ADMIN === 'true';

/**
 * Converts username to Firebase email format
 * If input is already an email in the allowlist, returns it
 * If input is a username, looks up the corresponding allowlisted email
 * Otherwise, throws an error
 *
 * @param {string} usernameOrEmail - Username or email
 * @returns {string} Email in format suitable for Firebase Auth
 * @throws {Error} If email not in allowlist or input is invalid
 */
export const convertToAdminEmail = (usernameOrEmail) => {
  // Handle empty, null, undefined, and whitespace-only inputs
  if (!usernameOrEmail?.trim()) {
    throw new Error('Username or email is required');
  }
  
  const trimmed = usernameOrEmail.trim();
  const lowerTrimmed = trimmed.toLowerCase();

  // If already an email (contains @), check if it's in the allowlist
  if (trimmed.includes('@')) {
    if (rawAllowlist.includes(lowerTrimmed)) {
      return lowerTrimmed;
    }
    throw new Error('Email not in admin allowlist');
  }

  // If the username matches an allowlisted local-part, return that allowlisted email
  const matchFromAllowlist = rawAllowlist.find(email => email.split('@')[0] === lowerTrimmed);
  if (matchFromAllowlist) {
    return matchFromAllowlist;
  }

  // No match found
  throw new Error('Username not found in admin allowlist');
};

/**
 * Determines admin role based on email
 * Master admins use 'master' prefix or master@domain
 * Regular admins use other emails
 *
 * @param {string} email - Firebase user email
 * @returns {string} 'master' or 'admin'
 */
export const determineAdminRole = (email) => {
  if (!email) return 'admin';

  // Check if email starts with 'master'
  if (email.startsWith('master@') || email.startsWith('master.')) {
    return 'master';
  }

  return 'admin';
};

/**
 * Gets default permissions based on role
 *
 * @param {string} role - 'master' or 'admin'
 * @returns {Array<string>} Array of permission strings
 */
export const getDefaultPermissions = (role) => {
  if (role === 'master') {
    return ['all']; // Master has all permissions
  }

  // Default admin permissions
  return [
    'manageUsers',
    'manageBalances',
    'manageKYC',
    'manageTrades',
    'viewReports'
  ];
};

/**
 * Checks whether admin features are enabled via environment flag
 * @returns {boolean}
 */
export const isAdminFeatureEnabled = () => adminFeatureEnabled;

/**
 * Returns the normalized allowlisted admin emails
 * @returns {Array<string>}
 */
export const getAllowedAdminEmails = () => rawAllowlist;

/**
 * Validates whether an email is allowed to access admin features
 * @param {string} email
 * @returns {boolean}
 */
export const isEmailAllowed = (email) => {
  if (!adminFeatureEnabled) return false;
  if (!email) return false;
  if (!rawAllowlist.length) return false;
  return rawAllowlist.includes(email.toLowerCase());
};

/**
 * Handles admin login with Firebase authentication
 * Validates email against allowlist and authenticates with Firebase
 * 
 * @param {string} username - Username or email to login with
 * @param {string} password - Password for the account
 * @param {Function} firebaseSignIn - Firebase sign in function
 * @returns {Promise<Object>} - Returns { success: true, token, user, role, permissions } or throws error
 * @throws {Error} - Throws descriptive error for various failure cases
 */
export const handleAdminLogin = async (username, password, firebaseSignIn) => {
  console.log('[Admin Login] Validating email against allowlist...')

  // Validate email against allowlist BEFORE Firebase login
  let email;
  try {
    email = convertToAdminEmail(username)
    console.log('[Admin Login] Email validated:', email)
  } catch (error) {
    console.error('[Admin Login] Email validation failed:', error.message)
    if (error.message.includes('allowlist')) {
      throw new Error('This email is not authorized for admin access. Please contact the master admin.')
    } else {
      throw error
    }
  }

  // Double-check allowlist (defense in depth)
  if (!isEmailAllowed(email)) {
    throw new Error('This account is not authorized for admin access.')
  }

  console.log('[Admin Login] Attempting Firebase authentication...')
  const userCredential = await firebaseSignIn(email, password)
  const user = userCredential.user

  console.log('[Admin Login] Firebase auth successful for:', user.email)

  // Get Firebase ID token for API authorization
  const token = await user.getIdToken()

  // Determine role and permissions based on email
  const role = determineAdminRole(user.email)
  const permissions = getDefaultPermissions(role)

  console.log('[Admin Login] Role determined:', role)

  return {
    success: true,
    token,
    user,
    role,
    permissions
  }
};

/**
 * Formats Firebase authentication errors into user-friendly messages
 * 
 * @param {Error} error - Firebase authentication error
 * @returns {string} - User-friendly error message
 */
export const formatFirebaseAuthError = (error) => {
  if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
    return 'Admin account not found in Firebase. ' +
      'Please create this account in Firebase Console > Authentication > Users first. ' +
      'See FIX_ADMIN_LOGIN_ERROR.md for instructions.'
  } else if (error.code === 'auth/wrong-password') {
    return 'Incorrect password. Please try again.'
  } else if (error.code === 'auth/invalid-email') {
    return 'Invalid email format.'
  } else if (error.code === 'auth/too-many-requests') {
    return 'Too many failed login attempts. Please try again later.'
  } else if (error.message === 'Firebase not available') {
    return 'Firebase authentication is not configured. ' +
      'Please set VITE_FIREBASE_* environment variables in .env file.'
  } else if (error.message && error.message.includes('allowlist')) {
    return error.message
  } else {
    return `Login failed: ${error.message}`
  }
};
