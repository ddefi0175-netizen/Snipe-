/**
 * Environment Variable Validation
 * 
 * This module validates that all required environment variables are properly set
 * before the application starts. This prevents runtime failures and provides
 * clear error messages for configuration issues.
 */

/**
 * List of required Firebase environment variables
 */
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
];

/**
 * Placeholder patterns that indicate an invalid/unconfigured value
 * These patterns match common placeholder text used in example configurations
 */
const placeholderPatterns = [
  /YOUR_.*_HERE/i,                    // Matches: YOUR_FIREBASE_API_KEY_HERE, YOUR_APP_ID_HERE
  /your-project/i,                    // Matches: your-project.firebaseapp.com, your-project-id
  /your-firebase/i,                   // Matches: your-firebase-project-id
  /XXXXXXXXXX/i,                      // Matches: G-XXXXXXXXXX (measurement ID placeholder)
  /xxxxxxxxxxx/i,                     // Matches: lowercase x patterns
  /123456789012/,                     // Matches: Example Firebase messaging sender ID
  /a1b2c3d4e5f6g7h8/i                 // Matches: Example Firebase app ID suffix
];

/**
 * Checks if a value is a placeholder or invalid
 * @param {string} value - The environment variable value to check
 * @returns {boolean} - True if the value is a placeholder/invalid
 */
function isPlaceholderValue(value) {
  if (!value || value.trim() === '') return true;
  
  // Check against known placeholder patterns
  return placeholderPatterns.some(pattern => pattern.test(value));
}

/**
 * Validates all required environment variables
 * @throws {Error} If validation fails with detailed error message
 */
export function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // Check each required variable
  requiredEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    
    if (!value) {
      errors.push(`${varName} is not set`);
    } else if (isPlaceholderValue(value)) {
      errors.push(`${varName} contains a placeholder value: "${value}"`);
    }
  });

  // Check optional but recommended variables
  const walletConnectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
  if (!walletConnectId || isPlaceholderValue(walletConnectId)) {
    warnings.push('VITE_WALLETCONNECT_PROJECT_ID is not set - WalletConnect features will be limited');
  }

  // If there are errors, fail fast with a clear message
  if (errors.length > 0) {
    const errorMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ ENVIRONMENT CONFIGURATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The application cannot start due to invalid or missing environment variables.

${errors.map((err, i) => `  ${i + 1}. ${err}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 HOW TO FIX THIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Get your Firebase configuration:
   → Go to https://console.firebase.google.com
   → Select your project (or create one)
   → Navigate to Settings ⚙️ → Project Settings
   → Scroll to "Your apps" and click your Web app
   → Copy the config values

2. Update your environment file:
   → Edit: Onchainweb/.env
   → Set all VITE_FIREBASE_* variables with your actual values
   → Make sure there are no placeholder texts like "YOUR_" or "your-project"

3. Restart the application:
   → npm run dev

For detailed setup instructions, see:
• QUICK_START_GUIDE.md
• Onchainweb/.env.example (for a complete template)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    throw new Error(errorMessage);
  }

  // Log warnings if any
  if (warnings.length > 0) {
    console.warn('⚠️  Environment Configuration Warnings:');
    warnings.forEach(warning => {
      console.warn(`  • ${warning}`);
    });
    console.warn('');
  }

  // Success message in development
  if (import.meta.env.DEV) {
    console.log('✅ Environment validation passed');
  }
}

/**
 * Returns the current environment configuration status
 * Useful for debugging and health checks
 */
export function getEnvironmentStatus() {
  const status = {
    valid: true,
    missing: [],
    placeholders: [],
    configured: []
  };

  requiredEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    
    if (!value) {
      status.valid = false;
      status.missing.push(varName);
    } else if (isPlaceholderValue(value)) {
      status.valid = false;
      status.placeholders.push(varName);
    } else {
      status.configured.push(varName);
    }
  });

  return status;
}
