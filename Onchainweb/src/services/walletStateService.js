
import { STORAGE_KEYS } from '../config/constants';

/**
 * Saves the wallet connection state to localStorage.
 * @param {object} state - The wallet state to save.
 * @param {string} state.address - The wallet address.
 * @param {number} state.chainId - The connected chain ID.
 * @param {string} state.connectorId - The ID of the wallet connector.
 */
export const saveWalletState = (state) => {
    try {
        localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true');
        localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, state.address);
        localStorage.setItem(STORAGE_KEYS.WALLET_CHAIN_ID, state.chainId);
        localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTOR_TYPE, state.connectorId);
    } catch (error) {
        console.error("Error saving wallet state to localStorage:", error);
    }
};

/**
 * Loads the wallet connection state from localStorage.
 * @returns {object|null} The saved wallet state or null if not found.
 */
export const loadWalletState = () => {
    try {
        const isConnected = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED) === 'true';
        if (!isConnected) return null;

        return {
            address: localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS),
            chainId: parseInt(localStorage.getItem(STORAGE_KEYS.WALLET_CHAIN_ID), 10),
            connectorId: localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTOR_TYPE),
        };
    } catch (error) {
        console.error("Error loading wallet state from localStorage:", error);
        return null;
    }
};

/**
 * Clears the wallet connection state from localStorage.
 */
export const clearWalletState = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            // Preserve other app settings, only remove wallet keys
            if (key.startsWith('wallet_')) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error("Error clearing wallet state from localStorage:", error);
    }
};
