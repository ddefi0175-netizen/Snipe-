/**
 * Environment Variable Validation
 * 
 * Validates that all required environment variables are set.
 * Used during application startup to catch configuration errors early.
 */

// Note: Using console.error here is intentional for startup validation
// This runs before the app initializes, so the logger may not be available

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_WALLETCONNECT_PROJECT_ID'
];

const adminEnvVars = [
  'VITE_ENABLE_ADMIN',
  'VITE_ADMIN_ALLOWLIST'
];

/**
 * Validates that all required environment variables are present
 * @returns {Object} - Validation result with valid flag and missing array
 */
export function validateEnvironment() {
  const missing = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missing.length > 0) {
    // Using console.error directly here since this is a startup check
    // and occurs before the app/logger is initialized
    console.error('Missing required environment variables:', missing);
    return {
      valid: false,
      missing
    };
  }
  
  // Check admin configuration (warning only, not error)
  if (import.meta.env.VITE_ENABLE_ADMIN === 'true') {
    const missingAdmin = adminEnvVars.filter(
      varName => !import.meta.env[varName]
    );
    
    if (missingAdmin.length > 0) {
      console.warn('Admin feature enabled but missing configuration:', missingAdmin);
      console.warn('Admin routes may not work properly. Please configure:', 
        missingAdmin.join(', '));
    }
  }
  
  return { valid: true };
}

/**
 * Get a list of all required environment variables
 * @returns {Array<string>} - Array of required variable names
 */
export function getRequiredEnvVars() {
  return [...requiredEnvVars];
}

/**
 * Get a list of admin-related environment variables
 * @returns {Array<string>} - Array of admin variable names
 */
export function getAdminEnvVars() {
  return [...adminEnvVars];
}
