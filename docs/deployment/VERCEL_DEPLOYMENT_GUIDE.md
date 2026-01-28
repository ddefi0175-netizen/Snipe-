# Vercel Deployment Guide - onchainweb.site

## Prerequisites

1. **Vercel Account**: https://vercel.com/signup
2. **Firebase Project**: YOUR_FIREBASE_PROJECT_ID
3. **Domain**: onchainweb.site (already connected)

## Environment Variables

Set these in Vercel Dashboard:

### Required Firebase Variables:
```bash
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_PROJECT_ID.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
VITE_WALLETCONNECT_PROJECT_ID=42039c73d0dacb66d82c12faabf27c9b
```

### Admin Configuration:
```bash
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin
VITE_ADMIN_ALLOWLIST=master@onchainweb.site
```

### Optional: Telegram Integration (for customer service):
```bash
VITE_TELEGRAM_BOT_TOKEN=your-telegram-bot-token
VITE_TELEGRAM_CHAT_ID=your-telegram-chat-id
```

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

```bash
./deploy-vercel.sh
```

This will:
1. Validate configuration
2. Build application
3. Deploy Firestore rules
4. Deploy to Vercel
5. Provide master account setup instructions

### Option 2: Manual Deployment

1. **Deploy to Vercel:**
   ```bash
   cd Onchainweb
   vercel --prod
   ```

2. **Verify deployment:**
   - Visit: https://onchainweb.site
   - Check: https://onchainweb.site/master-admin

3. **Create master account:**
   - Navigate to: https://onchainweb.site/master-admin
   - Email: master@onchainweb.site
   - Password: [Generate secure password]

## Vercel Configuration

The build is configured in `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "cd Onchainweb && npm install && npm run build",
  "outputDirectory": "Onchainweb/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

This ensures:
1. Dependencies are installed before build
2. Build output goes to correct directory
3. SPA routing works correctly
4. Static assets are cached efficiently

## Setting Environment Variables in Vercel

### Via Vercel Dashboard:

1. Go to your Vercel project dashboard
2. Click on "Settings"
3. Navigate to "Environment Variables"
4. Add each variable with the value
5. Set for "Production, Preview, Development"

### Via Vercel CLI:

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Set environment variables
vercel env add VITE_FIREBASE_API_KEY production
# Enter: YOUR_FIREBASE_API_KEY_HERE

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Enter: YOUR_PROJECT.firebaseapp.com

# ... repeat for all variables
```

## Post-Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Deployment succeeded without errors
- [ ] App loads at https://onchainweb.site
- [ ] No console errors in browser
- [ ] "Connect Wallet" button appears
- [ ] MetaMask connection works
- [ ] WalletConnect QR code appears
- [ ] Mobile wallet connection works
- [ ] Admin panel accessible at /admin
- [ ] Master dashboard accessible at /master-admin
- [ ] Customer service chat working
- [ ] Telegram integration operational (if configured)

## Troubleshooting

### Build Fails with "Cannot resolve import"

**Problem**: Dependencies not installed

**Solution**: Vercel should automatically run `npm install`. Check `vercel.json`:
```json
{
  "buildCommand": "cd Onchainweb && npm install && npm run build",
  "outputDirectory": "Onchainweb/dist"
}
```

### WalletConnect Shows Error "Project ID Required"

**Problem**: `VITE_WALLETCONNECT_PROJECT_ID` not set or not available at build time

**Solution**:
1. Verify the environment variable is set in Vercel dashboard
2. Make sure it's set for "Production" environment
3. Redeploy the application

### Wallet Connection Button Does Nothing

**Causes & Solutions**:

1. **JavaScript Error**: Check browser console for errors
2. **Environment Detection**: Make sure you're testing in a supported browser
3. **Missing Dependencies**: Verify build logs show all packages installed

### Master Admin Route Not Working

**Causes & Solutions**:

1. **Environment Variable**: Verify `VITE_ENABLE_ADMIN=true` in Vercel
2. **Allowlist**: Check `VITE_ADMIN_ALLOWLIST` is set correctly
3. **SPA Routing**: Ensure `vercel.json` has the rewrite rule

## Customer Service & Telegram Integration

The customer service chat automatically forwards messages to Telegram in real-time when configured:

1. **Create Telegram Bot:**
   - Message @BotFather on Telegram
   - Use /newbot command
   - Get your bot token

2. **Get Chat ID:**
   - Message your bot
   - Visit: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   - Find your chat_id

3. **Set Environment Variables:**
   ```bash
   VITE_TELEGRAM_BOT_TOKEN=your-bot-token
   VITE_TELEGRAM_CHAT_ID=your-chat-id
   ```

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

Messages from the customer service popup will now appear in your Telegram chat in real-time, transparently to the user.

## Support

If you encounter issues:

1. Check build logs in Vercel dashboard
2. Check browser console for JavaScript errors
3. Verify all environment variables are set
4. Review [Master Account Setup Guide](../MASTER_ACCOUNT_SETUP.md)
5. Check [Firebase Implementation](../../BACKEND_REPLACEMENT.md)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [WalletConnect Cloud](https://cloud.walletconnect.com)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

**Last Updated**: 2026-01-27
**Deployment Platform**: Vercel
**Domain**: onchainweb.site
**Status**: ✅ Production Ready
