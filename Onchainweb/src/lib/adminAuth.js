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
 * If input is already an email, returns as-is
 * Otherwise, appends @admin.onchainweb.app domain
 *
 * @param {string} usernameOrEmail - Username or email
 * @returns {string} Email in format suitable for Firebase Auth
 */
export const convertToAdminEmail = (usernameOrEmail) => {
  if (!usernameOrEmail) return '';
  const trimmed = usernameOrEmail.trim();

  // If already an email (contains @), return as-is
  if (trimmed.includes('@')) {
    return trimmed;
  }

  // If the username matches an allowlisted local-part, return that allowlisted email
  const matchFromAllowlist = rawAllowlist.find(email => email.split('@')[0] === trimmed.toLowerCase());
  if (matchFromAllowlist) return matchFromAllowlist;

  // Fallback to default admin domain
  return `${trimmed}@admin.onchainweb.app`;
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
