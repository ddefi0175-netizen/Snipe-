// Admin Account Auto-Provisioning System
// Handles automatic creation and management of master/admin accounts in Firebase

import { isFirebaseEnabled } from './firebase.js'
import { getAllowedAdminEmails } from './adminAuth.js'

/**
 * Initialize master account on first app load
 * This should run once in Firebase Console or via Cloud Function
 * Master credentials stored in Firebase Auth + Firestore
 */
export const initializeMasterAccount = async () => {
  if (!isFirebaseEnabled()) {
    console.warn('[PROVISIONING] Firebase not available, skipping master account init')
    return false
  }

  try {
    const allowedEmails = getAllowedAdminEmails()
    if (!allowedEmails.length) {
      console.warn('[PROVISIONING] No admin emails in VITE_ADMIN_ALLOWLIST')
      return false
    }

    // Master email is typically the first in the list and starts with 'master'
    const masterEmail = allowedEmails.find(email => email.startsWith('master@')) || allowedEmails[0]

    console.log('[PROVISIONING] Master account email:', masterEmail)
    return {
      email: masterEmail,
      role: 'master',
      requiresSetup: true,
      instructions: `
        Master Account Setup:
        1. Go to Firebase Console → Authentication
        2. Create user with email: ${masterEmail}
        3. Set a secure password (min 8 characters)
        4. User will be able to create other admins from dashboard
      `
    }
  } catch (error) {
    console.error('[PROVISIONING] Error:', error)
    return false
  }
}

/**
 * Check if user wallet address belongs to an admin
 * Admin wallets should be registered in allowlist metadata
 * @param {string} walletAddress - User's connected wallet
 * @returns {Promise<{isAdmin: boolean, email?: string, role?: string}>}
 */
export const checkWalletForAdminAccess = async (walletAddress) => {
  if (!walletAddress) return { isAdmin: false }

  try {
    // Check localStorage for wallet-to-admin mapping
    // This can be populated by master when creating admins
    const adminMappings = JSON.parse(localStorage.getItem('adminWalletMappings') || '{}')
    const normalizedWallet = walletAddress.toLowerCase()

    if (adminMappings[normalizedWallet]) {
      return {
        isAdmin: true,
        email: adminMappings[normalizedWallet].email,
        role: adminMappings[normalizedWallet].role,
        autoLogin: true
      }
    }

    return { isAdmin: false }
  } catch (error) {
    console.error('[PROVISIONING] Error checking wallet:', error)
    return { isAdmin: false }
  }
}

/**
 * Register a new admin with their wallet address
 * Called by master when creating new admin account
 * @param {string} email - Admin email
 * @param {string} role - 'master' or 'admin'
 * @param {string} walletAddress - Optional wallet to map
 */
export const registerAdminWallet = (email, role = 'admin', walletAddress = null) => {
  try {
    const adminMappings = JSON.parse(localStorage.getItem('adminWalletMappings') || '{}')

    if (walletAddress) {
      const normalizedWallet = walletAddress.toLowerCase()
      adminMappings[normalizedWallet] = {
        email: email.toLowerCase(),
        role: role,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('adminWalletMappings', JSON.stringify(adminMappings))
      console.log('[PROVISIONING] Registered admin wallet:', normalizedWallet)
    }

    return true
  } catch (error) {
    console.error('[PROVISIONING] Error registering wallet:', error)
    return false
  }
}

/**
 * Get list of all registered admin wallets
 * Useful for displaying in master dashboard
 */
export const getAdminWallets = () => {
  try {
    return JSON.parse(localStorage.getItem('adminWalletMappings') || '{}')
  } catch (error) {
    console.error('[PROVISIONING] Error getting admin wallets:', error)
    return {}
  }
}

/**
 * Revoke admin wallet mapping
 * Called when disabling an admin
 */
export const revokeAdminWallet = (walletAddress) => {
  try {
    const adminMappings = JSON.parse(localStorage.getItem('adminWalletMappings') || '{}')
    const normalizedWallet = walletAddress.toLowerCase()

    if (adminMappings[normalizedWallet]) {
      delete adminMappings[normalizedWallet]
      localStorage.setItem('adminWalletMappings', JSON.stringify(adminMappings))
      console.log('[PROVISIONING] Revoked admin wallet:', normalizedWallet)
      return true
    }

    return false
  } catch (error) {
    console.error('[PROVISIONING] Error revoking wallet:', error)
    return false
  }
}

/**
 * Auto-provision new user when they connect wallet for first time
 * Creates localStorage entry and notifies admins
 * @param {string} walletAddress - User's wallet
 * @param {object} userInfo - User profile info
 */
export const autoProvisionUser = (walletAddress, userInfo = {}) => {
  try {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const normalizedWallet = walletAddress.toLowerCase()

    // Check if user already exists
    const exists = users.some(u => u.wallet?.toLowerCase() === normalizedWallet)
    if (exists) {
      console.log('[PROVISIONING] User already registered:', normalizedWallet)
      return false
    }

    // Create new user entry
    const newUser = {
      id: Date.now().toString(),
      wallet: walletAddress,
      email: userInfo.email || null,
      username: userInfo.username || `User_${normalizedWallet.slice(0, 6)}`,
      balance: 0,
      points: 0,
      vipLevel: 1,
      createdAt: new Date().toISOString(),
      status: 'active',
      ...userInfo
    }

    users.push(newUser)
    localStorage.setItem('registeredUsers', JSON.stringify(users))

    // Notify admins
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]')
    notifications.push({
      id: Date.now().toString(),
      type: 'new_user',
      message: `New user registered: ${newUser.username}`,
      wallet: walletAddress,
      timestamp: new Date().toISOString(),
      read: false
    })
    localStorage.setItem('adminNotifications', JSON.stringify(notifications))

    console.log('[PROVISIONING] New user auto-provisioned:', newUser.id)
    window.dispatchEvent(new CustomEvent('userProvisioned', { detail: newUser }))
    return newUser
  } catch (error) {
    console.error('[PROVISIONING] Error provisioning user:', error)
    return null
  }
}

export default {
  initializeMasterAccount,
  checkWalletForAdminAccess,
  registerAdminWallet,
  getAdminWallets,
  revokeAdminWallet,
  autoProvisionUser
}
