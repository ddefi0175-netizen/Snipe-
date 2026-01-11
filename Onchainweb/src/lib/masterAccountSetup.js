/**
 * Master Account Auto-Setup Utility
 * Automatically creates Firebase master account from environment variables
 * Similar to the old backend system where MASTER_USERNAME and MASTER_PASSWORD were used
 */

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

/**
 * Get master account credentials from environment variables
 * @returns {Object} Master account credentials or null if not configured
 */
export const getMasterAccountConfig = () => {
  const masterPassword = import.meta.env.VITE_MASTER_PASSWORD;
  const masterEmail = import.meta.env.VITE_MASTER_EMAIL || 'master@admin.onchainweb.app';
  const masterUsername = import.meta.env.VITE_MASTER_USERNAME || 'master';

  // If no password is set, return null
  if (!masterPassword) {
    return null;
  }

  return {
    username: masterUsername,
    email: masterEmail,
    password: masterPassword
  };
};

/**
 * Auto-create master account in Firebase if it doesn't exist
 * This replicates the old backend behavior where master credentials were in env vars
 * 
 * @returns {Promise<Object>} Result object with success/error info
 */
export const ensureMasterAccountExists = async () => {
  const config = getMasterAccountConfig();
  
  // If no master password configured, skip setup
  if (!config) {
    if (import.meta.env.DEV) {
      console.log('[Master Setup] No VITE_MASTER_PASSWORD found, skipping auto-setup');
    }
    return {
      success: true,
      message: 'Master password not configured in environment',
      skipped: true
    };
  }

  const auth = getAuth();
  
  // Check if Firebase is available
  if (!auth) {
    return {
      success: false,
      error: 'Firebase Authentication not initialized'
    };
  }

  try {
    // Try to sign in with the master account
    // If it succeeds, account already exists
    await signInWithEmailAndPassword(auth, config.email, config.password);
    
    // Sign out immediately after verification
    await auth.signOut();
    
    if (import.meta.env.DEV) {
      console.log('[Master Setup] Master account verified:', config.email);
    }
    return {
      success: true,
      message: 'Master account already exists and credentials are correct',
      email: config.email
    };
  } catch (signInError) {
    // If sign in fails with user-not-found, try to create the account
    if (signInError.code === 'auth/user-not-found') {
      try {
        if (import.meta.env.DEV) {
          console.log('[Master Setup] Creating master account:', config.email);
        }
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          config.email,
          config.password
        );
        
        // Sign out immediately after creation
        await auth.signOut();
        
        if (import.meta.env.DEV) {
          console.log('[Master Setup] ✅ Master account created successfully:', config.email);
        }
        return {
          success: true,
          message: 'Master account created successfully from environment variables',
          email: config.email,
          created: true
        };
      } catch (createError) {
        console.error('[Master Setup] Failed to create master account:', createError);
        return {
          success: false,
          error: `Failed to create master account: ${createError.message}`,
          code: createError.code
        };
      }
    } 
    // If sign in fails with wrong-password, account exists but password is different
    else if (signInError.code === 'auth/wrong-password') {
      if (import.meta.env.DEV) {
        console.warn('[Master Setup] ⚠️ Master account exists but password in environment does not match');
      }
      return {
        success: false,
        error: 'Master account exists but VITE_MASTER_PASSWORD does not match Firebase password',
        suggestion: 'Either update VITE_MASTER_PASSWORD to match Firebase, or reset password in Firebase Console'
      };
    }
    // Other errors (network, etc.)
    else {
      console.error('[Master Setup] Error verifying master account:', signInError);
      return {
        success: false,
        error: `Error checking master account: ${signInError.message}`,
        code: signInError.code
      };
    }
  }
};

/**
 * Check if master account is configured via environment variables
 * @returns {boolean}
 */
export const isMasterAccountConfigured = () => {
  return !!getMasterAccountConfig();
};

/**
 * Get setup instructions based on current configuration
 * @returns {string} Human-readable setup instructions
 */
export const getMasterSetupInstructions = () => {
  const config = getMasterAccountConfig();
  
  if (!config) {
    return `
🔐 MASTER ACCOUNT SETUP (Old Version Style)

Option 1: Quick Setup with Environment Variables (Recommended)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add to your .env file:

VITE_MASTER_PASSWORD=YourSecurePassword123!
VITE_MASTER_EMAIL=master@admin.onchainweb.app
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app

The master account will be automatically created in Firebase on first run!
Just restart the dev server and go to /master-admin to login.

Option 2: Manual Setup via Firebase Console
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Email: master@admin.onchainweb.app
4. Password: Your secure password
5. Add master@admin.onchainweb.app to VITE_ADMIN_ALLOWLIST
6. Set VITE_ENABLE_ADMIN=true

See MASTER_PASSWORD_SETUP.md for detailed instructions.
`;
  }
  
  return `
✅ MASTER ACCOUNT CONFIGURED

Master credentials are set in environment variables:
- Email: ${config.email}
- Username: ${config.username}
- Password: *** (configured)

The system will automatically create this account in Firebase if it doesn't exist.
Login at /master-admin with username "${config.username}" and your password.
`;
};
