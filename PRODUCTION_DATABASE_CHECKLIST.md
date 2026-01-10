# 🔐 Production Database Connection Checklist

**Last Updated**: January 10, 2026
**Status**: ⚠️ REQUIRES ATTENTION - Real credentials not configured
**Overall Health**: 4/11 checks passing (36%)

---

## 📊 Current Status Report

### Firebase Credentials Check
```
✅ Frontend .env file exists
❌ Firebase API Key - PLACEHOLDER DETECTED
❌ Firebase Project ID - PLACEHOLDER DETECTED
❌ Firebase Auth Domain - PLACEHOLDER DETECTED
❌ Storage Bucket - PLACEHOLDER DETECTED
❌ Messaging Sender ID - PLACEHOLDER DETECTED
❌ App ID - PLACEHOLDER DETECTED
❌ Measurement ID - PLACEHOLDER DETECTED
```

### Backend Configuration Check
```
✅ Backend .env file exists
❌ JWT Secret - DEFAULT PLACEHOLDER DETECTED
❌ Master Username - DEFAULT VALUE "master" (needs change)
❌ Master Password - PLACEHOLDER DETECTED
```

### Database Status Check
```
✅ Firebase project reference (.firebaserc) exists
❌ Firebase Project ID - PLACEHOLDER DETECTED (your-firebase-project-id)
✅ Firestore security rules file deployed
```

### Server Connectivity Check
```
❌ Backend server - NOT RUNNING on port 4000
❌ Frontend server - NOT RUNNING on port 5174
❌ Database connection - UNTESTABLE (servers offline)
```

---

## 🚨 Critical Issues Blocking Production

| Issue | Severity | Impact | Resolution |
|-------|----------|--------|-----------|
| No real Firebase credentials | 🔴 CRITICAL | App cannot authenticate users | Add real values from Firebase Console |
| Default JWT secret | 🔴 CRITICAL | Admin tokens can be forged | Generate strong JWT secret |
| Default master credentials | 🔴 CRITICAL | Anyone with docs can access admin | Change to unique strong password |
| Servers not running | 🟠 HIGH | Cannot test connection | Start backend & frontend servers |
| No .env values populated | 🟠 HIGH | App won't initialize | Copy real credentials to .env files |

---

## 🔧 What Needs to Be Done (In Priority Order)

### STEP 1: Get Real Firebase Credentials (5 min)

**Required**: Go to Firebase Console → https://console.firebase.google.com

1. **Select your Firebase Project**
   ```
   Project name: onchainweb-37d30 (or your project)
   Region: asia-east2
   ```

2. **Get Web App Configuration**
   ```
   Path: Project Settings (⚙️) → Your apps → Web app
   ```

3. **Copy these 7 values exactly**:
   - `VITE_FIREBASE_API_KEY` → API Key value
   - `VITE_FIREBASE_AUTH_DOMAIN` → Auth Domain (e.g., project.firebaseapp.com)
   - `VITE_FIREBASE_PROJECT_ID` → Project ID (e.g., onchainweb-37d30)
   - `VITE_FIREBASE_STORAGE_BUCKET` → Storage Bucket (e.g., project.appspot.com)
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` → Sender ID (10 digits)
   - `VITE_FIREBASE_APP_ID` → App ID (1:numbers:web:alphanumeric)
   - `VITE_FIREBASE_MEASUREMENT_ID` → Measurement ID (G-code)

---

### STEP 2: Update Frontend Credentials (2 min)

**File**: `Onchainweb/.env` (Lines 17-23)

```bash
# BEFORE (current placeholder state)
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# AFTER (with real values)
VITE_FIREBASE_API_KEY=AIzaSyD_real_api_key_here_32_chars_min
VITE_FIREBASE_AUTH_DOMAIN=onchainweb-37d30.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=onchainweb-37d30
VITE_FIREBASE_STORAGE_BUCKET=onchainweb-37d30.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:a1b2c3d4e5f6g7h8
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
```

**Verification**: No value should contain "YOUR_", "your-", or "XXXXXXXXXX"

---

### STEP 3: Update Backend Credentials (2 min)

**File**: `backend/.env` (Lines 26-28)

```bash
# BEFORE (current state)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
MASTER_USERNAME=master
MASTER_PASSWORD=YourSecurePasswordHere-ChangeThis!

# AFTER (with real values)
# Generate strong JWT: openssl rand -base64 32
JWT_SECRET=TmF0aW9uYWxMb2NrRW5nYXNlbWVudEFjY291bnRTZWN1cmVQYXNzd29yZEhhc2g=
MASTER_USERNAME=snipe_admin_prod_2025
MASTER_PASSWORD=Superstr0ng!@#$%^&*()_+-=[]{}|;:',.<>?/`~
```

**Requirements**:
- JWT_SECRET: Minimum 32 characters, cryptographically random
- MASTER_USERNAME: Unique, not "master" or "admin"
- MASTER_PASSWORD:
  - Minimum 16 characters
  - Mix of uppercase, lowercase, numbers, symbols
  - No dictionary words
  - Store securely (password manager)

---

### STEP 4: Update .firebaserc (1 min)

**File**: `.firebaserc` (Line 3)

```bash
# BEFORE
"default": "your-firebase-project-id"

# AFTER
"default": "onchainweb-37d30"
```

**Important**: Must match VITE_FIREBASE_PROJECT_ID exactly

---

### STEP 5: Restart Servers (1 min)

**Terminal 1 - Backend**:
```bash
cd /workspaces/Snipe-/backend
npm run dev
```

**Expected Output**:
```
✓ Server running on port 4000
✓ Firebase initialized with project: onchainweb-37d30
✓ Database connection: Active
```

**Terminal 2 - Frontend**:
```bash
cd /workspaces/Snipe-/Onchainweb
npm run dev
```

**Expected Output**:
```
✓ VITE v5.4.21 running at http://localhost:5174
✓ Firebase initialized
✓ WalletConnect loaded
```

---

### STEP 6: Validate Configuration (1 min)

**Run Validator**:
```bash
./validate-config.sh
```

**Expected Output** (after real credentials):
```
✅ Frontend .env file exists
✅ Firebase API Key configured
✅ Firebase Project ID configured
✅ Firebase Auth Domain configured
✅ Backend .env file exists
✅ JWT Secret configured
✅ Master Username configured
✅ Master Password configured
✅ Firebase project reference (.firebaserc)
✅ Firebase project ID set
✅ Firestore security rules file

✅ SUMMARY: 11 PASS / 0 FAIL
✅ All configuration checks passed!
```

---

### STEP 7: Test Database Connection (2 min)

**In Browser Console** (http://localhost:5174):
```javascript
// Check Firebase is initialized
console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)
// Should output: onchainweb-37d30 (NOT "your-firebase-project-id")

// Check auth module available
if (firebase && firebase.auth) {
  console.log('✅ Firebase Auth module available');
} else {
  console.log('❌ Firebase Auth module NOT available');
}
```

**In Terminal**:
```bash
# Test backend health
curl http://localhost:4000/api/health
# Expected: {"status":"ok","timestamp":"...","firebase":"initialized"}

# Test Firebase auth endpoint (example)
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"TestPassword123!@#"
  }'
# Expected: {"success":true,"uid":"...","message":"User registered"}
```

---

## 📋 Production Readiness Checklist

Use this before deploying to production:

```
PRE-DEPLOYMENT VERIFICATION

Firebase Credentials:
  ☐ VITE_FIREBASE_API_KEY is real (starts with AIza)
  ☐ VITE_FIREBASE_PROJECT_ID is real (not "your-")
  ☐ VITE_FIREBASE_AUTH_DOMAIN is real (ends with .firebaseapp.com)
  ☐ All 7 Firebase values populated in Onchainweb/.env
  ☐ .firebaserc PROJECT_ID matches Onchainweb/.env PROJECT_ID

Backend Security:
  ☐ JWT_SECRET is 32+ characters, no default words
  ☐ MASTER_USERNAME is changed from "master"
  ☐ MASTER_PASSWORD is 16+ chars with mixed case + symbols
  ☐ Backend .env never committed to git
  ☐ Environment variables use production provider (not .env)

Firestore Setup:
  ☐ Firestore rules deployed (firebase deploy --only firestore:rules)
  ☐ Firestore indexes created for common queries
  ☐ Firestore has backup enabled
  ☐ Firestore rules restrict public access

Server Status:
  ☐ Backend server starts without errors
  ☐ Frontend server hot-reloads successfully
  ☐ Wallet Connect initializes on page load
  ☐ No Firebase initialization warnings in console

Testing:
  ☐ All 9 unit tests pass: cd Onchainweb && npm test
  ☐ Can sign up new user via UI
  ☐ Can log in with registered credentials
  ☐ Can connect wallet (WalletConnect)
  ☐ Backend health check returns 200 OK
  ☐ Database write operations complete successfully

Security:
  ☐ No API keys in frontend code (using Vite VITE_ prefix)
  ☐ Firestore rules enforce authentication
  ☐ Rate limiting configured (on backend/server)
  ☐ HTTPS only in production
  ☐ CORS properly configured
  ☐ Master admin credentials stored in secure vault

Deployment:
  ☐ Environment variables set on deployment platform
  ☐ Build runs without warnings: npm run build
  ☐ Production build size acceptable (<5MB)
  ☐ No console errors in production build
  ☐ Database backups configured
  ☐ Error logging configured (Sentry/DataDog)
```

---

## 🚀 Production Deployment Commands

Once all checks pass, deploy with:

**Firebase Rules**:
```bash
firebase deploy --only firestore:rules
```

**Backend (Vercel/Railway/Heroku)**:
```bash
cd backend
vercel deploy --prod
# OR
railway up
# OR
git push heroku main
```

**Frontend (Vercel)**:
```bash
cd Onchainweb
vercel deploy --prod
```

---

## 📞 Troubleshooting

### "Firebase is not available" Error

**Cause**: VITE_FIREBASE_API_KEY still has placeholder value

**Fix**:
1. Check `Onchainweb/.env` line 17
2. Confirm it doesn't contain "YOUR_" or "XXXXXXXXXX"
3. Restart frontend: `npm run dev`

### "JWT verification failed"

**Cause**: JWT_SECRET in backend doesn't match frontend expectations

**Fix**:
1. Regenerate: `openssl rand -base64 32`
2. Update backend/.env line 26
3. Restart backend: `npm run dev`

### Port Already in Use

**Cause**: Previous server instance still running

**Fix**:
```bash
# Kill process using port
lsof -ti :4000 | xargs kill -9  # Backend
lsof -ti :5174 | xargs kill -9  # Frontend

# Then restart
npm run dev
```

### Database Connection Timeout

**Cause**: Firebase credentials invalid or network blocked

**Fix**:
1. Verify credentials in console.firebase.google.com
2. Check firewall allows outbound to googleapis.com
3. Verify project ID matches everywhere

---

## 📚 Reference Documentation

- [FIREBASE_DATABASE_SETUP.md](FIREBASE_DATABASE_SETUP.md) - Detailed Firebase guide
- [QUICK_FIREBASE_SETUP.md](QUICK_FIREBASE_SETUP.md) - 5-minute quick start
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) - Vercel-specific deployment
- [SECURITY.md](SECURITY.md) - Security best practices

---

## ✅ Next Steps

1. **Right now**: Get real Firebase credentials from console (5 min)
2. **Next**: Update both .env files with real values (3 min)
3. **Then**: Run `./validate-config.sh` to verify (1 min)
4. **Finally**: Start servers and test (2 min)

**Total time**: ~11 minutes to production-ready configuration

---

**Generated**: Snipe- Production Database Checklist
**Version**: 1.0
**Status**: Action Required ⚠️
