# 🚀 QUICK START GUIDE - Snipe Platform

**Get the platform running in 15 minutes!**

---

## Step 1: Install Dependencies (Already Done ✅)
```bash
cd backend && npm install      # Done
cd Onchainweb && npm install   # Done
```

---

## Step 2: Create Firebase Project (5 minutes)

### Quick Firebase Setup:
1. Go to https://console.firebase.google.com
2. Click **"Create a project"** → name it "snipe"
3. Click **"</> "** → Register web app
4. Copy the config values
5. In Firestore Database → **"Create database"** → Start in test mode
6. In Authentication → **"Get started"** → Enable Email/Password & Anonymous

---

## Step 3: Configure Environment Files (2 minutes)

### Backend Config (`backend/.env`)
```bash
# Generate secret (copy output)
openssl rand -base64 32

# Edit backend/.env and set:
JWT_SECRET=<paste-output-from-above>
MASTER_PASSWORD=MySecurePassword123!
```

### Frontend Config (`Onchainweb/.env`)
Paste your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=snipe.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=snipe-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=snipe-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Update Firebase Config (`.firebaserc`)
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

---

## Step 4: Deploy Firebase Rules (3 minutes)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only firestore:rules

# Check status
firebase list
```

---

## Step 5: Start Development Servers (2 minutes)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Should see: ✓ Server running on port 4000
```

### Terminal 2 - Frontend
```bash
cd Onchainweb
npm run dev
# Should see: ✓ Local: http://localhost:5173
```

### Terminal 3 - Open Browser
```bash
# Open in browser
open http://localhost:5173

# Or manually: http://localhost:5173
```

---

## ✅ Verify It's Working

In browser console, you should see:
```javascript
✓ Firebase initialized successfully
✓ Wallet provider loaded
✓ App ready
```

✅ You can now:
- Connect wallet
- View dashboard
- Test real-time updates
- Access admin panel (if configured)

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Firebase not initialized"
```bash
# Check .env is filled in
cat Onchainweb/.env | grep VITE_FIREBASE_API_KEY

# Should NOT be empty. If empty:
# 1. Open Firebase Console
# 2. Copy all Firebase credentials
# 3. Paste in Onchainweb/.env
# 4. Save & restart: npm run dev
```

### Issue: "Permission denied" errors
```bash
# Check Firestore rules
firebase deploy --only firestore:rules

# Make sure rules allow the operation
# Review firestore.rules file
```

### Issue: Wallet won't connect
```bash
# Make sure you have MetaMask or other wallet installed
# Check browser console for errors
# Try refreshing page and reconnecting
```

### Issue: Port already in use
```bash
# Kill process using port
# Backend (4000): lsof -ti:4000 | xargs kill -9
# Frontend (5173): lsof -ti:5173 | xargs kill -9

# Then restart npm run dev
```

---

## 📚 Full Documentation

- 📖 **Error Report**: See [ERROR_AUDIT_REPORT.md](ERROR_AUDIT_REPORT.md)
- 🔥 **Firebase Setup**: See [FIREBASE_SETUP_QUICK_START.md](FIREBASE_SETUP_QUICK_START.md)
- 📊 **Phase 1 Report**: See [PHASE_1_COMPLETION_REPORT.md](PHASE_1_COMPLETION_REPORT.md)

---

## 🎯 Next Steps After Running

1. ✅ Verify app loads at http://localhost:5173
2. ✅ Test wallet connection (MetaMask, etc.)
3. ✅ Check Firebase real-time updates work
4. ✅ Test admin login
5. ✅ Create your first trade

---

## 💡 Pro Tips

- Use **VS Code** with **Thunder Client** extension for API testing
- Enable browser DevTools console to see real-time logs
- Check **Firebase Console** for real-time data updates
- Use **Firebase Emulator** for local development: `firebase emulators:start`

---

## 🆘 Need Help?

If something doesn't work:

1. **Check logs** - Look for red error messages in terminal
2. **Check console** - Open browser DevTools (F12 → Console)
3. **Check .env** - Make sure all values are filled in (not empty)
4. **Check credentials** - Verify Firebase credentials are correct
5. **Restart** - Kill servers and run `npm run dev` again

---

**Estimated Setup Time**: 15 minutes  
**Current Status**: ✅ Dependencies installed, awaiting Firebase config  
**Go to**: https://console.firebase.google.com to complete setup
