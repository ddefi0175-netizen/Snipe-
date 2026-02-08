# Master Account Login Troubleshooting Guide

**Last Updated**: February 8, 2026  
**Issue**: Users unable to login to master account

---

## 🔧 Issue Fixed

### Problem Identified
The login system was calling `isFirebaseAvailable()` as a function when it's actually exported as a **boolean constant** from `firebase.js`.

### Files Fixed
1. **Onchainweb/src/lib/adminAuth.js** (line 57)
   - Changed: `if (!isFirebaseAvailable())` 
   - To: `if (!isFirebaseAvailable)`

2. **Onchainweb/src/services/walletService.js** (3 locations)
   - Lines 16, 98, 116
   - Changed all `isFirebaseAvailable()` calls to `isFirebaseAvailable`

### Root Cause
The `firebase.js` file exports:
```javascript
export const isFirebaseEnabled = () => isFirebaseAvailable;
export { isFirebaseAvailable, ... };
```

`isFirebaseAvailable` is a **boolean**, not a function. The correct check is:
```javascript
// ✅ Correct
if (!isFirebaseAvailable) { }

// ❌ Wrong
if (!isFirebaseAvailable()) { }
```

---

## 🔍 How to Verify the Fix

### 1. Check Code Changes
Verify the fixes in these files:
```bash
# Check adminAuth.js
grep -n "isFirebaseAvailable" Onchainweb/src/lib/adminAuth.js

# Check walletService.js  
grep -n "isFirebaseAvailable" Onchainweb/src/services/walletService.js
```

Should show boolean checks (`isFirebaseAvailable`) not function calls (`isFirebaseAvailable()`).

### 2. Test Firebase Initialization
Run the verification script:
```bash
./verify-master-login.sh
```

### 3. Check Browser Console
Open browser console (F12) and look for:
- ✅ No "isFirebaseAvailable is not a function" errors
- ✅ Firebase initialization messages
- ✅ Login attempt logs

---

## 🚀 Login Steps After Fix

### Prerequisites
1. **Environment Variables Configured**
   ```bash
   VITE_ENABLE_ADMIN=true
   VITE_ADMIN_ALLOWLIST=master@onchainweb.site
   VITE_FIREBASE_API_KEY=your-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   # ... other Firebase vars
   ```

2. **Master Account Created in Firebase**
   - Firebase Console → Authentication → Users
   - User with email: `master@onchainweb.site` exists
   - User is enabled (not disabled)

3. **Firestore Document Exists**
   - Firestore Database → admins collection
   - Document where `email == "master@onchainweb.site"`
   - Fields: `role: "master"`, `permissions: ["all"]`

### Login Process
1. Navigate to: `https://onchainweb.site/master-admin`
2. Enter email: `master@onchainweb.site`
3. Enter password: (your secure password)
4. Click "Sign In"

### Expected Behavior
✅ Authentication flow:
1. Email checked against `VITE_ADMIN_ALLOWLIST`
2. Firebase authenticates credentials
3. Firestore queries admin document
4. Role verified as "master"
5. Access granted to dashboard

---

## 🐛 Common Issues & Solutions

### Issue 1: "isFirebaseAvailable is not a function"
**Status**: ✅ **FIXED** (this PR)

**Cause**: Calling `isFirebaseAvailable()` instead of checking `isFirebaseAvailable` boolean

**Solution**: Applied - code updated in adminAuth.js and walletService.js

---

### Issue 2: "Invalid credentials or unauthorized user"
**Cause**: Email not in `VITE_ADMIN_ALLOWLIST`

**Solution**:
1. Check `.env` file in `Onchainweb/` directory
2. Add email to allowlist:
   ```bash
   VITE_ADMIN_ALLOWLIST=master@onchainweb.site
   ```
3. Restart dev server: `npm run dev`

---

### Issue 3: "Firebase initialization error"
**Cause**: Missing or incorrect Firebase environment variables

**Solution**:
1. Run verification script: `./verify-master-login.sh`
2. Get Firebase config from Firebase Console:
   - Project Settings → General → Your apps
   - Copy SDK configuration
3. Update `.env` file in `Onchainweb/` directory
4. Restart server

---

### Issue 4: "User not found" or "Wrong password"
**Cause**: Master account not created in Firebase

**Solution**:
1. Go to Firebase Console → Authentication
2. Click "Add user"
3. Email: `master@onchainweb.site`
4. Password: Set secure password (min 8 chars)
5. Also create Firestore document:
   ```javascript
   Collection: admins
   Document ID: [Firebase Auth UID]
   Fields:
     email: "master@onchainweb.site"
     uid: "[Firebase Auth UID]"
     role: "master"
     permissions: ["all"]
     createdAt: [timestamp]
   ```

---

### Issue 5: Login succeeds but dashboard shows errors
**Cause**: Firestore admin document missing or incorrect

**Solution**:
1. Firebase Console → Firestore Database
2. Navigate to `admins` collection
3. Find document where `email == "master@onchainweb.site"`
4. Verify fields:
   - `role: "master"` (not "admin")
   - `permissions: ["all"]`
   - `uid` matches Firebase Auth UID

---

### Issue 6: Environment variables not loading
**Cause**: Wrong `.env` file location or needs restart

**Solution**:
1. Ensure `.env` is in `Onchainweb/` directory (not root)
2. File should start with `VITE_` prefix for Vite
3. Stop dev server: `Ctrl+C`
4. Restart: `npm run dev`
5. Hard refresh browser: `Ctrl+Shift+R`

---

## 🔬 Debug Checklist

Run through this checklist if login still fails:

### Browser Console Checks
- [ ] Open Developer Tools (F12)
- [ ] Check Console tab for errors
- [ ] Look for Firebase initialization logs
- [ ] Check Network tab for failed requests

### Environment Checks
- [ ] Run `./verify-master-login.sh`
- [ ] Verify `.env` file exists in `Onchainweb/`
- [ ] Check all Firebase vars are set
- [ ] Verify `VITE_ENABLE_ADMIN=true`
- [ ] Verify `VITE_ADMIN_ALLOWLIST` contains your email

### Firebase Console Checks
- [ ] Authentication → Users → Master email exists
- [ ] User is enabled (not disabled)
- [ ] Firestore → admins collection exists
- [ ] Admin document exists with correct email
- [ ] Document has `role: "master"`
- [ ] Document has `permissions: ["all"]`

### Code Checks
- [ ] No `isFirebaseAvailable()` function calls (should be boolean)
- [ ] Firebase initialized in `firebase.js`
- [ ] No syntax errors in console
- [ ] Latest code changes pulled

---

## 📊 Testing After Fix

### Quick Test
1. Clear browser cache and cookies
2. Navigate to `/master-admin`
3. Enter credentials
4. Should login successfully

### Full Test
1. Test login with correct credentials → ✅ Success
2. Test login with wrong password → ❌ Error message
3. Test login with non-allowlisted email → ❌ Error message
4. Test login without Firebase → ⚠️ Fallback to localStorage
5. Check admin dashboard loads → ✅ Dashboard visible

---

## 🔐 Security Notes

### Password Requirements
- Minimum 8 characters
- Firebase enforces strength requirements
- Use password manager for secure storage

### Email Requirements
- Must be valid email format
- Must be in `VITE_ADMIN_ALLOWLIST`
- Case-insensitive matching

### Access Control
- Only allowlisted emails can login
- Role must be "master" for master dashboard
- Permissions checked on each admin action

---

## 📞 Still Having Issues?

If login still fails after applying these fixes:

1. **Check Browser Console**
   - Look for specific error messages
   - Share error logs for debugging

2. **Verify Environment**
   - Run `./verify-master-login.sh`
   - Share output for analysis

3. **Check Firebase Status**
   - Verify Firebase project is active
   - Check Firebase Console for errors
   - Verify billing/quota limits

4. **Review Network**
   - Check internet connection
   - Verify firewall not blocking Firebase
   - Test from different network if possible

---

## 📚 Related Documentation

- **Master Account Domain**: `MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md`
- **Quick Reference**: `MASTER_ACCOUNT_QUICK_REFERENCE.md`
- **Executive Summary**: `MASTER_ACCOUNT_EXECUTIVE_SUMMARY.md`
- **Original Fix**: `MASTER_ACCOUNT_LOGIN_FIX.md`
- **Verification Tool**: `verify-master-login.sh`

---

**Fix Status**: ✅ Complete  
**Testing**: Ready  
**Deployment**: Safe to deploy
