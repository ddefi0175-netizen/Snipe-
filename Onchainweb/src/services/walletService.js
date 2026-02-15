/**
 * Wallet Service with Auto User Registration
 *
 * Automatically registers users in Firestore when they connect their wallet
 */

import { db } from '../lib/firebase.js'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { logger } from '../utils/logger.js'
import { isFirebaseReady } from '../utils/firebaseHelpers.js'

/**
 * Auto-register user when wallet connects
 * @param {string} walletAddress - Connected wallet address
 */
export const autoRegisterUser = async (walletAddress) => {
  if (!isFirebaseReady()) {
    logger.log('[WalletService] Firebase not available, skipping auto-registration')
    return
  }

  try {
    const userRef = doc(db, 'users', walletAddress)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      // Create new user document
      await setDoc(userRef, {
        uid: walletAddress,
        wallet: walletAddress,
        balance: 0,
        vipLevel: 1,
        status: 'active',
        points: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        metadata: {
          source: 'wallet_connect',
          device: navigator.userAgent,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      })

      logger.log('[WalletService] New user registered:', walletAddress)

      // Dispatch event for admin dashboard
      window.dispatchEvent(new CustomEvent('newUserRegistered', {
        detail: { wallet: walletAddress, timestamp: Date.now() }
      }))
    } else {
      // Update last login
      await setDoc(userRef, {
        lastLogin: serverTimestamp(),
        metadata: {
          lastDevice: navigator.userAgent,
          lastPlatform: navigator.platform
        }
      }, { merge: true })

      logger.log('[WalletService] User login updated:', walletAddress)
    }
  } catch (error) {
    logger.error('[WalletService] Auto-registration error:', error)
    // Don't throw - allow wallet connection to succeed even if registration fails
  }
}

/**
 * Connect wallet with auto-registration
 * @param {string} walletType - Type of wallet (metamask, trust, etc.)
 * @param {Function} connectFunction - The actual wallet connection function
 * @returns {Promise<{success: boolean, address: string}>}
 */
export const connectWalletWithRegistration = async (walletType, connectFunction) => {
  try {
    // Execute the wallet connection
    const result = await connectFunction()

    if (result && result.address) {
      // Auto-register user in Firestore
      await autoRegisterUser(result.address)

      return { success: true, address: result.address, walletType }
    }

    return { success: false }
  } catch (error) {
    logger.error('[WalletService] Wallet connection error:', error)
    throw error
  }
}

/**
 * Update user's last seen timestamp
 * @param {string} walletAddress - User's wallet address
 */
export const updateUserActivity = async (walletAddress) => {
  if (!isFirebaseReady() || !walletAddress) return

  try {
    const userRef = doc(db, 'users', walletAddress)
    await setDoc(userRef, {
      lastSeen: serverTimestamp()
    }, { merge: true })
  } catch (error) {
    logger.error('[WalletService] Error updating user activity:', error)
  }
}

/**
 * Get user data from Firestore
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object|null>}
 */
export const getUserData = async (walletAddress) => {
  if (!isFirebaseReady() || !walletAddress) return null

  try {
    const userRef = doc(db, 'users', walletAddress)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() }
    }

    return null
  } catch (error) {
    logger.error('[WalletService] Error getting user data:', error)
    return null
  }
}

export default {
  autoRegisterUser,
  connectWalletWithRegistration,
  updateUserActivity,
  getUserData
}
