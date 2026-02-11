
import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseAvailable } from '../lib/firebase';

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

// Pre-defined, secure deposit addresses for supported networks
// These can be overridden via environment variables
const STATIC_DEPOSIT_ADDRESSES = {
    'BTC': import.meta.env.VITE_DEPOSIT_BTC || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    'USDT-TRC20': import.meta.env.VITE_DEPOSIT_USDT_TRC20 || 'TXrvyV2A4sA41Z2V1Z2v4Z1v2Z2V1Z2v4Z',
    'USDT-ERC20': import.meta.env.VITE_DEPOSIT_USDT_ERC20 || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
};

/**
 * Fetches the deposit addresses for the supported coins.
 * In a real-world scenario, this might involve generating unique addresses per user.
 * For this platform, we use static, globally-assigned addresses for simplicity.
 * @returns {Promise<object>} A promise that resolves to an object of deposit addresses.
 */
export const getDepositAddresses = async () => {
    if (!isFirebaseReady()) {
        // For offline or dev environments, return the static addresses directly
        console.log("Firebase not available, using static deposit addresses.");
        return Promise.resolve(STATIC_DEPOSIT_ADDRESSES);
    }

    try {
        // In a real application, you might fetch these from a 'configs/deposits' document
        const configRef = doc(db, 'configs', 'depositAddresses');
        const docSnap = await getDoc(configRef);

        if (docSnap.exists() && Object.keys(docSnap.data()).length > 0) {
            return docSnap.data();
        } else {
            // If the document doesn't exist or is empty, fall back to static addresses
            console.warn("Deposit address config not found in Firestore, falling back to static addresses.");
            return STATIC_DEPOSIT_ADDRESSES;
        }
    } catch (error) {
        console.error("Error fetching deposit addresses from Firestore:", error);
        // On error, still provide the static addresses as a fallback
        return STATIC_DEPOSIT_ADDRESSES;
    }
};
