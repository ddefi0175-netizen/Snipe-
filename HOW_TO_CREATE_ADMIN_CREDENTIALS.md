# How to Create and Manage Admin Credentials

## ⚠️ SECURITY NOTICE
This document explains how to **create your own** admin credentials. There are no default passwords - you must set them up yourself.

---

## Current System Architecture

The Snipe platform uses **Firebase Authentication** as its primary backend (as of v2.0+). The legacy MongoDB/Express backend is deprecated.

---

## Step-by-Step: Creating Admin Accounts

### 1. Prerequisites

Ensure your environment is configured:

**File**: `Onchainweb/.env`
```dotenv
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

⚠️ **Important**: 
- Use REAL email addresses (Gmail, your domain, etc.)
- Multiple emails separated by commas
- No spaces between entries

---

### 2. Create Admin Account in Firebase

#### Option A: Using Firebase Console (Recommended)

1. **Go to Firebase Console**
   - URL: https://console.firebase.google.com
   - Select your project: `YOUR_FIREBASE_PROJECT_ID` (or your project)

2. **Navigate to Authentication**
   - Click **"Authentication"** in left sidebar
   - Click **"Users"** tab
   - Click **"Add User"** button

3. **Create the User**
   - **Email**: `master@gmail.com` (or email from your allowlist)
   - **Password**: Choose a strong password (16+ characters recommended)
   - Click **"Add User"**

4. **Save Your Credentials**
   ```
   Email: master@gmail.com
   Password: [Your secure password]
   ```
   
   ⚠️ **CRITICAL**: Store these credentials securely
   - Use a password manager (1Password, LastPass, Bitwarden)
   - Never commit credentials to git
   - Never share credentials via email/chat

---

#### Option B: Using Firebase CLI

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create user programmatically
firebase auth:import users.json --project YOUR_FIREBASE_PROJECT_ID
```

**users.json** example:
```json
{
  "users": [
    {
      "localId": "master123",
      "email": "master@gmail.com",
      "emailVerified": true,
      "passwordHash": "your-hashed-password",
      "salt": "your-salt",
      "createdAt": "1234567890000",
      "lastLoginAt": "1234567890000"
    }
  ]
}
```

---

### 3. Configure Admin Allowlist

**File**: `Onchainweb/.env`

Add your admin email(s) to the allowlist:

```dotenv
# Single admin
VITE_ADMIN_ALLOWLIST=master@gmail.com

# Multiple admins
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com,support@gmail.com
```

**Email Matching Rules**:
- Emails starting with `master@` or `master.` → **Master role** (full access)
- Other emails → **Admin role** (limited permissions)

---

### 4. Login to Admin Dashboard

#### Master Admin Login:
- **URL**: `http://localhost:5173/master-admin` (dev) or `https://www.onchainweb.app/master-admin` (prod)
- **Username**: `master@gmail.com` (or your master email)
- **Password**: [Password you set in Firebase Console]

#### Regular Admin Login:
- **URL**: `http://localhost:5173/admin` (dev) or `https://www.onchainweb.app/admin` (prod)
- **Username**: `admin@gmail.com` (or your admin email)
- **Password**: [Password you set in Firebase Console]

---

## Admin Roles and Permissions

### Master Account
- **Role**: `master`
- **Permissions**: ALL
- **Capabilities**:
  - ✅ Full user management
  - ✅ Create/delete other admins
  - ✅ Financial controls (deposits, withdrawals, balances)
  - ✅ Trading controls
  - ✅ System settings
  - ✅ View all logs and reports

### Admin Account
- **Role**: `admin`
- **Permissions**: Configurable (default subset)
- **Default Capabilities**:
  - ✅ View/manage users
  - ✅ Manage balances
  - ✅ Manage KYC
  - ✅ Manage trades
  - ✅ View reports
  - ❌ Create admins (master only)
  - ❌ System settings (master only)

---

## Security Best Practices

### Password Requirements
- Minimum 8 characters (16+ recommended)
- Include uppercase, lowercase, numbers, special characters
- Never reuse passwords from other services
- Rotate passwords every 90 days

### Account Security
```bash
✅ DO:
- Use a password manager
- Enable Firebase 2FA (if available)
- Use unique passwords per admin
- Log out after each session
- Monitor admin activity logs
- Restrict allowlist to specific emails

❌ DON'T:
- Share admin credentials
- Use weak passwords (e.g., "password123")
- Commit credentials to git
- Store passwords in plain text
- Use same password for multiple accounts
- Add wildcards to allowlist (e.g., *@gmail.com)
```

---

## Resetting Admin Password

### Method 1: Firebase Console
1. Go to Firebase Console → Authentication → Users
2. Find the admin user by email
3. Click the three dots menu → **"Reset Password"**
4. Firebase will send a password reset email
5. Follow the link to set a new password

### Method 2: Firebase Auth SDK
```javascript
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const auth = getAuth();
await sendPasswordResetEmail(auth, 'master@gmail.com');
// Check your email for reset link
```

---

## Troubleshooting

### Issue: "Email not in admin allowlist"
**Solution**: 
1. Check `Onchainweb/.env` → `VITE_ADMIN_ALLOWLIST`
2. Ensure email matches exactly (case-insensitive, but check spelling)
3. Restart dev server after changing `.env`

### Issue: "Admin account not found in Firebase"
**Solution**:
1. Verify account exists in Firebase Console → Authentication → Users
2. Check the email matches your allowlist
3. Create the account if it doesn't exist

### Issue: "Invalid credentials"
**Solution**:
1. Verify password is correct
2. Check for typos in email/password
3. Try password reset via Firebase Console

### Issue: "Firebase not available"
**Solution**:
1. Check `Onchainweb/.env` has all 8 Firebase environment variables
2. Verify Firebase project ID matches `.firebaserc`
3. Restart dev server

---

## Legacy Backend (Deprecated)

The old MongoDB/Express backend used different credentials:

```bash
# OLD SYSTEM (backend/.env) - DEPRECATED
MASTER_USERNAME=master
MASTER_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_here
```

**⚠️ WARNING**: The legacy backend is deprecated. Use Firebase Authentication instead.

---

## Example: Complete Setup

### 1. Environment Configuration
```dotenv
# Onchainweb/.env
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ALLOWLIST=master@gmail.com,support@mycompany.com
```

### 2. Firebase Console
- Create user: `master@gmail.com` with password `SecurePass123!@#`
- Create user: `support@mycompany.com` with password `AnotherSecurePass456!@#`

### 3. Store Credentials Securely
```
Master Account:
- Email: master@gmail.com
- Password: SecurePass123!@#
- Role: master
- Access: Full platform control

Support Account:
- Email: support@mycompany.com
- Password: AnotherSecurePass456!@#
- Role: admin
- Access: Limited permissions
```

### 4. Login
- Master: https://www.onchainweb.app/master-admin
- Support: https://www.onchainweb.app/admin

---

## Related Documentation

- [ADMIN_USER_GUIDE.md](./ADMIN_USER_GUIDE.md) - Using admin features
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - Initial setup
- [BACKEND_REPLACEMENT.md](./BACKEND_REPLACEMENT.md) - Firebase migration
- [SECURITY.md](./SECURITY.md) - Security policies

---

## Support

If you've lost your admin credentials:
1. Reset password via Firebase Console
2. Create a new admin account
3. Update the allowlist if needed

**Never request credentials from others** - always create your own.

---

**Last Updated**: January 2026  
**Version**: 2.0 (Firebase-first)
