# Master Admin Access - Quick Guide

## 🔐 Accessing Master Admin Dashboard

### Production URL
```
https://onchainweb.site/master-admin
```

### Local Development URL
```
http://localhost:5173/master-admin
```

---

## ✅ Prerequisites

Before you can access the master admin dashboard:

1. **Firebase Project Configured**
   - Firebase credentials set in `.env` file
   - Firestore Database enabled
   - Authentication enabled (Email/Password)

2. **Master Account Created**
   - User created in Firebase Console → Authentication
   - Email: `master@onchainweb.site` (or from VITE_ADMIN_ALLOWLIST)
   - Password: Set during account creation

3. **Admin Document Exists**
   - Document in Firestore → `admins` collection
   - Document ID: Firebase Auth UID (not email)
   - Fields required:
     ```json
     {
       "email": "master@onchainweb.site",
       "uid": "<firebase-auth-uid>",
       "role": "master",
       "permissions": ["all"],
       "createdAt": "2026-02-09T..."
     }
     ```

4. **Environment Variables Set**
   - `VITE_ENABLE_ADMIN=true`
   - `VITE_ADMIN_ALLOWLIST=master@onchainweb.site`

---

## 🚀 Login Steps

### Step 1: Navigate to Master Admin URL
Open your browser and go to:
- Production: `https://onchainweb.site/master-admin`
- Local: `http://localhost:5173/master-admin`

### Step 2: Enter Credentials
- **Username/Email:** `master@onchainweb.site`
- **Password:** Your secure password

### Step 3: Click "Sign In"
- Should see "Login successful!" message
- Dashboard loads with real-time data

---

## 🔍 Verification Checklist

If login fails, verify:

- [ ] Email is in `VITE_ADMIN_ALLOWLIST` environment variable
- [ ] User exists in Firebase Console → Authentication → Users
- [ ] User account is enabled (not disabled)
- [ ] Password is correct (minimum 8 characters)
- [ ] Admin document exists in Firestore → `admins` collection
- [ ] Admin document has `role: "master"`
- [ ] Admin document has `permissions: ["all"]`
- [ ] Admin document email field matches login email exactly
- [ ] `VITE_ENABLE_ADMIN=true` in environment variables

---

## 🛠️ Troubleshooting

### Error: "Invalid credentials or unauthorized user"

**Cause:** Email not in allowlist

**Fix:**
```bash
# Check .env file in Onchainweb directory
cd Onchainweb
grep VITE_ADMIN_ALLOWLIST .env

# Should show:
VITE_ADMIN_ALLOWLIST=master@onchainweb.site
```

---

### Error: "auth/user-not-found" or "auth/wrong-password"

**Cause:** Firebase Authentication issue

**Fix:**
1. Go to Firebase Console → Authentication → Users
2. Verify user with email `master@onchainweb.site` exists
3. If not, create the user:
   - Click "Add user"
   - Email: `master@onchainweb.site`
   - Set secure password
   - Save

---

### Login Succeeds But Redirects Back to Login

**Cause:** Admin document missing or incorrect

**Fix:**
1. Go to Firebase Console → Firestore Database
2. Navigate to `admins` collection
3. Find document where `email == "master@onchainweb.site"`
4. Verify document has correct structure:
   ```json
   {
     "email": "master@onchainweb.site",
     "uid": "<same-as-firebase-auth-uid>",
     "role": "master",
     "permissions": ["all"],
     "createdAt": "2026-02-09T..."
   }
   ```

---

### Error: "Admin features are disabled"

**Cause:** Admin feature flag not enabled

**Fix:**
```bash
# Edit .env file
VITE_ENABLE_ADMIN=true

# Restart dev server
npm run dev
```

---

## 📋 Quick Diagnostic

Run the diagnostic script to check everything:

```bash
cd /path/to/Snipe-
./diagnose-login.sh
```

This will check:
- ✅ Environment variables configured
- ✅ Firebase credentials present
- ✅ Admin allowlist set correctly
- ✅ Key files exist
- ✅ No code issues

---

## 🎯 What You Can Do as Master Admin

Once logged in, you have full platform control:

### User Management
- View all registered users
- Edit user profiles
- Manage user balances
- Approve/reject KYC documents
- Monitor user activity

### Financial Management
- Process deposit requests
- Approve withdrawal requests
- Adjust user balances
- View transaction history

### Trade Management
- Monitor active trades
- View trade history
- Access AI Arbitrage investments
- View trade statistics

### Admin Management
- Create new admin accounts
- Edit admin permissions
- Delete admin accounts
- View admin activity logs

### Customer Support
- View active customer service chats
- Reply to customer messages
- Manage support tickets

### System Monitoring
- Real-time data subscriptions
- Platform statistics
- Performance metrics

---

## 📞 Support

### Need Help?

1. **Check the documentation:**
   - [VERIFICATION_REPORT.md](./VERIFICATION_REPORT.md) - Complete verification details
   - [MASTER_ACCOUNT_LOGIN_FIX.md](./MASTER_ACCOUNT_LOGIN_FIX.md) - Technical login details
   - [ADMIN_FEATURES_REVIEW.md](./ADMIN_FEATURES_REVIEW.md) - Feature overview

2. **Run diagnostic tools:**
   ```bash
   ./diagnose-login.sh
   ./verify-master-login.sh
   ```

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Check Console tab for error messages
   - Look for Firebase or authentication errors

4. **Review Firebase Console:**
   - Verify project configuration
   - Check Authentication users
   - Review Firestore documents
   - Check security rules

---

## 🔒 Security Best Practices

1. **Use strong passwords:**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Don't reuse passwords

2. **Keep credentials secure:**
   - Never share master password
   - Don't commit passwords to git
   - Use environment variables for configuration

3. **Monitor access:**
   - Review Firebase Console regularly
   - Check for suspicious login attempts
   - Monitor admin activity logs

4. **Enable additional security:**
   - Consider enabling 2FA in Firebase
   - Use IP allowlisting if possible
   - Set up alerts for admin actions

---

## 📚 Additional Resources

- **Firebase Console:** https://console.firebase.google.com
- **Repository:** https://github.com/ddefi0175-netizen/Snipe-
- **Documentation:** Check `/docs` folder in repository

---

**Last Updated:** February 9, 2026  
**Version:** 1.0
