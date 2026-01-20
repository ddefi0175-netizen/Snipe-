# Firebase Master Account Auto-Provisioning Guide

## Overview

This guide walks you through setting up the automatic provisioning system for the Snipe platform:

1. **Master Account** (one per production): Full system control, can create other admins
2. **Admin Accounts** (created by master): Role-based access, manage specific features
3. **User Auto-Provisioning**: Users auto-registered when they connect wallet
4. **Admin Auto-Detection**: Admins auto-logged in when they connect their registered wallet

---

## Step 1: Create Master Account in Firebase

### Via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **Authentication** → **Users**
3. Click **+ Create user**
4. Fill in:
   - **Email**: `master@admin.onchainweb.app` (or your domain)
   - **Password**: Strong password (min 8 chars, mix case + numbers)
5. Click **Create user**

### Via Firebase Admin SDK (Optional - for automation)

```javascript
// Run in Node.js with Firebase Admin SDK
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json')
});

const auth = admin.auth();

auth.createUser({
  email: 'master@admin.onchainweb.app',
  password: 'YourSecurePassword123!',
  displayName: 'Master Admin'
})
.then(user => console.log('Master created:', user.uid))
.catch(error => console.error('Error:', error));
```

---

## Step 2: Configure Environment Variables

Edit `Onchainweb/.env`:

```env
# Firebase config (get from Firebase Console > Project Settings)
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# WalletConnect (get from cloud.walletconnect.com)
VITE_WALLETCONNECT_PROJECT_ID=your-wc-project-id

# Admin feature enable & allowlist
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app,admin1@admin.onchainweb.app,admin2@admin.onchainweb.app
```

---

## Step 3: Login as Master

1. Start app: `cd Onchainweb && npm run dev`
2. Visit: `http://localhost:5173/master-admin`
3. Login:
   - **Username**: `master`
   - **Password**: (password you set in Firebase)

✅ You should see the Master Admin Dashboard

---

## Step 4: Create Admin Accounts from Master

Once logged in as master:

1. Go to **Admin Management** section
2. Click **+ Create New Admin**
3. Fill in:
   - **Username**: `admin1` (converts to `admin1@admin.onchainweb.app`)
   - **Email**: (optional, for external email)
   - **Password**: Strong password
   - **Permissions**: Select desired permissions
   - **User Access Mode**: `all` or `assigned`
   - **Wallet Address** (optional): For auto-login when wallet connects
4. Click **Create Admin**

The admin is now created in Firebase Auth and can login at `/admin` route.

---

## Step 5: Link Admin Wallet (Optional but Recommended)

This allows admins to auto-login when they connect their wallet.

**From Master Dashboard:**

1. Go to **Admin Management**
2. Find the admin you created
3. Click **Link Wallet**
4. Paste the admin's wallet address
5. Save

**Now when that admin connects their wallet on the public site, they'll be auto-redirected to admin dashboard!**

---

## Step 6: User Auto-Provisioning

Users are automatically registered when they:
1. Connect their wallet on the main site (`/`)
2. Are checked against the admin allowlist
3. If not admin, a new user entry is auto-created in localStorage with:
   - Unique ID
   - Wallet address
   - Default balance (0)
   - Default points (0)
   - Creation timestamp

No manual user creation needed!

---

## Workflow Summary

### New User Journey
```
User visits site → Clicks "Connect Wallet" → Wallet connects
    ↓
Check if wallet in admin allowlist?
    ├─ YES → Auto-redirect to /master-admin or /admin
    └─ NO → Auto-provision user in registeredUsers
```

### Admin Login Options
```
Option 1: Email/Password (at /master-admin or /admin)
   → Login with email + password set in Firebase Auth
   → Token stored in localStorage
   → Access admin dashboard

Option 2: Wallet Auto-Login (at /)
   → Connect wallet
   → Auto-check allowlist + wallet mapping
   → Auto-redirect to admin dashboard
   → Auto-create session (if wallet registered to admin)
```

---

## Testing the System

### Test 1: Master Account
```
1. Visit http://localhost:5173/master-admin
2. Enter username: master, password: [your password]
3. Should see full dashboard with all sections
```

### Test 2: Create Admin
```
1. As master, go to "Admin Management"
2. Create admin: username="testadmin", password="Test1234!"
3. In Firebase Console, verify user was created
4. Try login at /admin with credentials
```

### Test 3: Wallet Auto-Login
```
1. As master, copy testadmin's wallet address (or use any address)
2. Link wallet to testadmin in Admin Management
3. On public site (/), connect that wallet
4. Should auto-redirect to /admin dashboard
```

### Test 4: User Auto-Provisioning
```
1. Use different wallet address on public site
2. Connect wallet (without wallet being admin)
3. Check localStorage -> registeredUsers
4. Should see new user entry with that wallet
```

---

## Firebase Security Rules

Deploy proper Firestore security rules to prevent unauthorized access:

```bash
# From project root
firebase deploy --only firestore:rules
```

Key rules in `firestore.rules`:
- Users can only read their own data
- Admins can read/write users (based on permissions)
- No public write access to collections

---

## Troubleshooting

### "Firebase not available" error
- ✅ Check all 8 Firebase env vars are filled in `Onchainweb/.env`
- ✅ Restart dev server after changing .env
- ✅ Check Firebase project is active in Console

### Login fails with "invalid-credential"
- ✅ Verify user exists in Firebase Console > Authentication
- ✅ Check password is correct
- ✅ Confirm email format matches (with @admin.onchainweb.app)

### "Admin account not allowlisted" error
- ✅ Add email to `VITE_ADMIN_ALLOWLIST` in `.env`
- ✅ Email should match exactly what's in Firebase
- ✅ Restart dev server to pick up new allowlist

### Wallet auto-login not working
- ✅ Verify wallet is linked to admin in Master Dashboard
- ✅ Check wallet address matches exactly (case-insensitive)
- ✅ Open browser console for debug logs starting with `[ADMIN-DETECT]`

### Users not auto-provisioning
- ✅ Check if `isFirebaseAvailable` is true (not falling back to localStorage)
- ✅ Verify user isn't already registered (check localStorage)
- ✅ Check browser console for provisioning errors `[PROVISIONING]`

---

## Production Deployment

### Before Going Live

1. ✅ Create master account in production Firebase
2. ✅ Set `VITE_ADMIN_ALLOWLIST` with all admin emails
3. ✅ Create admin accounts for all admins in Firebase Auth
4. ✅ Link admin wallets to their accounts
5. ✅ Deploy Firestore security rules
6. ✅ Test login and user provisioning
7. ✅ Set `VITE_ENABLE_ADMIN=true` (if not already)

### Important Notes

- **Never commit `.env` to git** - it contains secrets
- **Keep master password secure** - this is full platform access
- **Backup Firebase credentials** - store in secure location
- **Use strong passwords** - min 12 characters recommended
- **Rotate admin passwords** - regularly via Firebase Console

---

## API Reference

### Provisioning Functions

**Check if wallet is admin:**
```javascript
import { checkWalletForAdminAccess } from './lib/adminProvisioning'

const result = await checkWalletForAdminAccess('0x1234...')
// Returns: { isAdmin, email, role }
```

**Link admin wallet:**
```javascript
import { registerAdminWallet } from './lib/adminProvisioning'

registerAdminWallet('admin@admin.onchainweb.app', 'admin', '0x1234...')
```

**Get all admin wallets:**
```javascript
import { getAdminWallets } from './lib/adminProvisioning'

const mappings = getAdminWallets()
// Returns: { '0x1234...': { email, role, createdAt } }
```

**Auto-provision user:**
```javascript
import { autoProvisionUser } from './lib/adminProvisioning'

const user = autoProvisionUser('0x1234...', { email: 'user@example.com' })
// Returns: new user object
```

---

## Security Best Practices

1. ✅ Use strong, unique master password
2. ✅ Enable Firebase Multi-Factor Authentication (MFA)
3. ✅ Regularly audit admin accounts in Firebase Console
4. ✅ Revoke unused admin wallets with `revokeAdminWallet()`
5. ✅ Use Firebase security rules (don't rely on allowlist alone)
6. ✅ Monitor admin activity logs
7. ✅ Use different passwords for master vs regular admins
8. ✅ Keep Firebase SDK and dependencies updated

---

## Support

For issues:
1. Check browser console for debug logs (`[LOGIN]`, `[PROVISIONING]`, `[ADMIN-DETECT]`)
2. Check Firebase Console > Logs
3. Verify env variables are set correctly
4. Test in incognito mode to avoid cache issues

---

**Last Updated**: January 2026
**Version**: 2.0 (Firebase Auto-Provisioning)
