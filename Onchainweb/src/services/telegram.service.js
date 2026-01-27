/**
 * Telegram Integration Service
 * 
 * Silently forwards customer service messages to Telegram in real-time
 * User never sees this integration - it happens in the background
 */

// Telegram configuration from environment variables
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || ''
const TELEGRAM_USERNAME = 'goblin_niko4' // Target Telegram username

// Check if Telegram is configured
export const isTelegramConfigured = () => {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)
}

/**
 * Send message to Telegram silently
 * @param {string} message - Message text
 * @param {object} metadata - Additional context (user info, session, etc)
 * @returns {Promise<boolean>} Success status
 */
export const sendToTelegram = async (message, metadata = {}) => {
  // Skip if not configured
  if (!isTelegramConfigured()) {
    console.log('[Telegram] Not configured, skipping message')
    return false
  }

  try {
    // Format message with metadata
    const formattedMessage = formatTelegramMessage(message, metadata)
    
    // Send via Telegram Bot API
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: formattedMessage,
          parse_mode: 'HTML',
          disable_notification: false, // Allow notifications
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`)
    }

    const result = await response.json()
    console.log('[Telegram] Message sent successfully:', result.message_id)
    return true
  } catch (error) {
    console.error('[Telegram] Failed to send message:', error)
    return false
  }
}

/**
 * Format message for Telegram with rich metadata
 * @param {string} message - User message
 * @param {object} metadata - Context information
 * @returns {string} Formatted HTML message
 */
const formatTelegramMessage = (message, metadata) => {
  const {
    sessionId = 'Unknown',
    username = 'Anonymous',
    wallet = 'Not connected',
    timestamp = new Date().toISOString(),
    type = 'message',
  } = metadata

  // Format timestamp
  const time = new Date(timestamp).toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

  // Format wallet address safely
  let formattedWallet = wallet
  if (wallet && wallet.length > 18) {
    formattedWallet = `${wallet.slice(0, 10)}...${wallet.slice(-8)}`
  }

  // Build message with HTML formatting
  let formatted = `<b>💬 Customer Service Message</b>\n\n`
  
  if (type === 'system') {
    formatted += `<b>🔔 System Event</b>\n`
  } else if (type === 'connection') {
    formatted += `<b>🔗 User Connected</b>\n`
  }
  
  formatted += `<b>User:</b> ${username}\n`
  formatted += `<b>Session:</b> <code>${sessionId}</code>\n`
  formatted += `<b>Wallet:</b> <code>${formattedWallet}</code>\n`
  formatted += `<b>Time:</b> ${time}\n`
  formatted += `\n<b>Message:</b>\n${message}\n`
  formatted += `\n<i>Sent to @${TELEGRAM_USERNAME}</i>`

  return formatted
}

/**
 * Notify Telegram when customer opens chat
 * @param {object} metadata - User information
 */
export const notifyCustomerServiceOpened = async (metadata) => {
  return sendToTelegram('Customer opened support chat', {
    ...metadata,
    type: 'connection',
  })
}

/**
 * Send user message to Telegram
 * @param {string} message - User's message
 * @param {object} metadata - User context
 */
export const sendUserMessage = async (message, metadata) => {
  return sendToTelegram(message, {
    ...metadata,
    type: 'message',
  })
}

/**
 * Send system notification to Telegram
 * @param {string} message - System message
 * @param {object} metadata - Context
 */
export const sendSystemNotification = async (message, metadata) => {
  return sendToTelegram(message, {
    ...metadata,
    type: 'system',
  })
}

export default {
  isTelegramConfigured,
  sendToTelegram,
  notifyCustomerServiceOpened,
  sendUserMessage,
  sendSystemNotification,
}
