/**
 * Shared utility for handling API errors consistently across components
 */

/**
 * Parse and format API error into user-friendly message
 * @param {Error} error - The error object from API call
 * @param {Object} options - Configuration options
 * @param {boolean} options.isColdStartAware - Whether to show cold start messages
 * @returns {string} User-friendly error message
 */
export function formatApiError(error, options = {}) {
  const { isColdStartAware = true } = options

  // Handle explicit error responses with status codes
  if (error.response) {
    const status = error.response.status
    switch (status) {
      case 401:
        return '❌ Invalid credentials. Please check your username and password.'
      case 403:
        return '🚫 Account access denied. Please contact support.'
      case 500:
      case 502:
      case 503:
        return '🔧 Server error. Please try again in a few moments.'
      default:
        return error.response.data?.error || '❌ An error occurred. Please try again.'
    }
  }

  // Handle error codes
  if (error.code) {
    switch (error.code) {
      case 'ECONNABORTED':
      case 'ETIMEDOUT':
        return isColdStartAware
          ? '⏱️ Request timed out. The server may be starting up (cold start). Please wait 30 seconds and try again.'
          : '⏱️ Request timed out. Please try again.'
      case 'ENOTFOUND':
      case 'ENETUNREACH':
        return '🌐 Network error. Please check your internet connection and try again.'
      default:
        break
    }
  }

  // Handle error by name
  if (error.name === 'AbortError') {
    return isColdStartAware
      ? '⏱️ Request timed out. The server may be starting up (cold start). Please wait 30 seconds and try again.'
      : '⏱️ Request timed out. Please try again.'
  }

  // Handle error by message patterns (fallback)
  const message = error.message || ''

  if (message.includes('timeout') || message.includes('Timeout')) {
    return isColdStartAware
      ? '⏱️ Request timed out. The server may be starting up (cold start). Please wait 30 seconds and try again.'
      : '⏱️ Request timed out. Please try again.'
  }

  if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('Network')) {
    return '🌐 Network error. Please check your internet connection and try again.'
  }

  if (message.includes('401')) {
    return '❌ Invalid credentials. Please check your username and password.'
  }

  if (message.includes('403')) {
    return '🚫 Account access denied. Please contact support.'
  }

  if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('Server')) {
    return '🔧 Server error. Please try again in a few moments.'
  }

  // Default error message
  return '❌ Connection error: ' + message
}

/**
 * Parse and format wallet connection error into user-friendly message
 * @param {Error} error - The error object from wallet connection
 * @param {string} walletName - Name of the wallet being connected
 * @returns {string} User-friendly error message
 */
export function formatWalletError(error, walletName = 'Wallet') {
  // Handle error codes from wallet providers
  if (error.code !== undefined) {
    switch (error.code) {
      case 4001:
        return '🚫 Connection request was rejected. Please approve the connection in your wallet.'
      case -32002:
        return '⏳ Connection request is already pending. Please check your wallet and approve the connection.'
      case -32603:
        return '❌ Internal wallet error. Please try again or restart your wallet.'
      default:
        break
    }
  }

  // Handle specific error messages
  const message = error.message || ''

  if (message === 'REDIRECT_TO_WALLET') {
    // This is not really an error, just a redirect
    return null
  }

  if (message.includes('rejected') || message.includes('denied')) {
    return '🚫 Connection request was rejected. Please approve the connection in your wallet.'
  }

  if (message.includes('pending')) {
    return '⏳ Connection request is already pending. Please check your wallet and approve the connection.'
  }

  if (message.includes('not detected') || message.includes('not found') || message.includes('not installed')) {
    return message // Already formatted in walletConnect.jsx
  }

  if (message.includes('locked') || message.includes('unlock')) {
    return '🔒 Your wallet is locked. Please unlock it and try again.'
  }

  if (message.includes('No accounts')) {
    return '🔒 No accounts found. Please unlock your wallet and try again.'
  }

  // Default wallet error
  return `❌ ${walletName} connection failed: ${message || 'Unknown error'}`
}

/**
 * Validate password strength with complexity requirements
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum password length (default: 8)
 * @returns {Object} { valid: boolean, error: string }
 */
export function validatePassword(password, minLength = 8) {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` }
  }

  // For admin accounts, enforce stronger requirements
  if (minLength >= 8) {
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter' }
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter' }
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one number' }
    }

    // Check for at least one special character
    // Common special characters: ! @ # $ % ^ & * ( ) - _ = + ; : ' " \ | , . < > ?
    const SPECIAL_CHARS = /[!@#$%^&*()_+=;:'",.<>\\|?-]/;
    if (!SPECIAL_CHARS.test(password)) {
      return { valid: false, error: 'Password must contain at least one special character (!@#$%^&*...)' }
    }
  }

  return { valid: true, error: null }
}

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateUsername(username) {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }

  return { valid: true, error: null }
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true, error: null }
}

/**
 * Validate wallet address (basic validation)
 * @param {string} address - Wallet address to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateWalletAddress(address) {
  if (!address) {
    return { valid: false, error: 'Wallet address is required' }
  }

  // Remove any whitespace
  address = address.trim()

  // Basic length validation (most wallet addresses are 26-42 chars)
  if (address.length < 26 || address.length > 50) {
    return { valid: false, error: 'Invalid wallet address length' }
  }

  // Check for common address formats
  const patterns = [
    /^0x[a-fA-F0-9]{40}$/, // Ethereum/BSC/Polygon (ERC-20/BEP-20)
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Bitcoin
    /^T[a-zA-Z0-9]{33}$/, // Tron (TRC-20)
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, // Solana
  ]

  const isValidFormat = patterns.some(pattern => pattern.test(address))
  if (!isValidFormat) {
    return { valid: false, error: 'Invalid wallet address format' }
  }

  return { valid: true, error: null }
}

/**
 * Validate trading amount
 * @param {number} amount - Amount to validate
 * @param {number} minAmount - Minimum amount allowed
 * @param {number} maxAmount - Maximum amount allowed
 * @param {number} balance - User's current balance (optional)
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateTradingAmount(amount, minAmount, maxAmount, balance = null) {
  if (amount === null || amount === undefined || amount === '') {
    return { valid: false, error: 'Amount is required' }
  }

  const numAmount = Number(amount)

  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Amount must be a positive number' }
  }

  if (numAmount < minAmount) {
    return { valid: false, error: `Minimum amount is ${minAmount}` }
  }

  if (numAmount > maxAmount) {
    return { valid: false, error: `Maximum amount is ${maxAmount}` }
  }

  if (balance !== null && numAmount > balance) {
    return { valid: false, error: 'Insufficient balance' }
  }

  return { valid: true, error: null }
}

/**
 * Check if localStorage is available
 * @returns {boolean} true if localStorage is available
 */
export function isLocalStorageAvailable() {
  try {
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
    return true
  } catch (e) {
    return false
  }
}
