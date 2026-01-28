# 🔥 Admin Login Quick Fix Guide

> **TL;DR:** Admin accounts must exist in Firebase Console AND be in the allowlist.

---

## 🚨 Most Common Errors

### 1. "Email not in admin allowlist"

**What happened:** You tried to login but your email isn't authorized.

**Fix in 2 steps:**

```bash
# 1. Edit Onchainweb/.env
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com,YOUR_EMAIL_HERE

# 2. Restart server
npm run dev
```

---

### 2. "Admin account not found in Firebase"

**What happened:** Firebase doesn't have this user account yet.

**Fix in 3 steps:**

1. Go to: https://console.firebase.google.com
2. Navigate to: **Authentication → Users**
3. Click **"Add user"** and create account with the email from allowlist

---

### 3. "Firebase authentication is not configured"

**What happened:** Missing Firebase credentials in `.env` file.

**Fix:**

```bash
# Copy the example file
cd Onchainweb
cp .env.example .env

# Edit .env and add Firebase credentials
# Get them from: Firebase Console → Project Settings → Web app
nano .env
```

---

## ✅ Quick Setup Checklist

- [ ] **Step 1:** Firebase credentials in `Onchainweb/.env`
- [ ] **Step 2:** Email added to `VITE_ADMIN_ALLOWLIST` in `.env`
- [ ] **Step 3:** Account created in Firebase Console
- [ ] **Step 4:** Dev server restarted (`npm run dev`)
- [ ] **Step 5:** Login with FULL email address (e.g., `master@gmail.com`)

---

## 🎯 Working Example

### .env Configuration

```env
# Enable admin
VITE_ENABLE_ADMIN=true

# Firebase (copy from Firebase Console)
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_PROJECT_ID.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

# Allowlist (MUST use real emails)
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

### Firebase Console Setup

1. Create user: `master@gmail.com`
2. Set password: `Master2026!Secure` (example)
3. Create user: `admin@gmail.com`
4. Set password: `Admin2026!Secure` (example)

### Login

- URL: http://localhost:5173/master-admin
- Username: `master@gmail.com` (full email)
- Password: `Master2026!Secure`

✅ **Should work!**

---

## 🆘 Emergency Troubleshooting

### Nothing Works?

```bash
# 1. Clear everything
rm -rf Onchainweb/node_modules
rm Onchainweb/.env

# 2. Start fresh
cd Onchainweb
cp .env.example .env
nano .env  # Add Firebase credentials
npm install
npm run dev

# 3. Verify Firebase Console has accounts

# 4. Try login again
```

---

## 📞 Get Help

If still stuck:

1. Check browser console (F12) for errors
2. Read: [ADMIN_LOGIN_SETUP.md](./ADMIN_LOGIN_SETUP.md)
3. Read: [FIX_ADMIN_LOGIN_ERROR.md](./FIX_ADMIN_LOGIN_ERROR.md)

---

**Key Rule:** Email must be in BOTH Firebase Console AND .env allowlist!
