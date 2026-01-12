# Master Account Login Error - Quick Fix

## Problem

Getting `Firebase: Error (auth/invalid-credential)` when trying to login as master.

## Root Cause

The master account doesn't exist in Firebase Authentication yet. The auto-creation from `VITE_MASTER_PASSWORD` may not have run or failed silently.

## Solution

Create the master account manually in Firebase Console:

### Step 1: Go to Firebase Console

1. Open https://console.firebase.google.com
2. Select your project: **onchainweb-37d30**
3. Navigate to **Authentication** → **Users**

### Step 2: Create Master Account

1. Click **"Add user"** button
2. Fill in the details:
   - **Email**: `master@admin.onchainweb.app`
   - **Password**: Use the password from your `VITE_MASTER_PASSWORD` in .env file
     - Or create a strong password (12+ characters, mix of uppercase, lowercase, numbers, symbols)
3. Click **"Add user"** to save

### Step 3: Test Login

1. Go back to your app: `/master-admin`
2. Login with:
   - Username: `master`
   - Password: The same password you used in Step 2
3. Should work now! ✅

## Why Did This Happen?

The auto-creation feature tries to create the account automatically when the page loads, but it can fail if:

1. **Firebase limits**: New accounts might need email verification
2. **Network issues**: Auto-creation request failed
3. **Timing**: Component loaded before Firebase initialized
4. **First-time setup**: Firebase project security settings

## Alternative: Use Different Password

If you already created the master account with a different password:

1. Either update `VITE_MASTER_PASSWORD` in `.env` to match your Firebase password
2. Or just use the password you set in Firebase Console

## Verify Account Created

After creating the account, you should see it in Firebase Console:
- Go to Authentication → Users
- Look for: `master@admin.onchainweb.app`
- Status: Should be "Enabled"

## Next Steps

Once login works:
1. ✅ Test all admin features
2. ✅ Deploy Firestore rules: `firebase deploy --only firestore:rules`
3. ✅ For production security: Consider removing `VITE_MASTER_PASSWORD` from .env after verifying the account exists in Firebase. You can then login with the password set in Firebase Console.

---

**Quick Summary**: Create the master account manually in Firebase Console, then login will work.
