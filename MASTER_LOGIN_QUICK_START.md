# Master Account Login - Quick Start Guide

## What Was Fixed
The master account login was failing because admin documents were stored with Firebase Auth UIDs as document IDs, but the lookup code was trying to find them using email addresses. This has been fixed!

## How to Login as Master Account

### Step 1: Set Up Environment Variable
In your `.env` file, add:
```bash
VITE_ADMIN_ALLOWLIST=your-email@domain.com
```

You can use ANY email domain - it doesn't need to start with "master@" anymore!

Examples:
- `admin@mycompany.com`
- `john.doe@gmail.com`  
- `boss@example.org`

### Step 2: Create Master Account (One-Time Setup)

#### Option A: Automatic Setup (Recommended)
1. Visit `/master-admin` in your browser
2. If no master account exists, you'll see the setup screen
3. Enter your email (must match VITE_ADMIN_ALLOWLIST)
4. Enter a secure password (min 8 characters)
5. Click "Create Master Account"

#### Option B: Manual Firebase Setup
1. Go to Firebase Console → Authentication
2. Click "Add user"
3. Enter email: `your-email@domain.com`
4. Set password
5. Go to Firestore → Create collection: `admins`
6. Create document with ID = the Firebase Auth UID
7. Add fields:
   - `email`: your-email@domain.com
   - `uid`: (same as document ID)
   - `role`: master
   - `permissions`: ["all"]
   - `createdAt`: (current timestamp)

### Step 3: Login
1. Go to `/master-admin`
2. Enter your email
3. Enter your password
4. Click "Login"
5. You should now see the master admin dashboard!

## Troubleshooting

### "Invalid credentials or unauthorized user"
- Check that your email is in `VITE_ADMIN_ALLOWLIST`
- Make sure there are no extra spaces in the .env file
- Emails are case-insensitive

### "Admin account not found"
- Make sure the master account was created in Firebase Auth
- Check that the Firestore `admins` document exists
- Verify the document has `role: 'master'` field
- The document ID should be the Firebase Auth UID, not the email

### "User is not a master admin"
- Check the `role` field in the Firestore admin document
- It must be exactly: `"master"` (lowercase)

### Still Having Issues?
1. Open browser console (F12) and check for errors
2. Verify Firebase configuration is correct
3. Check that Firestore is enabled in production mode
4. Make sure security rules allow reading/writing to `admins` collection

## Security Notes

### Email Allowlist
- Only emails in `VITE_ADMIN_ALLOWLIST` can login as admin/master
- Multiple emails can be added: `email1@domain.com,email2@domain.com`
- Changes to allowlist require app restart

### Master vs Regular Admin
- **Master** (`role: 'master'`): Full access to all features
- **Regular Admin** (`role: 'admin'`): Limited access based on permissions

### Permissions
Master accounts typically have `permissions: ["all"]` which grants full access.

Regular admins can have specific permissions like:
- `manageUsers`
- `manageBalances`
- `manageKYC`
- `manageTrades`
- etc.

## What Changed in the Fix

### Before (Broken)
```javascript
// Tried to find document by email as ID
doc(db, 'admins', 'email@domain_com') // ❌ Document not found
```

### After (Fixed)
```javascript
// Queries by email field
query(collection(db, 'admins'), where('email', '==', 'email@domain.com')) // ✅ Found!
```

## Related Files
- `Onchainweb/src/services/adminService.js` - Admin database operations
- `Onchainweb/src/lib/adminAuth.js` - Admin authentication logic
- `Onchainweb/src/components/MasterAdminDashboard.jsx` - Master dashboard UI
- `MASTER_ACCOUNT_LOGIN_FIX.md` - Detailed technical documentation

## Need More Help?
See `MASTER_ACCOUNT_LOGIN_FIX.md` for detailed technical information about the fix.
