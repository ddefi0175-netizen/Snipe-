# 🚀 Snipe Configuration Guide - January 10, 2026

## Current Status

### Installed & Ready ✅
```
✅ Frontend (React + Vite)        - Ready to run
✅ Backend (Express + Node)        - Ready to run
✅ Firebase Setup                  - Configured
✅ Firestore Rules                 - Deployed
✅ WalletConnect Integration       - Configured
✅ VITE_WALLETCONNECT_PROJECT_ID   - Set (42039c73d0dacb66d82c12faabf27c9b)
```

### Missing (CRITICAL) ❌
```
❌ VITE_FIREBASE_API_KEY           - YOUR_FIREBASE_API_KEY_HERE
❌ VITE_FIREBASE_AUTH_DOMAIN       - your-project.firebaseapp.com
❌ VITE_FIREBASE_PROJECT_ID        - your-firebase-project-id
❌ VITE_FIREBASE_STORAGE_BUCKET    - your-project.appspot.com
❌ VITE_FIREBASE_MESSAGING_SENDER_ID - YOUR_MESSAGING_SENDER_ID
❌ VITE_FIREBASE_APP_ID            - YOUR_APP_ID_HERE
❌ VITE_FIREBASE_MEASUREMENT_ID    - G-XXXXXXXXXX
```

### Known Issues
```
⚠️ NPM Vulnerabilities: 2 moderate (non-critical)
   Fix with: npm audit fix
```

---

## ⏱️ 5-Minute Setup (RECOMMENDED)

### Step 1: Get Firebase Credentials (3 min)

1. Go to: **[https://console.firebase.google.com](https://console.firebase.google.com)**

2. Create or select your project

3. Navigate to **Settings ⚙️ → Project Settings**

4. Scroll to **"Your apps"** section

5. Click your **Web app** (or create one: `</> Web`)

6. Copy the config object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD_xxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6g7h8",
  measurementId: "G-ABCDEF1234"
};
```

### Step 2: Update Onchainweb/.env (1 min)

**File**: `Onchainweb/.env`

Replace lines 1-8 with your Firebase values:

```dotenv
VITE_FIREBASE_API_KEY=AIzaSyD_xxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:a1b2c3d4e5f6g7h8
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
VITE_WALLETCONNECT_PROJECT_ID=42039c73d0dacb66d82c12faabf27c9b
```

**⚠️ IMPORTANT**:
- No spaces around `=`
- Save the file
- Values must NOT contain "YOUR_" or "your-"

### Step 3: Start Frontend (1 min)

```bash
cd Onchainweb
npm run dev
```

**Expected Output:**
```
✓ Frontend built successfully
✓ Ready at http://localhost:5173
```

**Open in browser**: http://localhost:5173

---

## 🔄 Option 2: Full Stack (Optional - For Testing)

> **Note**: Firebase is the primary backend per v2.0.0
> MongoDB backend is deprecated but available for legacy deployments

### If you want to also run the backend:

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd Onchainweb
npm run dev
```

**Expected**:
```
Backend:  http://localhost:4000/api/health
Frontend: http://localhost:5173
```

---

## 🔐 Pre-Production Checklist

Before deploying to production, ensure:

- [ ] Firebase credentials are real (not placeholders)
- [ ] Environment variables are in `.env` (not committed to git)
- [ ] Firebase Authentication enabled
- [ ] Firestore Database created
- [ ] Security rules deployed
- [ ] WalletConnect integration tested

---

## 📋 File Locations

**Frontend Configuration**:
- Location: `Onchainweb/.env`
- Contains: 8 Firebase + WalletConnect values

**Backend Configuration** (Optional):
- Location: `backend/.env`
- Contains: JWT Secret, Master credentials, Firebase Project ID

**Firebase Project Reference**:
- Location: `.firebaserc`
- Contains: Project ID mapping

---

## ⚠️ Common Issues & Solutions

### "Cannot find Firebase config"
**Solution**: Ensure all 8 values in `Onchainweb/.env` are real (not placeholders)

### "Firebase is not initialized"
**Solution**:
1. Check `.env` file exists in `Onchainweb/`
2. Verify all VITE_FIREBASE_* values are set
3. Restart dev server: `npm run dev`

### "Port 5173 already in use"
**Solution**:
```bash
# Kill the process using port 5173
lsof -i :5173
kill -9 <PID>

# Or use different port
npm run dev -- --port 5174
```

### "npm audit fix - 2 vulnerabilities"
**Solution**:
```bash
cd Onchainweb
npm audit fix
```

### "backend/.env not found"
**Solution**:
```bash
cd backend
cp .env.example .env
# Then update with your values
```

---

## 🚀 Next Steps After Setup

### 1. Test Login
- Go to http://localhost:5173
- Try creating an account or logging in

### 2. Test Wallet Connection
- Click "Connect Wallet"
- Confirm WalletConnect modal appears

### 3. Test Data Sync
- Make changes in app
- Verify they appear in [Firebase Console](https://console.firebase.google.com)

### 4. Prepare for Deployment
- See [DEPLOYMENT.md](../DEPLOYMENT.md)
- See [VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md)

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| [FIREBASE_CREDENTIALS_REPORT.md](./FIREBASE_CREDENTIALS_REPORT.md) | Detailed credentials status |
| [DEPLOYMENT.md](../DEPLOYMENT.md) | Production deployment guide |
| [VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md) | Deploy to Vercel |
| [backend/SETUP_GUIDE.md](../backend/SETUP_GUIDE.md) | Backend setup details |

---

## 🆘 Need Help?

1. **Firebase not working?** → Check `Onchainweb/.env` has all 8 values
2. **Port conflicts?** → Use different port with `--port` flag
3. **Dependencies missing?** → Run `npm install` in affected directory
4. **Still stuck?** → Check browser console (F12) for error messages

---

**Last Updated**: January 10, 2026
**Status**: Ready for Firebase credentials
**Next**: Get credentials and update Onchainweb/.env
