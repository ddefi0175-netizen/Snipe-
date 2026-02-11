import { isFirebaseAvailable } from '../lib/firebase';

/**
 * Helper function to safely check if Firebase is available
 * Handles both boolean and function exports
 * @returns {boolean} True if Firebase is available and ready to use
 */
export const isFirebaseReady = () => {
  try {
    return typeof isFirebaseAvailable === 'function'
      ? !!isFirebaseAvailable()
      : !!isFirebaseAvailable;
  } catch (error) {
    console.warn('[firebaseHelpers] Error checking Firebase availability:', error);
    return false;
  }
};
