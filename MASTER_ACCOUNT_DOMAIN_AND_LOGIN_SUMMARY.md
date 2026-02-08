# Master Account Domain and Login Summary

**Generated**: February 8, 2026  
**Repository**: Snipe Trading Platform  
**Status**: ✅ Active & Operational

---

## 🌐 Master Account Domain Name

### Primary Production Domains

The Snipe platform uses the following domains for master account access:

| Domain Type | URL | Purpose |
|-------------|-----|---------|
| **Primary Production** | `https://onchainweb.site` | Main deployment domain (Vercel) |
| **Alternative Production** | `https://www.onchainweb.app` | Alternative production URL |
| **Master Admin Dashboard** | `https://onchainweb.site/master-admin` | Master account login page |
| **Regular Admin Dashboard** | `https://onchainweb.site/admin` | Regular admin login page |

### Firebase Auth Domain

The Firebase authentication domain is configured via:
- **Environment Variable**: `VITE_FIREBASE_AUTH_DOMAIN`
- **Format**: `your-project-id.firebaseapp.com`
- **Example**: `onchainweb-37d30.firebaseapp.com`

### Email Domain Configuration

Master account emails must use **REAL email domains** (not fake domains):

✅ **Valid Email Domains:**
- `master@onchainweb.site` (recommended for production)
- `master@gmail.com`
- `master@yourdomain.com`

❌ **Invalid Email Domains (Firebase will reject):**
- `master@admin.onchainweb.app` (fake domain)
- `master@admin.local` (fake domain)
- Any non-existent email domains

---

## 🔐 Master Account Login Mechanism

### Overview

The master account uses **Firebase Authentication** with email/password login. **No wallet connection is required** for admin/master accounts.

### Authentication Flow

```
User Access
    ↓
Navigate to /master-admin
    ↓
Email Check (VITE_ADMIN_ALLOWLIST)
    ↓
Firebase Auth (signInWithEmailAndPassword)
    ↓
Query Firestore admins collection (where email == user.email)
    ↓
Role Verification (role === 'master')
    ↓
Access Granted → Master Dashboard
```

### Login Components

| Component | File Location | Purpose |
|-----------|---------------|---------|
| **Route Guard** | `Onchainweb/src/components/AdminRouteGuard.jsx` | Protects admin routes |
| **Login UI** | `Onchainweb/src/components/AdminLogin.jsx` | Login form |
| **Auth Logic** | `Onchainweb/src/lib/adminAuth.js` | Authentication handling |
| **Admin Service** | `Onchainweb/src/services/adminService.js` | Firebase operations |
| **Master Setup** | `Onchainweb/src/components/MasterAccountSetup.jsx` | Initial setup |

---

## 📋 Master Account Configuration

### Required Environment Variables

```bash
# Enable admin features
VITE_ENABLE_ADMIN=true

# Admin route paths
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin

# Master account email allowlist (CRITICAL)
VITE_ADMIN_ALLOWLIST=master@onchainweb.site

# Firebase configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Master Account Structure in Firestore

**Collection**: `admins`  
**Document ID**: Firebase Auth UID  
**Document Fields**:

```javascript
{
  email: "master@onchainweb.site",
  uid: "firebase-auth-uid",
  role: "master",
  permissions: ["all"],
  createdAt: "2026-02-08T00:00:00.000Z",
  lastLogin: "2026-02-08T21:00:00.000Z"
}
```

---

## 🔑 Login Credentials & Process

### How to Login as Master Account

#### Step 1: Access the Master Dashboard

Navigate to: `https://onchainweb.site/master-admin`

#### Step 2: Enter Credentials

- **Email**: The email configured in `VITE_ADMIN_ALLOWLIST`
- **Password**: The password set during master account creation

#### Step 3: Verification

The system performs these checks:
1. ✅ Email is in `VITE_ADMIN_ALLOWLIST`
2. ✅ Firebase Auth user exists
3. ✅ Firestore admin document exists
4. ✅ Role is "master"
5. ✅ Permissions include "all"

---

## 🛠️ Master Account Creation

### Initial Setup (One-Time)

Master accounts are created using the `initializeMasterAccount` function:

```javascript
// Location: Onchainweb/src/services/adminService.js
export const initializeMasterAccount = async (email, password) => {
  // Step 1: Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = userCredential;
  
  // Step 2: Create Firestore admin document
  const adminId = user.uid;  // Uses UID as document ID
  const adminRef = doc(db, 'admins', adminId);
  
  await setDoc(adminRef, {
    email: user.email,
    uid: user.uid,
    role: 'master',
    permissions: ['all'],
    createdAt: new Date().toISOString()
  });
  
  return { success: true, message: 'Master account created successfully!' };
};
```

### Using the Setup Form

1. Navigate to `/master-admin`
2. If no master account exists, setup form appears
3. Enter email (must match `VITE_ADMIN_ALLOWLIST`)
4. Enter secure password
5. Click "Create Master Account"

---

## 🔍 Verification Methods

### Method 1: Check Firebase Console

1. Go to Firebase Console → Authentication
2. Look for user with email matching `VITE_ADMIN_ALLOWLIST`
3. Verify user exists and is enabled

### Method 2: Check Firestore Database

1. Go to Firebase Console → Firestore Database
2. Navigate to `admins` collection
3. Find document with email field matching master email
4. Verify fields:
   - `role: "master"`
   - `permissions: ["all"]`

### Method 3: Login Test

1. Visit `https://onchainweb.site/master-admin`
2. Enter credentials
3. Should successfully access master dashboard

---

## 🔐 Security Features

### Email Allowlist

Only emails in `VITE_ADMIN_ALLOWLIST` can login as admins/master:

```bash
# Single master
VITE_ADMIN_ALLOWLIST=master@onchainweb.site

# Multiple admins
VITE_ADMIN_ALLOWLIST=master@onchainweb.site,admin1@company.com,admin2@company.com
```

### Role-Based Access Control

| Role | Permissions | Capabilities |
|------|-------------|--------------|
| **master** | `["all"]` | Full platform control, create admins, all features |
| **admin** | `[specific permissions]` | Limited permissions based on assignment |
| **user** | None | Regular user access only |

### Document ID Strategy

- **Storage**: Uses Firebase Auth UID as document ID
- **Query**: Searches by email field using Firestore queries
- **Benefits**: Prevents conflicts, ensures uniqueness

```javascript
// Creation: doc ID = Firebase Auth UID
const adminRef = doc(db, 'admins', user.uid);

// Retrieval: Query by email field
const q = query(collection(db, 'admins'), where('email', '==', email), limit(1));
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Admin Features Disabled"

**Cause**: `VITE_ENABLE_ADMIN` not set to `true`

**Solution**:
```bash
# In .env file
VITE_ENABLE_ADMIN=true
```

### Issue 2: "Invalid credentials or unauthorized user"

**Cause**: Email not in `VITE_ADMIN_ALLOWLIST`

**Solution**:
```bash
# Add email to allowlist
VITE_ADMIN_ALLOWLIST=master@onchainweb.site
```

### Issue 3: "Master account not found"

**Cause**: No Firestore document exists for the email

**Solution**:
1. Use the master account setup form
2. Or manually create document in Firebase Console

### Issue 4: Firebase Auth "Invalid Email"

**Cause**: Using fake email domain (e.g., `@admin.onchainweb.app`)

**Solution**: Use real email domain:
- ✅ `master@onchainweb.site`
- ✅ `master@gmail.com`
- ❌ `master@admin.onchainweb.app`

---

## 📊 Master Account Capabilities

As master account, you have full access to:

### User Management
- ✅ View all users in real-time
- ✅ Edit user profiles and balances
- ✅ Freeze/unfreeze accounts
- ✅ Manage KYC status

### Admin Management
- ✅ Create new admin accounts
- ✅ Grant/revoke permissions
- ✅ Assign specific permissions
- ✅ Delete admin accounts

### Financial Operations
- ✅ Approve/reject deposits
- ✅ Process withdrawals
- ✅ Adjust user balances
- ✅ View transaction history

### System Control
- ✅ Monitor platform activity
- ✅ View admin action logs
- ✅ Configure platform settings
- ✅ Manage trading parameters

### Reporting & Analytics
- ✅ Access analytics dashboard
- ✅ View user statistics
- ✅ Monitor platform health
- ✅ Export reports

---

## 📝 Configuration Files

### Environment Configuration

| File | Location | Purpose |
|------|----------|---------|
| `.env.example` | Repository root | Template with all variables |
| `.env` | Repository root (gitignored) | Actual configuration |
| `.env.production.example` | Repository root | Production template |

### Key Code Files

| File | Purpose |
|------|---------|
| `adminAuth.js` | Authentication logic and role verification |
| `adminService.js` | Firebase operations for admin management |
| `AdminRouteGuard.jsx` | Protected route component |
| `AdminLogin.jsx` | Login form component |
| `MasterAccountSetup.jsx` | Initial master account creation |
| `MasterAdminDashboard.jsx` | Master dashboard UI |

---

## 🔗 Related Documentation

- `MASTER_ACCOUNT_LOGIN_FIX.md` - Technical fix details
- `MASTER_LOGIN_QUICK_START.md` - Quick start guide
- `docs/admin/MASTER_ACCOUNT_ACCESS_GUIDE.md` - Complete access guide
- `docs/admin/ADMIN_SETUP_GUIDE.md` - Setup instructions
- `docs/admin/FIREBASE_AUTO_PROVISIONING.md` - Auto-provisioning guide

---

## 📞 Support & Resources

### Production URLs
- **Website**: https://onchainweb.site
- **Master Dashboard**: https://onchainweb.site/master-admin
- **Admin Dashboard**: https://onchainweb.site/admin

### Documentation
- Quick Start: `docs/quickstart/README.md`
- Admin Guide: `docs/admin/ADMIN_SETUP_GUIDE.md`
- Security: `SECURITY.md`

---

## ✅ Quick Checklist

**To login as master account:**
- [ ] Email is in `VITE_ADMIN_ALLOWLIST`
- [ ] `VITE_ENABLE_ADMIN=true` in environment
- [ ] Firebase Auth user exists with the email
- [ ] Firestore admin document exists with `role: "master"`
- [ ] Navigate to `/master-admin` route
- [ ] Enter email and password
- [ ] Should access master dashboard

---

**Last Updated**: February 8, 2026  
**Platform**: Snipe Trading Platform  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
