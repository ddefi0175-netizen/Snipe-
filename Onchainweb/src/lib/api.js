/**
 * Legacy API stubs for deprecated MongoDB/Express backend
 * 
 * This module provides stub implementations for legacy backend API calls.
 * Since the backend is deprecated, these functions return rejected promises
 * to trigger graceful fallback behavior in components that still reference them.
 */

export const userAPI = {
    /**
     * Login by wallet address (legacy backend)
     * @deprecated Use Firebase autoRegisterUser from services/userService.js instead
     */
    loginByWallet: async (address, username, email, walletType) => {
        throw new Error('Legacy backend API not available. Using Firebase only.');
    },

    /**
     * Get user by wallet address (legacy backend)
     * @deprecated Use Firebase getUserByWallet from services/userService.js instead
     */
    getByWallet: async (address) => {
        throw new Error('Legacy backend API not available. Using Firebase only.');
    },

    /**
     * Submit KYC documents (legacy backend)
     * @deprecated Use Firebase updateUserKYC from services/adminService.js instead
     */
    submitKYC: async (userId, kycData) => {
        throw new Error('Legacy backend API not available. Using Firebase only.');
    }
};

export const uploadAPI = {
    /**
     * Create upload record (legacy backend)
     * @deprecated Use Firebase storage and Firestore instead
     */
    create: async (uploadData) => {
        throw new Error('Legacy backend API not available. Using Firebase only.');
    }
};
