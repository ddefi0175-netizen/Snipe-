# 🚀 Quick Setup - Admin Login Fix

## The Problem

1. ❌ **"Valid email required"** - Firebase rejects `@admin.onchainweb.app`
2. ❌ **No user data in Firebase** - Firestore is empty

## The Solution (3 Steps)

### Step 1: Create Accounts with Real Emails

Go to: https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users

Click "Add user" and create:

**Option A: Use Gmail (Easiest)**
```
Email: master@gmail.com
Password: [your strong password]
```

**Option B: Use Firebase Domain**
```
Email: master@onchainweb-37d30.firebaseapp.com
Password: [your strong password]
```

**Option C: Use Your Domain**
```
Email: master@yourdomain.com
Password: [your strong password]
```

### Step 2: Update .env File

Edit `Onchainweb/.env`:

```env
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

(Use the actual emails you created)

### Step 3: Restart & Login

```bash
cd /workspaces/Snipe-/Onchainweb
npm run dev
```

Then login at:
- **Master**: http://localhost:5173/master-admin
- **Email**: `master@gmail.com` (full email address)
- **Password**: [the password you set]

---

## Automated Setup Script

Run this for guided setup:

```bash
bash setup-admin-complete.sh
```

This script will:
- ✅ Help you choose email format
- ✅ Guide you through Firebase Console
- ✅ Update .env automatically
- ✅ Restart dev server
- ✅ Open login page

---

## About "No User Data"

Firestore collections are created automatically when first data is written.

### To create test data:

1. Go to app: http://localhost:5173
2. Click "Connect Wallet"
3. Connect MetaMask
4. User data will appear in Firestore!

### Or add manually:

1. Go to: https://console.firebase.google.com/u/0/project/onchainweb-37d30/firestore/data
2. Start collection: `users`
3. Add document:
   ```
   Document ID: 0x1234567890abcdef
   Fields:
     wallet: "0x1234567890abcdef"
     balance: 1000
     points: 0
     createdAt: [Timestamp] now
   ```

---

## Common Errors

### "auth/invalid-credential"
**Cause**: Account doesn't exist or wrong password
**Fix**: Create account in Firebase Console (Step 1 above)

### "Account not authorized"
**Cause**: Email not in allowlist
**Fix**: Add email to `VITE_ADMIN_ALLOWLIST` in .env

### "Valid email required"
**Cause**: Using fake domain like `@admin.onchainweb.app`
**Fix**: Use real email (Gmail, your domain, or Firebase domain)

---

## Important Notes

⚠️ **MUST USE FULL EMAIL TO LOGIN**
- ✅ Login with: `master@gmail.com`
- ❌ Don't use: `master` (won't work with real emails)

⚠️ **FIREBASE REJECTS FAKE DOMAINS**
- ✅ `master@gmail.com`
- ✅ `master@yourdomain.com`
- ✅ `master@onchainweb-37d30.firebaseapp.com`
- ❌ `master@admin.onchainweb.app` (rejected!)

---

## Quick Commands

**Run automated setup:**
```bash
bash setup-admin-complete.sh
```

**Manually update .env:**
```bash
cd /workspaces/Snipe-/Onchainweb
nano .env
# Change: VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

**Restart dev server:**
```bash
cd /workspaces/Snipe-/Onchainweb
npm run dev
```

**Check dev server logs:**
```bash
tail -f /tmp/snipe-dev.log
```

---

## Need More Help?

📖 **Detailed Guide**: [FIX_ADMIN_LOGIN_ERROR.md](./FIX_ADMIN_LOGIN_ERROR.md)
🔧 **Admin Setup**: [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md)
🔥 **Firebase Docs**: https://firebase.google.com/docs/auth

---

**Last Updated**: January 11, 2026
