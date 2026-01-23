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
 * @throws {Error} If email not in allowlist
 */
export const convertToAdminEmail = (usernameOrEmail) => {
  if (!usernameOrEmail) {
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
