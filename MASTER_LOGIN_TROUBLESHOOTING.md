# Master Account Login Troubleshooting Guide

## Overview

This guide helps you resolve common issues when logging into the master admin account. If you see console warnings or have trouble logging in, follow the steps below.

## Console Warnings (TronLink, Trust Wallet, etc.)

### Deprecation Warning: "tabReply will be removed"

**What you see:**
```
Deprecation warning: tabReply will be removed
(anonymous) @ content.js:1
reply @ content.js:1
...
injected.js:1 TronLink initiated
```

**What it means:**
- These warnings come from **browser wallet extensions** (TronLink, Trust Wallet, OKX Wallet, etc.)
- They inject code into web pages and use deprecated browser APIs
- **This is NOT a problem with your code or the Snipe platform**

**Solution:**
✅ **No action needed!** These warnings are automatically filtered in production and are harmless. They appear in development mode but don't affect functionality.

**Why do they show?**
- Wallet extensions inject JavaScript (`injected.js`, `content.js`) into every web page
- These extensions use older browser APIs that browsers are phasing out
- The extension developers need to update their code, not you

**To hide them completely in development:**
1. Disable the wallet extension temporarily
2. Or add to your `.env`:
   ```bash
   VITE_DEBUG_CONSOLE=false
   ```

---

## Master Account Login Issues

### Issue 1: "Admin account not found" or "Invalid credentials"

**Symptoms:**
- Error message: `Firebase: Error (auth/invalid-credential)`
- Error message: `Admin account not found`
- Cannot login with username "master"

**Root Cause:**
The master account doesn't exist in Firebase Authentication yet.

**Solution: Auto-Creation (Recommended)**

1. **Check your `.env` file:**
   ```bash
   # In Onchainweb/.env
   VITE_MASTER_PASSWORD=YourSecurePassword123!
   VITE_MASTER_EMAIL=master@admin.onchainweb.app
   VITE_ENABLE_ADMIN=true
   VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app
   ```

2. **Restart the dev server:**
   ```bash
   npm run dev
   ```

3. **Check the console for setup status:**
   - Look for: `[Master Setup] Master account created successfully`
   - Or look for errors explaining why auto-creation failed

4. **Try logging in:**
   - Navigate to: `http://localhost:5173/master-admin`
   - Username: `master`
   - Password: Your `VITE_MASTER_PASSWORD` value

**Solution: Manual Creation (If Auto-Creation Fails)**

1. **Go to Firebase Console:**
   - Open: https://console.firebase.google.com
   - Select your project (e.g., `onchainweb-37d30`)

2. **Navigate to Authentication:**
   - Click **"Authentication"** in the left sidebar
   - Click **"Users"** tab

3. **Add User:**
   - Click **"Add user"** button
   - Email: `master@admin.onchainweb.app`
   - Password: Same as your `VITE_MASTER_PASSWORD` (or create a new one)
   - Click **"Add user"**

4. **Verify:**
   - You should see the user in the list
   - Status should be "Enabled"

5. **Try logging in again**

---

### Issue 2: "Incorrect password" or "Wrong password"

**Symptoms:**
- Error message: `Firebase: Error (auth/wrong-password)`
- Master account exists but login fails

**Root Cause:**
The password in your `.env` file doesn't match the password in Firebase.

**Solution:**

**Option 1: Update .env to match Firebase**
1. Go to Firebase Console → Authentication → Users
2. Find `master@admin.onchainweb.app`
3. Remember the password you set (or reset it)
4. Update `.env`:
   ```bash
   VITE_MASTER_PASSWORD=TheCorrectPassword123!
   ```
5. Restart dev server

**Option 2: Reset password in Firebase**
1. Go to Firebase Console → Authentication → Users
2. Find `master@admin.onchainweb.app`
3. Click the three dots (⋮) → **"Reset password"**
4. Enter your `VITE_MASTER_PASSWORD` value
5. Click **"Save"**
6. Try logging in again

---

### Issue 3: "This account is not authorized for admin access"

**Symptoms:**
- Login succeeds but you're blocked from accessing admin features
- Error message: `This account is not authorized`

**Root Cause:**
The master email is not in the admin allowlist.

**Solution:**

1. **Update `.env` file:**
   ```bash
   VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app
   ```

2. **For custom email:**
   ```bash
   # If you used a different email
   VITE_ADMIN_ALLOWLIST=your-custom-email@domain.com
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

4. **Try logging in again**

---

### Issue 4: "Firebase authentication is not configured"

**Symptoms:**
- Error message: `Firebase not available`
- Error message: `Firebase authentication is not configured`

**Root Cause:**
Firebase environment variables are missing or incorrect.

**Solution:**

1. **Check all Firebase vars in `.env`:**
   ```bash
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FIREBASE_MEASUREMENT_ID=G-ABC123
   ```

2. **Get values from Firebase Console:**
   - Go to: https://console.firebase.google.com
   - Select your project
   - Click gear icon ⚙️ → **Project Settings**
   - Scroll to "Your apps" → Web app
   - Copy all configuration values

3. **Verify Environment**:
   ```bash
   # Restart dev server
   npm run dev
   ```

4. **Check console**:
   - Look for: `Firebase initialized successfully`
   - If you see errors, double-check your credentials

---

### Issue 5: "Too many failed login attempts"

**Symptoms:**
- Error message: `auth/too-many-requests`
- Account temporarily locked

**Root Cause:**
Firebase security has temporarily blocked login attempts after multiple failures.

**Solution:**

**Option 1: Wait (Recommended)**
- Wait 15-30 minutes for automatic unlock
- Firebase will reset the counter automatically

**Option 2: Reset in Firebase Console**
1. Go to Firebase Console → Authentication → Users
2. Find your account
3. Click three dots (⋮) → **"Disable user"**
4. Wait a few seconds
5. Click three dots (⋮) → **"Enable user"**
6. Try logging in again

---

## Quick Checklist

Before asking for help, verify:

- [ ] Firebase is initialized (`Firebase initialized successfully` in console)
- [ ] Master account exists in Firebase Console (Authentication → Users)
- [ ] Email is correct: `master@admin.onchainweb.app` (or your custom email)
- [ ] Password matches between `.env` and Firebase
- [ ] Email is in `VITE_ADMIN_ALLOWLIST` in `.env`
- [ ] `VITE_ENABLE_ADMIN=true` in `.env`
- [ ] Dev server was restarted after changing `.env`
- [ ] Browser cache is cleared (Ctrl+Shift+R or Cmd+Shift+R)
- [ ] Third-party wallet extension warnings are ignored (they're harmless)

---

## Advanced Troubleshooting

### Enable Firebase Email/Password Authentication

If you see `auth/operation-not-allowed`:

1. Go to Firebase Console
2. Navigate to **Authentication** → **Sign-in method**
3. Find **"Email/Password"**
4. Click the edit icon (✏️)
5. Enable **"Email/Password"** toggle
6. Click **"Save"**
7. Try creating the account again

### Check Firebase Logs

1. Go to Firebase Console
2. Navigate to **Authentication** → **Users**
3. Check the **"Events"** tab for recent activity
4. Look for failed login attempts or errors

### Clear Browser Data

Sometimes cached data causes issues:

1. Open DevTools (F12)
2. Right-click the refresh button
3. Click **"Empty Cache and Hard Reload"**
4. Or manually clear:
   - Application → Storage → Clear site data
   - Application → Local Storage → Delete items

### Network Issues

If auto-creation fails due to network:

1. Check your internet connection
2. Try disabling VPN temporarily
3. Check if Firebase is accessible:
   ```bash
   ping firebase.google.com
   ```
4. Try from a different network (mobile hotspot)

---

## Production Deployment

### Setting Up Master Account in Production

1. **Use strong password:**
   ```bash
   # Example: 16+ characters, mixed case, numbers, symbols
   VITE_MASTER_PASSWORD=MyVerySecurePass2026!@#$
   ```

2. **Create in production Firebase:**
   - Switch to production Firebase project
   - Create master account manually (recommended for production)
   - Store password in secure password manager

3. **Security best practices:**
   - Remove `VITE_MASTER_PASSWORD` from production `.env` after account creation
   - Use Firebase Console to manage passwords in production
   - Enable 2FA if available
   - Use unique strong passwords per environment
   - Rotate passwords every 90 days

---

## Still Having Issues?

### Get Help

1. **Check documentation:**
   - [MASTER_PASSWORD_SETUP.md](MASTER_PASSWORD_SETUP.md)
   - [ADMIN_SETUP_GUIDE.md](ADMIN_SETUP_GUIDE.md)
   - [FIREBASE_DATABASE_SETUP.md](FIREBASE_DATABASE_SETUP.md)

2. **Check Firebase docs:**
   - [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
   - [Common Authentication Errors](https://firebase.google.com/docs/auth/admin/errors)

3. **Contact support:**
   - Email: ddefi0175@gmail.com
   - GitHub Issues: https://github.com/ddefi0175-netizen/Snipe/issues

### When Reporting Issues

Include the following information:

- [ ] Exact error message (screenshot if possible)
- [ ] Console output (excluding sensitive data)
- [ ] Steps you've already tried
- [ ] Environment: Development or Production
- [ ] Node.js version: `node --version`
- [ ] npm version: `npm --version`
- [ ] Browser and version
- [ ] Whether master account exists in Firebase Console
- [ ] Whether you're using auto-creation or manual creation

**⚠️ DO NOT SHARE:**
- Your actual passwords
- Firebase API keys or credentials
- Private configuration details

---

## Summary

**Most common issues:**

1. **TronLink/wallet warnings** → Harmless, ignore them
2. **Account doesn't exist** → Create manually in Firebase Console
3. **Wrong password** → Update `.env` or reset in Firebase Console
4. **Not authorized** → Add email to `VITE_ADMIN_ALLOWLIST`
5. **Firebase not configured** → Check all `VITE_FIREBASE_*` environment variables

**Quick fix for "Still have issue login master":**

```bash
# 1. Verify .env has these:
VITE_MASTER_PASSWORD=YourPassword123!
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app

# 2. Create account in Firebase Console:
#    - Go to Authentication → Users → Add user
#    - Email: master@admin.onchainweb.app
#    - Password: Same as VITE_MASTER_PASSWORD

# 3. Restart and try:
npm run dev
# Navigate to http://localhost:5173/master-admin
# Login with: master / YourPassword123!
```

✅ **This should work!** If not, follow the detailed steps above.
