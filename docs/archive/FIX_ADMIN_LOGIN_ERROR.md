# 🔧 Fix Admin Login Error (auth/invalid-credential)

## Problem

When trying to login to Master or Admin accounts, you see:
```
Login failed: Firebase error (auth/invalid-credential)
```

## Root Cause

**The admin user accounts don't exist in Firebase Authentication yet.**

Firebase error `auth/invalid-credential` means:
- The email address doesn't exist in Firebase Authentication, OR
- The password is incorrect for that email

## Solution

You need to create the admin accounts in Firebase Console.

---

## 📋 Quick Fix (5 minutes)

### Step 1: Open Firebase Console

🌐 **URL**: https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users

1. Login with your Google account
2. You should see the Authentication → Users page

### Step 2: Choose Email Format

⚠️ **IMPORTANT**: Firebase rejects fake domains like `@admin.onchainweb.app`

You have 3 options:

**Option 1: Use Gmail (Recommended)**
```
master@gmail.com
admin@gmail.com
```

**Option 2: Use your own domain**
```
master@yourdomain.com
admin@yourdomain.com
```

**Option 3: Use Firebase Auth Domain**
```
master@onchainweb-37d30.firebaseapp.com
admin@onchainweb-37d30.firebaseapp.com
```

### Step 3: Create Master Account

1. Click **"Add user"** button (top right)
2. Enter:
   - **Email**: `master@gmail.com` (or your chosen email)
   - **Password**: Choose a strong password (e.g., `Master2026!Secure`)
3. Click **"Add user"**

✅ Master account created!

### Step 4: Create Admin Account (Optional)

1. Click **"Add user"** again
2. Enter:
   - **Email**: `admin@gmail.com` (or your chosen email)
   - **Password**: Choose a strong password (e.g., `Admin2026!Secure`)
3. Click **"Add user"**

✅ Admin account created!

### Step 5: Update .env File

Update your allowlist to match the emails you created:

```bash
cd /workspaces/Snipe-/Onchainweb
```

Edit `.env` file:
```env
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

(Use the actual emails you created in Firebase)

### Step 6: Restart Dev Server

```bash
npm run dev
```

### Step 7: Test Login

Now try logging in:

**Master Dashboard:**
- URL: http://localhost:5173/master-admin
- Username: `master@gmail.com` (full email address)
- Password: [the password you just created]

**Admin Dashboard:**
- URL: http://localhost:5173/admin
- Username: `admin@gmail.com` (full email address)
- Password: [the password you just created]

---

## 🎯 Verification

After creating accounts, you should see them in Firebase Console:

![Firebase Users List](https://i.imgur.com/example.png)

```
┌─────────────────────────────────────────┬──────────────┬──────────────┐
│ Identifier                               │ Providers    │ Created      │
├─────────────────────────────────────────┼──────────────┼──────────────┤
│ master@gmail.com                         │ Password     │ Just now     │
│ admin@gmail.com                          │ Password     │ Just now     │
└─────────────────────────────────────────┴──────────────┴──────────────┘
```

(Your emails will be whatever you created)

---

## 🔍 Understanding the System

### How Admin Login Works

1. **You enter email** (e.g., `master@gmail.com`)
2. **Firebase checks** if this email exists with that password
3. **If not found** → `auth/invalid-credential` error

### Email Format

⚠️ **IMPORTANT**: You MUST use the full email address to login.

The old system tried to convert usernames to emails (e.g., `master` → `master@admin.onchainweb.app`), but Firebase rejects fake domains.

**Use real email addresses:**
- ✅ `master@gmail.com`
- ✅ `admin@yourdomain.com`
- ✅ `master@onchainweb-37d30.firebaseapp.com`
- ❌ `master@admin.onchainweb.app` (Firebase will reject this)

### Allowed Emails

Check your `.env` file - only these emails can login:

```env
VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app,admin@admin.onchainweb.app
```

To add more admins:
1. Add their email to `VITE_ADMIN_ALLOWLIST`
2. Create their account in Firebase Console
3. Restart the dev server

---

## 🚨 About "No User Data in Firebase"

If you don't see any user data in Firestore:

### Why This Happens

1. **Users haven't registered yet**
   - Firestore collections are created automatically when first data is written
   - Until a user connects their wallet and uses the app, collections will be empty

2. **Check the right place**
   - Go to: https://console.firebase.google.com/u/0/project/onchainweb-37d30/firestore/data
   - Look for these collections:
     - `users` - User wallet data
     - `chatMessages` - Chat messages
     - `trades` - Trading data
     - `deposits` - Deposit records

3. **Test by connecting a wallet**
   - Go to your app: http://localhost:5173
   - Click "Connect Wallet"
   - Connect MetaMask or another wallet
   - This will create your first user record

### Creating Test Data

You can manually add a test user:

1. Go to Firestore Database
2. Click "Start collection"
3. Collection ID: `users`
4. Document ID: `0x1234567890abcdef` (fake wallet address)
5. Add fields:
   ```
   wallet: "0x1234567890abcdef"
   balance: 1000
   points: 0
   vipLevel: 0
   createdAt: [Timestamp] now
   ```
6. Click "Save"

Now you should see data in Firestore!

---

## ❓ Common Issues

### Issue 1: "Valid email required" in Firebase Console

**Cause**: Using fake domain like `@admin.onchainweb.app`

**Fix**: Use real email format:
- Gmail: `master@gmail.com`
- Your domain: `master@yourdomain.com`
- Firebase domain: `master@onchainweb-37d30.firebaseapp.com`

Then update `.env`:
```env
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

### Issue 2: "Account not authorized"

**Cause**: Email not in `VITE_ADMIN_ALLOWLIST`

**Fix**:
```env
# In Onchainweb/.env
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com,youremail@gmail.com
```

Then restart: `npm run dev`

### Issue 2: "Wrong password"

**Cause**: Password doesn't match what you set in Firebase

**Fix**:
1. Go to Firebase Console → Authentication → Users
2. Find the user
3. Click three dots (⋮) → "Reset password"
4. Enter new password
5. Try logging in again

### Issue 3: "Firebase not available"

**Cause**: Firebase credentials missing in `.env`

**Fix**: Check your `.env` has all these variables:
```env
VITE_FIREBASE_API_KEY=AIzaSyA56Pq_WcE6TehQDayLTZ0ibCHCwZkUUlw
VITE_FIREBASE_AUTH_DOMAIN=onchainweb-37d30.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=onchainweb-37d30
VITE_FIREBASE_STORAGE_BUCKET=onchainweb-37d30.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=766146811888
VITE_FIREBASE_APP_ID=1:766146811888:web:a96012963dffe31508ef35
```

---

## 🚀 Automated Scripts

### Interactive Setup Guide

```bash
bash create-admin-accounts.sh
```

This script walks you through creating accounts step-by-step.

### Verify Accounts (Requires Firebase Admin SDK)

```bash
npm install firebase-admin
node verify-admin-accounts.js
```

Note: Requires `serviceAccountKey.json` from Firebase Console.

---

## 📝 Security Best Practices

### Strong Passwords

Use passwords with:
- At least 12 characters
- Mix of uppercase and lowercase
- Numbers and special characters
- Example: `Snipe2026!@MasterAdmin`

### Password Management

1. **Don't commit passwords to git**
2. **Use a password manager**
3. **Different password for each account**
4. **Change passwords regularly**

### Firestore Security Rules

Make sure your `firestore.rules` protects admin data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated admins can read/write
    match /admins/{adminId} {
      allow read, write: if request.auth != null &&
        request.auth.token.email.matches('.*@admin.onchainweb.app');
    }
  }
}
```

---

## 🎓 Additional Resources

- [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md) - Complete admin setup
- [MASTER_PASSWORD_SETUP.md](./MASTER_PASSWORD_SETUP.md) - Master account details
- [FIREBASE_ADMIN_IMPLEMENTATION.md](./FIREBASE_ADMIN_IMPLEMENTATION.md) - Technical implementation
- [Firebase Auth Docs](https://firebase.google.com/docs/auth) - Official documentation

---

## 📞 Still Having Issues?

If you're still seeing the error after creating accounts:

1. **Clear browser cache and cookies**
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete

2. **Check browser console** (F12)
   - Look for Firebase errors
   - Share error messages for better help

3. **Verify Firebase project is active**
   - Check billing (if using paid features)
   - Ensure Authentication is enabled

4. **Test with different browser**
   - Try incognito/private mode
   - Disable browser extensions

---

## ✅ Success Checklist

After following this guide, you should have:

- [ ] Master account created in Firebase Console
- [ ] Admin account created in Firebase Console (optional)
- [ ] Both accounts visible in Firebase Authentication → Users
- [ ] Passwords saved securely
- [ ] Can login to master dashboard successfully
- [ ] Can login to admin dashboard successfully
- [ ] No more `auth/invalid-credential` errors

---

**Last Updated**: January 11, 2026
**Maintained By**: Snipe Development Team
