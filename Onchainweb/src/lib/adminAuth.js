// Firebase Admin Authentication Utilities
// Helper functions for admin authentication with Firebase
//
// ⚠️ SECURITY WARNING: Admin tokens are stored in localStorage
// 
// RISKS:
// - localStorage is vulnerable to XSS (Cross-Site Scripting) attacks
// - Any malicious script on the page can access localStorage data
// - Tokens persist across browser sessions
//
// RECOMMENDED ALTERNATIVES:
// - Use httpOnly cookies for token storage (requires backend support)
// - Implement short-lived tokens with refresh token rotation
// - Use secure, httpOnly, sameSite cookies set by the server
// - Consider using Firebase Session Management with server-side validation
//
// CURRENT MITIGATION:
// - Tokens expire after a set period (check Firebase Auth settings)
// - Admin access is restricted by email whitelist (VITE_ADMIN_ALLOWLIST)
// - Always validate permissions on the server/Firebase side
// 
// TODO: Migrate to httpOnly cookies in production for better security
//
// For more information, see: SECURITY.md

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
 * ⚠️ SECURITY NOTE: This function performs basic email format conversion.
 * For production use, consider implementing:
 * - Email format validation (RFC 5322)
 * - Domain whitelist checking
 * - Rate limiting on authentication attempts
 * - Account lockout after failed attempts
 *
 * @param {string} usernameOrEmail - Username or email
 * @returns {string} Email in format suitable for Firebase Auth
 */
export const convertToAdminEmail = (usernameOrEmail) => {
  if (!usernameOrEmail) return '';

  // Basic input sanitization
  const sanitized = usernameOrEmail.trim().toLowerCase();

  // If already an email (contains @), validate and return
  if (sanitized.includes('@')) {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      console.warn('Invalid email format provided:', usernameOrEmail);
      return '';
    }
    return sanitized;
  }

  // Convert username to email format
  // Only allow alphanumeric characters, dots, and hyphens in username
  const usernameRegex = /^[a-z0-9._-]+$/;
  if (!usernameRegex.test(sanitized)) {
    console.warn('Invalid username format provided:', usernameOrEmail);
    return '';
  }

  return `${sanitized}@admin.onchainweb.app`;
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
 * ⚠️ SECURITY CONSIDERATION: Master role has broad permissions including admin management.
 * In production systems, consider implementing role separation where:
 * - User management role: Can manage regular users but not admins
 * - Admin management role: Can manage admins but with limited user access
 * - Settings role: Can configure platform settings
 * This reduces the blast radius if a master account is compromised.
 * 
 * CURRENT IMPLEMENTATION: Master has all permissions for simplicity in small deployments.
 * For enterprise deployments, implement the principle of least privilege.
 *
 * @param {string} role - 'master' or 'admin'
 * @returns {Array<string>} Array of permission strings
 */
export const getDefaultPermissions = (role) => {
  if (role === 'master') {
    // Master has explicit permissions instead of generic 'all' for better security
    // This allows for granular permission checking and audit logging
    return [
      'manageUsers',
      'manageBalances',
      'manageKYC',
      'manageTrades',
      'manageAdmins',      // Ability to create/edit admin accounts - HIGH PRIVILEGE
      'viewReports',
      'manageSettings',     // Platform-wide settings - HIGH PRIVILEGE
      'manageDeposits',
      'manageWithdrawals',
      'customerService',    // Access to customer support features
      'viewLogs',           // Access to audit logs - HIGH PRIVILEGE
      'siteSettings'        // Site configuration - HIGH PRIVILEGE
    ];
  }

  // Default admin permissions (limited subset)
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
