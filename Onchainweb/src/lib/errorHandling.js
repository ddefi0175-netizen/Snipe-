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
 * Validate password strength (basic validation)
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum password length (default: 6)
 * @returns {Object} { valid: boolean, error: string }
 */
export function validatePassword(password, minLength = 6) {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  
  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` }
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
