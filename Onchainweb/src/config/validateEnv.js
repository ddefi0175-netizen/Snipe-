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
  
  return { valid: true };
}

/**
 * Get a list of all required environment variables
 * @returns {Array<string>} - Array of required variable names
 */
export function getRequiredEnvVars() {
  return [...requiredEnvVars];
}
