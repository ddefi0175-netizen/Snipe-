
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, isFirebaseAvailable } from '../lib/firebase';

/**
 * Helper function to safely check if Firebase is available
 * Handles both boolean and function exports
 */
const isFirebaseReady = () => {
  try {
    return typeof isFirebaseAvailable === 'function'
      ? !!isFirebaseAvailable()
      : !!isFirebaseAvailable;
  } catch {
    return false;
  }
};

/**
 * Fetches the current user's profile data.
 * @returns {object|null} The user's profile data or null if not found.
 */
export const getProfileData = async () => {
    if (!auth.currentUser) return null;
    const userId = auth.currentUser.uid;

    if (!isFirebaseReady()) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        return users[userId] || null;
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    return userSnap.exists() ? userSnap.data() : null;
};

/**
 * Submits KYC data for the current user.
 * @param {object} kycData - The user's KYC data.
 * @param {string} kycData.fullName - The user's full name.
 * @param {string} kycData.docType - The type of document.
 * @param {string} kycData.docNumber - The document number.
 * @param {string} kycData.frontPhoto - The base64 encoded front photo.
 * @param {string} kycData.backPhoto - The base64 encoded back photo.
 */
export const submitKycData = async (kycData) => {
    if (!auth.currentUser) throw new Error('User not authenticated.');
    const userId = auth.currentUser.uid;

    const dataToSubmit = {
        ...kycData,
        kycStatus: 'pending',
        submittedAt: new Date().toISOString(),
    };

    if (!isFirebaseReady()) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[userId] = { ...users[userId], ...dataToSubmit };
        localStorage.setItem('users', JSON.stringify(users));
        return;
    }

    const userRef = doc(db, 'users', userId);
    // Use setDoc with merge to create or update the user's KYC data
    await setDoc(userRef, dataToSubmit, { merge: true });
};
