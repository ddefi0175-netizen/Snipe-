# Master Account Password Setup Guide

## Overview

The master account is the highest-level administrator account with full platform control. This guide explains how to set up and manage the master account password.

## Quick Setup (3 Steps)

### Step 1: Enable Admin Features

Edit `Onchainweb/.env`:

```bash
# Enable admin routes
VITE_ENABLE_ADMIN=true
```

### Step 2: Create Master Account in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **"Add user"**
5. Create master account:
   - **Email**: `master@admin.onchainweb.app` (or `master@yourdomain.com`)
   - **Password**: Choose a strong password (min 6 characters)
   - Click **"Add user"**

### Step 3: Add Master to Allowlist

Edit `Onchainweb/.env`:

```bash
# Add master email to allowlist
VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app
```

**Done!** Restart the dev server and login at `/master-admin`

## Login Instructions

### Master Admin Login

1. Navigate to: `http://localhost:5173/master-admin` (or your production URL)
2. Enter credentials:
   - **Username**: `master` (the system will convert to `master@admin.onchainweb.app`)
   - **Password**: The password you set in Firebase Console
3. Click **"Login"**

**Alternative**: You can also use the full email address as username.

## Password Requirements

### Minimum Requirements
- **Length**: At least 6 characters (Firebase default)
- **Recommended**: 12+ characters with mix of:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*)

### Example Strong Passwords
```
MasterAdmin2026!Secure
Snipe@Platform#Admin99
TradingMaster$2026Pass
```

## Changing Master Password

### Method 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Find master account (`master@admin.onchainweb.app`)
5. Click the three dots (⋮) → **Reset password**
6. Enter new password → **Save**

### Method 2: Password Reset Email

1. Login to master dashboard
2. Use Firebase's password reset functionality
3. Check email for reset link
4. Set new password

### Method 3: Using Firebase SDK (Advanced)

```javascript
import { getAuth, updatePassword } from 'firebase/auth'

const auth = getAuth()
const user = auth.currentUser

if (user) {
  await updatePassword(user, 'newStrongPassword123!')
  console.log('Password updated successfully')
}
```

## Multiple Admin Accounts

You can create multiple admin accounts with different permission levels:

### Creating Additional Admins

Edit `Onchainweb/.env`:

```bash
# Multiple admin accounts (comma-separated)
VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app,admin1@admin.onchainweb.app,admin2@admin.onchainweb.app
```

Then create each account in Firebase Console with their own passwords.

### Admin vs Master Accounts

- **Master Account** (`master@...`):
  - Full platform control
  - Can create/delete other admins
  - Access to all settings
  - User management (all users)
  - Financial controls

- **Regular Admin** (other emails):
  - Permission-based access
  - Cannot create other admins
  - Limited to assigned functions
  - May have restricted user access

## Security Best Practices

### Password Security

1. **Never hardcode passwords** in `.env` or source code
2. **Use environment-specific passwords** (different for dev/staging/prod)
3. **Rotate passwords regularly** (every 90 days recommended)
4. **Use password managers** to generate and store passwords
5. **Enable 2FA** if available in your Firebase project

### Access Control

1. **Limit admin allowlist** to only necessary emails
2. **Use descriptive email addresses** (e.g., `master@admin.domain.com`)
3. **Audit admin actions** regularly via Firebase logs
4. **Remove inactive admins** from allowlist and Firebase

### Environment Variables

1. **Never commit `.env`** to version control
2. **Use `.env.example`** as template only
3. **Store production credentials** in Vercel/hosting platform
4. **Use different passwords** for each environment

## Troubleshooting

### Cannot Login

**Error**: "Admin account not found"
- **Solution**: Verify email exists in Firebase Console → Authentication
- Check email matches exactly (case-sensitive)
- Ensure email is in `VITE_ADMIN_ALLOWLIST`

**Error**: "Incorrect password"
- **Solution**: Reset password via Firebase Console
- Try password reset email
- Check for typos (passwords are case-sensitive)

**Error**: "This account is not authorized"
- **Solution**: Add email to `VITE_ADMIN_ALLOWLIST` in `.env`
- Restart dev server after changing `.env`
- Clear browser cache and try again

**Error**: "Firebase authentication is not configured"
- **Solution**: Check all Firebase env vars are set in `.env`
- Verify Firebase project is active
- Ensure Authentication is enabled in Firebase Console

### Forgot Password

1. Go to Firebase Console
2. Navigate to Authentication → Users
3. Find your account
4. Click ⋮ → "Reset password"
5. Enter new password manually

**Alternative**: Implement "Forgot Password" on login page using Firebase's `sendPasswordResetEmail()`

### Account Locked

If you see "Too many failed login attempts":
- **Wait**: 15-30 minutes for automatic unlock
- **Firebase Console**: Disable and re-enable the user account
- **Contact Support**: If issue persists

## Production Deployment

### Setting Master Password in Production

1. **Vercel/Netlify**:
   - Go to project settings → Environment Variables
   - Add `VITE_ENABLE_ADMIN=true`
   - Add `VITE_ADMIN_ALLOWLIST=master@admin.domain.com`
   - Redeploy

2. **Firebase Hosting**:
   - Set env vars in Firebase Console → Hosting → Environment Configuration
   - Or use `.env.production` (not committed to git)

3. **Create Master in Production Firebase**:
   - Switch to production Firebase project
   - Create master account with strong password
   - Document password in secure location (password manager)

### Post-Deployment Checklist

- [ ] Master account created in production Firebase
- [ ] Strong password set (12+ characters)
- [ ] Password stored in secure password manager
- [ ] `VITE_ENABLE_ADMIN=true` in production env
- [ ] `VITE_ADMIN_ALLOWLIST` configured in production env
- [ ] Test login on production URL
- [ ] Verify all master functions work
- [ ] Document backup/recovery procedure

## Advanced Configuration

### Custom Email Domain

Instead of `@admin.onchainweb.app`, use your own domain:

```bash
# In .env
VITE_ADMIN_ALLOWLIST=master@yourdomain.com,admin@yourdomain.com
```

Then create Firebase accounts with those emails.

### Programmatic Account Creation

For automated setups, use Firebase Admin SDK:

```javascript
const admin = require('firebase-admin')

admin.initializeApp()

// Create master account
await admin.auth().createUser({
  email: 'master@admin.onchainweb.app',
  password: 'SecurePassword123!',
  displayName: 'Master Admin'
})
```

### Custom Authentication Flow

To customize the login experience, modify:
- `src/components/MasterAdminDashboard.jsx` (master login UI)
- `src/components/AdminPanel.jsx` (admin login UI)
- `src/lib/adminAuth.js` (authentication utilities)

## Support

### Documentation
- [Admin Setup Guide](ADMIN_SETUP_GUIDE.md) - Complete admin system setup
- [Admin User Guide](ADMIN_USER_GUIDE.md) - Using admin features
- [Firebase Setup](FIREBASE_SETUP.md) - Firebase configuration

### Getting Help
- Check [GitHub Issues](https://github.com/ddefi0175-netizen/Snipe/issues)
- Review Firebase [Authentication Docs](https://firebase.google.com/docs/auth)
- Contact: ddefi0175@gmail.com

---

**Security Notice**: Never share master credentials publicly. Store passwords in secure password managers. Rotate credentials regularly. Monitor admin access logs.
