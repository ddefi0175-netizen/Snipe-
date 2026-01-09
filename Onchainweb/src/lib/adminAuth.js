// Firebase Admin Authentication Utilities
// Helper functions for admin authentication with Firebase

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
  
  // If already an email (contains @), return as-is
  if (usernameOrEmail.includes('@')) {
    return usernameOrEmail;
  }
  
  // Convert username to email format
  return `${usernameOrEmail}@admin.onchainweb.app`;
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
