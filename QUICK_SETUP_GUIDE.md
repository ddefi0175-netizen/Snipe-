# Quick Setup Guide - Master Account Login

**Goal**: Get master account login working in 5 minutes

---

## ⚡ Quick Start (5 Steps)

### Step 1: Run Diagnostic (1 min)
```bash
cd /home/runner/work/Snipe-/Snipe-
./diagnose-login.sh
```

This will show what's missing. Follow the output instructions.

---

### Step 2: Configure Environment (2 min)

Create `.env` file in `Onchainweb/` directory:

```bash
cd Onchainweb
nano .env
```

Add these variables (get values from Firebase Console):

```bash
# Enable admin features
VITE_ENABLE_ADMIN=true

# Master account email
VITE_ADMIN_ALLOWLIST=master@onchainweb.site

# Firebase configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# WalletConnect (optional for wallet features)
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-id
```

**Where to get Firebase values:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ (Settings) → Project settings
4. Scroll to "Your apps" section
5. Copy values from SDK setup

---

### Step 3: Create Master Account in Firebase (1 min)

#### Option A: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Authentication** (left sidebar)
3. Click **Users** tab
4. Click **Add user** button
5. Enter:
   - Email: `master@onchainweb.site`
   - Password: Your secure password (min 8 chars)
6. Click **Add user**

#### Option B: Using Setup Form
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/master-admin`
3. Fill in the setup form
4. Click "Create Master Account"

---

### Step 4: Create Firestore Document (30 sec)

1. In Firebase Console, click **Firestore Database**
2. Click **Start collection**
3. Collection ID: `admins`
4. Document ID: Use the UID from Authentication (copy from step 3)
5. Add fields:
   ```
   email (string): master@onchainweb.site
   uid (string): [paste UID from Authentication]
   role (string): master
   permissions (array): all
   createdAt (string): [current date/time]
   ```
6. Click **Save**

**Quick way to get UID:**
- Firebase Console → Authentication → Users
- Click on the user you just created
- Copy the "User UID" value

---

### Step 5: Test Login (30 sec)

```bash
# Start dev server
cd Onchainweb
npm run dev
```

Then:
1. Open browser: `http://localhost:5173/master-admin`
2. Enter email: `master@onchainweb.site`
3. Enter password: (from step 3)
4. Click "Sign In"
5. ✅ You should see the master dashboard!

---

## 🆘 Quick Troubleshooting

### "Cannot find module 'vite'"
```bash
cd Onchainweb
npm install
npm run dev
```

### "Firebase initialization error"
- Check `.env` file is in `Onchainweb/` directory (not root)
- Verify all Firebase variables are set
- Restart dev server

### "Invalid credentials"
- Check email is in `VITE_ADMIN_ALLOWLIST`
- Verify email matches Firebase Auth user
- Check password is correct

### "User not found"
- Verify user created in Firebase Authentication
- Check Firestore document exists in `admins` collection
- Verify document has `role: "master"`

### Still not working?
Run full diagnostic:
```bash
./diagnose-login.sh
```

---

## 🎯 Visual Checklist

```
Environment
  ✓ .env file in Onchainweb/
  ✓ VITE_ENABLE_ADMIN=true
  ✓ VITE_ADMIN_ALLOWLIST set
  ✓ Firebase variables set

Firebase Auth
  ✓ User created
  ✓ Email: master@onchainweb.site
  ✓ User enabled
  ✓ Password set

Firestore
  ✓ admins collection exists
  ✓ Document with correct email
  ✓ role: "master"
  ✓ permissions: ["all"]

Testing
  ✓ Dev server running
  ✓ Navigate to /master-admin
  ✓ Enter credentials
  ✓ Login successful
```

---

## 📋 One-Line Commands

```bash
# Full diagnostic
./diagnose-login.sh

# Quick environment check
./verify-master-login.sh

# Install dependencies
cd Onchainweb && npm install

# Start server
cd Onchainweb && npm run dev

# Check for code issues
grep -r "isFirebaseAvailable()" Onchainweb/src --include="*.js" --include="*.jsx"
```

---

## 🔗 Need More Help?

- **Full Guide**: `MASTER_LOGIN_TROUBLESHOOTING.md`
- **Technical Docs**: `MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md`
- **Quick Reference**: `MASTER_ACCOUNT_QUICK_REFERENCE.md`

---

**Estimated Time**: 5 minutes  
**Difficulty**: Easy  
**Required**: Firebase account

**Last Updated**: February 8, 2026
