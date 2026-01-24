# Admin Login Guide

## Overview

The Snipe platform admin system uses **Firebase Authentication** for secure, serverless admin access.

**Authentication Method:** Firebase Auth (Email/Password)
**No Backend Server Required:** Serverless architecture
**Why Not Backend JWT?** See [FIREBASE_VS_BACKEND_JWT_CLARIFICATION.md](../../FIREBASE_VS_BACKEND_JWT_CLARIFICATION.md)

There are two types of admin interfaces:

1. **Master Admin Dashboard** (`/master-admin`) - For the master/super admin account
2. **Admin Panel** (`/admin`) - For regular admin accounts

Both use Firebase Authentication with the same login flow.

## Authentication Architecture

### Current System (Firebase Auth) ✅

```
User Login Form
    ↓
Firebase Authentication
    ↓
Email/Password Verification
    ↓
Firebase ID Token Generated
    ↓
Allowlist Check (VITE_ADMIN_ALLOWLIST)
    ↓
Access Granted → Admin Dashboard
```

### Legacy System (Backend JWT) ⚠️ DEPRECATED

The old backend JWT system in `/backend/routes/auth.js` is **deprecated and unused**.
- It's kept for backward compatibility only
- Will be removed in v3.0
- Do not use for new deployments

## How to Login

### Master Admin Account
- **URL**: `/master` or `/master-admin`
- **Default Credentials**:
  - Username: `master`
  - Password: Set during initial setup
- **Access**: Full system control, can create other admins, manage all features

### Regular Admin Account
- **URL**: `/admin`
- **Example Credentials**:
  - Username: `aqiang`, `newadmin`, `admin2`, etc.
  - Password: Set when account is created
- **Access**: Permissions-based access as configured by master admin

## Authentication Flow

Firebase Authentication is used for all admin login:

1. **User Input**: Email/password entered in login form
2. **Allowlist Check**: Email verified against `VITE_ADMIN_ALLOWLIST`
3. **Firebase Auth**: `signInWithEmailAndPassword()` called
4. **Token Generation**: Firebase ID token retrieved
5. **Role Assignment**: Role determined based on email (master@ prefix = master role)
6. **Session Storage**: Token and user info stored in localStorage
7. **Access Granted**: Admin dashboard or panel displayed

### Authentication Code

See `src/lib/adminAuth.js` for the implementation:
- `handleAdminLogin()` - Main login function
- `convertToAdminEmail()` - Validates email against allowlist
- `determineAdminRole()` - Assigns master or admin role
- Uses Firebase Auth, NOT backend JWT

## Setup Requirements

### 1. Firebase Console Setup

Create admin accounts in Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **"Add user"**
5. Enter email and password:
   - Master: `master@gmail.com` (or `master@yourdomain.com`)
   - Admin: `admin@gmail.com`, `admin1@gmail.com`, etc.
6. Click **"Add user"**

### 2. Environment Configuration

Update `Onchainweb/.env`:

```env
# Enable admin features
VITE_ENABLE_ADMIN=true

# Add admin emails (comma-separated)
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com,admin1@gmail.com
```

### 3. Firebase Config

Ensure Firebase is configured in `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```

## Login Process

### Master Admin Login

1. Navigate to `/master-admin` route
2. Enter Firebase email (e.g., `master@gmail.com`)
3. Enter password (set in Firebase Console)
4. Click **"Login"**
5. Firebase authenticates credentials
6. If successful, master dashboard loads

### Regular Admin Login

1. Navigate to `/admin` route
2. Enter Firebase email (e.g., `admin@gmail.com`)
3. Enter password (set in Firebase Console)
4. Click **"Login"**
5. Firebase authenticates credentials
6. If successful, admin panel loads with assigned permissions

## Troubleshooting

### "Email not in admin allowlist"
- **Cause**: Email not added to `VITE_ADMIN_ALLOWLIST`
- **Solution**: Add email to allowlist in `.env` file
- **Note**: Restart dev server after changing `.env`

### "Admin account not found in Firebase"
- **Cause**: Account not created in Firebase Console
- **Solution**: 
  1. Go to Firebase Console → Authentication → Users
  2. Click "Add user"
  3. Create account with email/password
  4. Add email to allowlist

### "Firebase not available"
- **Cause**: Firebase config missing from `.env`
- **Solution**: Add all `VITE_FIREBASE_*` variables to `.env`
- **Check**: Verify values in Firebase Console → Project Settings

### "Invalid email or password"
- **Cause**: Wrong credentials or account doesn't exist
- **Solution**: 
  - Verify email matches Firebase account exactly
  - Reset password in Firebase Console if needed
  - Check caps lock is off

## Security Notes

- All authentication uses Firebase (no backend server)
- Passwords stored securely in Firebase (hashed + salted)
- Admin tokens are Firebase ID tokens (JWT format)
- Tokens expire after 1 hour (automatically refreshed)
- Session stored in localStorage
- Admin access gated by email allowlist
- No rate limiting needed (Firebase handles it)

## Legacy Backend (Deprecated)

The old backend JWT system (`/backend/routes/auth.js`) is **no longer used**:

- ❌ **Not used** for admin authentication
- ❌ **Not used** for user authentication  
- ⚠️ **Kept** for backward compatibility only
- 🗑️ **Will be removed** in v3.0

**Do not** attempt to use backend JWT for authentication.  
**Do not** deploy the `/backend` folder for authentication.  
**Use** Firebase Auth exclusively.

See [FIREBASE_VS_BACKEND_JWT_CLARIFICATION.md](../../FIREBASE_VS_BACKEND_JWT_CLARIFICATION.md) for full explanation.

## API Operations (Admin CRUD)

While **authentication** uses Firebase, some **admin management operations** still use the legacy API:

- Creating new admin accounts (`authAPI.createAdmin()`)
- Updating admin permissions (`authAPI.updateAdmin()`)
- Deleting admin accounts (`authAPI.deleteAdmin()`)

**Note:** These should be migrated to Firebase Admin SDK in the future, but authentication itself is 100% Firebase.

## FAQ

### Q: Do I need to deploy the backend for admin login?
**A:** No. Admin login uses Firebase Auth only (serverless, no backend needed).

### Q: What is VITE_BACKEND_AUTH_URL for?
**A:** It's deprecated/unused. The code uses Firebase Auth, not backend JWT. This variable will be removed in v3.0.

### Q: Can I use username instead of email?
**A:** The code supports username → email mapping via the allowlist. If you enter "master", it looks up "master@gmail.com" from the allowlist.

### Q: How do I reset an admin password?
**A:** Go to Firebase Console → Authentication → Users → Select user → Reset password.

### Q: Can admin and user use the same email?
**A:** No. Admin accounts are in Firebase Auth, user accounts are wallet-based. They're separate systems.

### Q: Why not use backend JWT like before?
**A:** The backend JWT system had issues:
- Cold starts (30-60 second delays)
- Hosting costs ($7-15/month)
- Maintenance overhead
- Polling instead of real-time updates

Firebase is faster, cheaper, and more reliable. See [BACKEND_REPLACEMENT.md](../../BACKEND_REPLACEMENT.md).

## Additional Resources

- [FIREBASE_VS_BACKEND_JWT_CLARIFICATION.md](../../FIREBASE_VS_BACKEND_JWT_CLARIFICATION.md) - Architecture explanation
- [BACKEND_REPLACEMENT.md](../../BACKEND_REPLACEMENT.md) - Why we migrated to Firebase
- [ADMIN_USER_GUIDE.md](../../ADMIN_USER_GUIDE.md) - How to use admin features
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth) - Firebase Auth documentation

## Summary

- ✅ **Authentication**: Firebase Auth (email/password)
- ✅ **Database**: Firebase Firestore
- ✅ **No Backend**: Serverless architecture
- ❌ **Legacy JWT**: Deprecated, unused
- 🔐 **Allowlist**: Email-based access control
- 🚀 **Performance**: Instant login, no cold starts

