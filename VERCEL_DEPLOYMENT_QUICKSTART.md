# Vercel Deployment - Quick Start Guide

## 🚀 Deployment in 5 Steps

### Prerequisites
- Vercel account
- Firebase project (YOUR_FIREBASE_PROJECT_ID)
- Domain: onchainweb.site

### Quick Deploy

```bash
# Run the automated deployment script
./deploy-vercel.sh
```

This will:
1. ✅ Validate configuration
2. 🏗️  Build application
3. 🔥 Deploy Firestore rules
4. 🚀 Deploy to Vercel
5. 👤 Show master account setup instructions

## Environment Variables for Vercel

Set these in Vercel Dashboard → Settings → Environment Variables:

### Firebase (Required)
```bash
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_PROJECT_ID.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

### WalletConnect (Required)
```bash
VITE_WALLETCONNECT_PROJECT_ID=42039c73d0dacb66d82c12faabf27c9b
```

### Admin (Required)
```bash
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin
VITE_ADMIN_ALLOWLIST=master@onchainweb.site
```

### Telegram Integration (Optional but Recommended)
```bash
VITE_TELEGRAM_BOT_TOKEN=8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4
VITE_TELEGRAM_CHAT_ID=[get-your-chat-id]
```

**To get your Telegram Chat ID:**
1. Message your bot in Telegram
2. Visit: https://api.telegram.org/bot8535105293:AAGb-LRbaX8cwlfI6W_TJnlw6Az09Cd6oJ4/getUpdates
3. Find `"chat":{"id":123456789}` in the response
4. Use that number as your VITE_TELEGRAM_CHAT_ID

## Master Account Setup

After deployment:

### Option 1: Automated (Recommended)
```bash
./setup-master-account-secure.sh
```

This generates a secure password and guides you through Firebase setup.

### Option 2: Manual
1. Generate secure password (16+ characters)
2. Go to Firebase Console → Authentication → Users
3. Click "Add user"
4. Email: `master@onchainweb.site`
5. Password: [your secure password]
6. Save to password manager
7. Login at: https://onchainweb.site/master-admin

## Features

### ✅ Auto User Registration
- Users automatically created in Firestore when wallet connects
- Includes: wallet address, balance, VIP level, points
- Updates last login timestamp
- Silent operation (no user interaction required)

### ✅ Telegram Customer Service
- Messages from customer service popup → Telegram (@goblin_niko4)
- Real-time, background forwarding
- User sees only the chat interface
- Includes user context (wallet, session ID, timestamp)

### ✅ Real-Time Admin Dashboard
- Firebase onSnapshot listeners (no polling)
- Live updates for users, deposits, withdrawals, trades
- Instant notifications
- Multi-device sync

### ✅ Secure Master Account
- No hardcoded passwords
- Secure password generation
- Firebase Auth integration
- Role-based permissions

## Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Run `./deploy-vercel.sh`
- [ ] Verify deployment at https://onchainweb.site
- [ ] Setup master account
- [ ] Test wallet connection
- [ ] Test customer service → Telegram
- [ ] Test admin dashboard real-time updates

## Documentation

- **Full Deployment Guide**: [docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)
- **Master Account Setup**: [MASTER_ACCOUNT_SETUP.md](MASTER_ACCOUNT_SETUP.md)
- **Telegram Integration**: [docs/TELEGRAM_CUSTOMER_SERVICE.md](docs/TELEGRAM_CUSTOMER_SERVICE.md)
- **Quick Start**: [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

## Troubleshooting

### Build Fails
```bash
cd Onchainweb
npm install
npm run build
```

### Environment Variables Not Working
- Ensure they're set for "Production" environment in Vercel
- Redeploy after adding new variables
- Check Vercel build logs

### Telegram Not Working
- Verify bot token is correct
- Get your chat ID from getUpdates URL
- Send a message to bot first
- Check browser console for errors

### Master Account Can't Login
- Verify email in VITE_ADMIN_ALLOWLIST
- Check Firebase Console → Authentication
- Clear browser cache and localStorage
- Ensure account exists in Firebase

## Support

- **Build Issues**: Check Vercel deployment logs
- **Firebase Issues**: Firebase Console logs
- **Telegram Issues**: Test with curl command (see docs)
- **Admin Issues**: Browser console + Firebase Authentication

## Next Steps

After successful deployment:

1. **Test Core Features**
   - Wallet connection (MetaMask, WalletConnect)
   - Customer service chat
   - Admin dashboard access

2. **Configure Telegram**
   - Get your chat ID
   - Update environment variable
   - Test message forwarding

3. **Create Additional Admins**
   - Login as master
   - Go to Admin Management
   - Create sub-admin accounts

4. **Monitor**
   - Vercel deployment health
   - Firebase usage
   - User registrations
   - Customer support messages

---

**Domain**: https://onchainweb.site  
**Admin**: https://onchainweb.site/master-admin  
**Master Email**: master@onchainweb.site  
**Telegram**: @goblin_niko4  
**Status**: ✅ Ready for Production
