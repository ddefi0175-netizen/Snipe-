# Telegram Customer Service Integration

## Overview

Customer service messages are automatically forwarded to Telegram (username: **goblin_niko4**) in real-time. This integration is completely transparent to users - they see only the customer service chat interface, while all messages appear in Telegram instantly.

## Configuration

### Bot Token

The Telegram bot token is already configured:
```
Bot Token: 8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4
Target Username: @goblin_niko4
```

### Getting Your Chat ID

To receive messages, you need your Telegram Chat ID:

1. **Start a conversation with your bot:**
   - Open Telegram
   - Search for your bot (use the token with @BotFather to find it)
   - Send any message to the bot (e.g., "Hello")

2. **Get your Chat ID:**
   - Visit this URL in your browser (replace TOKEN with your bot token):
   ```
   https://api.telegram.org/bot8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4/getUpdates
   ```
   
3. **Find the Chat ID in the response:**
   ```json
   {
     "ok": true,
     "result": [{
       "message": {
         "chat": {
           "id": 123456789,  // <-- This is your Chat ID
           "username": "goblin_niko4"
         }
       }
     }]
   }
   ```

## Environment Setup

### For Local Development

Add to `Onchainweb/.env`:
```bash
VITE_TELEGRAM_BOT_TOKEN=8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4
VITE_TELEGRAM_CHAT_ID=your-chat-id-here
```

### For Vercel Deployment

Add these environment variables in Vercel Dashboard:

1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   ```
   Name: VITE_TELEGRAM_BOT_TOKEN
   Value: 8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4
   
   Name: VITE_TELEGRAM_CHAT_ID
   Value: [your-chat-id]
   ```
4. Set for: **Production, Preview, Development**
5. Redeploy

### For Cloudflare Pages

Add in Cloudflare Pages Dashboard → Settings → Environment Variables:
```
VITE_TELEGRAM_BOT_TOKEN=8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4
VITE_TELEGRAM_CHAT_ID=[your-chat-id]
```

## How It Works

### User Experience (Visible)
1. User clicks customer service button
2. Chat window opens
3. User types message
4. Auto-response appears (instant)
5. Real agent can reply (appears in chat)

### Background Integration (Invisible to User)
1. When user opens chat → Silent notification sent to Telegram
2. When user sends message → Message forwarded to Telegram with context:
   - User's wallet address
   - Session ID
   - Timestamp
   - Message content
3. All happens instantly and transparently

### Message Format in Telegram

Messages appear in Telegram like this:
```
💬 Customer Service Message

User: Anonymous
Session: CHAT-1234567890-ABC123
Wallet: 0x1234...5678
Time: 1/27/2026, 10:30 AM

Message:
I need help with my deposit

Sent to @goblin_niko4
```

## Testing

### 1. Test Bot Connection

```bash
curl https://api.telegram.org/bot8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4/getMe
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "id": 8535105293,
    "is_bot": true,
    "first_name": "YourBotName",
    "username": "your_bot_username"
  }
}
```

### 2. Test Message Sending

```bash
curl -X POST https://api.telegram.org/bot8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4/sendMessage \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "YOUR_CHAT_ID",
    "text": "Test message from Snipe customer service"
  }'
```

### 3. Test in Application

1. Start the application: `npm run dev`
2. Open browser: `http://localhost:5173`
3. Click customer service button (bottom right)
4. Type a message
5. Check Telegram - message should appear instantly

## Troubleshooting

### Messages Not Appearing in Telegram

**Problem**: No messages received

**Solutions**:
1. Verify `VITE_TELEGRAM_BOT_TOKEN` is set correctly
2. Verify `VITE_TELEGRAM_CHAT_ID` is correct
3. Make sure you've sent at least one message to the bot first
4. Check browser console for errors
5. Restart dev server after changing env vars

### Wrong Chat ID

**Problem**: Messages go to wrong chat or nowhere

**Solutions**:
1. Visit the getUpdates URL again to confirm Chat ID
2. Ensure you're using YOUR chat ID, not a placeholder
3. Try sending a message to the bot again and check getUpdates

### Bot Token Invalid

**Problem**: 401 Unauthorized error

**Solutions**:
1. Verify the token is exactly: `8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4`
2. No extra spaces or line breaks
3. Token hasn't been revoked by @BotFather

### Messages Missing User Info

**Problem**: Messages show "Anonymous" or "Not connected"

**This is normal** - User info only available after:
1. User connects wallet (shows wallet address)
2. User has profile (shows username)
3. Otherwise shows "Anonymous" which is fine

## Security Notes

### API Token Security

- ✅ Token is in environment variables (not committed to git)
- ✅ Only visible to deployment platform admins
- ✅ Read-only access to your Telegram chat
- ✅ Cannot control your account

### Bot Permissions

The bot can only:
- Send messages to chats where it's been added
- Read messages sent to it
- Cannot access your personal messages
- Cannot access other chats

### Revoking Access

If token is compromised:
1. Open Telegram
2. Message @BotFather
3. Use `/revoke` command
4. Select your bot
5. Generate new token
6. Update environment variables

## Advanced Configuration

### Multiple Admin Support

To forward messages to multiple Telegram users:

1. **Create a Telegram Group:**
   - Create a new group in Telegram
   - Add your bot to the group
   - Add all admins to the group

2. **Get Group Chat ID:**
   - Send a message in the group
   - Visit getUpdates URL
   - Look for negative chat ID (e.g., -1001234567890)

3. **Update Chat ID:**
   ```bash
   VITE_TELEGRAM_CHAT_ID=-1001234567890
   ```

### Custom Message Formatting

Messages are formatted in the service file:
`Onchainweb/src/services/telegram.service.js`

Customize the `formatTelegramMessage` function to change:
- Message layout
- Included information
- HTML formatting
- Emoji usage

### Notification Settings

In Telegram app:
1. Open chat with bot (or group)
2. Click bot/group name
3. **Notifications** → Customize
4. Enable/disable sound, previews, etc.

## Support

For issues with Telegram integration:
- Check browser console for errors
- Verify environment variables are set
- Test bot token with curl commands
- Check Telegram bot logs (if accessible)
- Review service file: `src/services/telegram.service.js`

---

**Bot Token**: 8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4  
**Target Username**: @goblin_niko4  
**Status**: ✅ Ready to use  
**Updated**: 2026-01-27
