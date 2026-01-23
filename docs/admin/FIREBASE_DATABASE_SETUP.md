# 🔐 Firebase & Database Configuration Guide

## ⚠️ Current Status

**Frontend**: ❌ Needs Firebase credentials
**Backend**: ⚠️ Using placeholder credentials
**Database**: ⚠️ No active connection

---

## 🎯 What You Need to Do

### Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create one if needed)
3. Click ⚙️ **Settings** → **Project Settings**
4. Find **"Your apps"** section
5. Click on your Web app
6. Copy the configuration values:

```javascript
{
  apiKey: "AIz...",                    // COPY THIS
  authDomain: "project.firebaseapp.com",  // COPY THIS
  projectId: "project-id",             // COPY THIS
  storageBucket: "project.appspot.com",  // COPY THIS
  messagingSenderId: "123456789",      // COPY THIS
  appId: "1:123:web:abc123",           // COPY THIS
  measurementId: "G-XXXXX"             // OPTIONAL
}
```

### Step 2: Update Frontend .env

Edit `Onchainweb/.env`:

```bash
# Replace with YOUR values from Firebase Console
VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXX
```

**Quick Copy Template**:

```bash
# Update these with your actual Firebase credentials
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Step 3: Update Backend .env (if needed)

Backend uses Firebase now, but if you want MongoDB fallback:

```bash
# DEPRECATED: MongoDB is now legacy
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/snipe

# IMPORTANT: Change these for production
JWT_SECRET=$(openssl rand -base64 32)  # Generate new secret
MASTER_USERNAME=admin                  # Change from 'master'
MASTER_PASSWORD=YourSecurePassword     # Strong password!
PORT=4000
```

### Step 4: Verify Configuration

Check if credentials are loaded correctly:

```bash
# Frontend - Check if variables are loaded
cd Onchainweb
npm run dev
# Open DevTools (F12) → Console
# Type: console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)
# Should show your project ID, not 'undefined'

# Backend - Check if Firebase is initialized
cd ../backend
npm run dev
# Look for: "Firebase initialized successfully" or "Backend running on port 4000"
```

### Step 5: Test Connection

```bash
# Test Firebase Authentication
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Should return success or user exists error (good sign)
# NOT "Firebase not available" (bad sign)
```

---

## 📋 Complete Checklist

### Frontend Setup

- [ ] Got Firebase credentials from Console
- [ ] Updated `Onchainweb/.env` with all 7 values
- [ ] Verified `VITE_FIREBASE_PROJECT_ID` is not undefined
- [ ] Dev server starts without errors
- [ ] Can see app loading at localhost:5173

### Backend Setup

- [ ] Created strong JWT_SECRET
- [ ] Changed MASTER_USERNAME from 'master'
- [ ] Changed MASTER_PASSWORD to something secure
- [ ] Set PORT=4000
- [ ] Backend starts without errors

### Firebase Project

- [ ] Created Firebase project (or have existing one)
- [ ] Enabled Email/Password authentication
- [ ] Created Firestore database
- [ ] Set security rules

### Database

- [ ] Firebase connection working
- [ ] Can write to Firestore
- [ ] Can read from Firestore
- [ ] Wallet authentication works

---

## 🚨 Common Issues & Fixes

### Issue - "Firebase not initialized" or "firebaseConfig error"

**Cause**: Missing/incorrect credentials in `.env`

**Fix**:

```bash
# 1. Double-check spelling in .env
# 2. Verify no extra spaces: VITE_FIREBASE_API_KEY=abc (not = abc)
# 3. Restart dev server after updating .env
# 4. Clear browser cache (Ctrl+Shift+Del)
```

### Issue - "Authentication failed" when trying to connect wallet

**Cause**: Firebase Auth not enabled or no credentials

**Fix**:

```bash
# 1. Go to Firebase Console → Authentication
# 2. Click "Get Started"
# 3. Enable "Email/Password"
# 4. Deploy Firestore rules (see below)
```

### Issue - "VITE_FIREBASE_API_KEY is undefined"

**Cause**: .env file not loaded or wrong location

**Fix**:

```bash
# 1. Verify .env is in Onchainweb/ directory (not backend/)
# 2. Restart dev server: npm run dev
# 3. Vite needs restart to load .env changes
```

### Issue: Backend keeps retrying MongoDB connection

**Cause**: MONGO_URI not set (expected with Firebase)

**Fix**: This is NORMAL. Backend should show:

```text
MongoDB connection failed (expected - using Firebase instead)
Backend running on port 4000
```

---

## 🔒 Security Notes

### For Development

```bash
# Use placeholder values
VITE_FIREBASE_API_KEY=AIz_SynpKP_placeholder
VITE_FIREBASE_PROJECT_ID=snipe-dev

# Master credentials can be simple
MASTER_USERNAME=admin
MASTER_PASSWORD=admin123
```

### For Production

```bash
# USE REAL CREDENTIALS FROM FIREBASE
# NEVER commit .env to Git

# Generate strong JWT secret:
openssl rand -base64 32

# Use environment variables, not .env files:
export VITE_FIREBASE_API_KEY=your_real_key
export MASTER_PASSWORD=$(openssl rand -base64 32)
```

### .gitignore (ensure these are never committed)

```text
.env
.env.local
.env.*.local
backend/.env
Onchainweb/.env
```

---

## 📄 File Locations

```
/workspaces/Snipe-/
├── backend/
│   └── .env              ← Backend config (JWT, master creds)
│
├── Onchainweb/
│   └── .env              ← Frontend config (Firebase credentials)
│
└── .firebaserc           ← Firebase project reference
```

---

## ✅ Validation Commands

```bash
# Check frontend Firebase setup
cd Onchainweb
grep VITE_FIREBASE .env

# Check backend auth setup
cd ../backend
grep -E 'JWT_SECRET|MASTER_' .env

# Test Firebase initialization
npm run dev
# Look for successful Firebase init message

# Test backend API
curl http://localhost:4000/api/health
# Should return: {"status":"ok"}
```

---

## 🚀 Next Steps

1. **Get Firebase credentials** from Console
2. **Update Onchainweb/.env** with real values
3. **Update backend/.env** with strong passwords
4. **Restart both dev servers**
5. **Test the connection** using validation commands above
6. **Verify app loads** and wallet connection works

---

## 📞 Need Help?

### If Firebase credentials are missing

1. Check email for Firebase project invite
2. Create new project: [https://console.firebase.google.com](https://console.firebase.google.com)
3. Add Web app to your project
4. Copy credentials to .env

### If still getting errors

1. Check browser DevTools (F12) → Console for errors
2. Check backend terminal for error messages
3. Verify .env files have no extra spaces
4. Restart dev servers after changes
5. Clear browser cache

---

**Status**: ⚠️ Configuration Required
**Priority**: HIGH - Required before testing wallet connection
**Time**: 5-10 minutes to complete
