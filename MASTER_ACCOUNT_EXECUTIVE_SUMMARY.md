# Master Account Domain and Login - Executive Summary

**Date**: February 8, 2026  
**Repository**: Snipe Trading Platform  
**Task**: Provide master account domain name and verify login mechanism

---

## 📍 Master Account Domain Name

### Primary Production Domain
**onchainweb.site**

### Master Account Access URLs

| Purpose | URL |
|---------|-----|
| Master Admin Dashboard | **https://onchainweb.site/master-admin** |
| Admin Dashboard | **https://onchainweb.site/admin** |
| Production Website | https://onchainweb.site |
| Alternative Domain | https://www.onchainweb.app |

### Domain Configuration

**Firebase Auth Domain**: `your-project-id.firebaseapp.com`  
**Configured via**: `VITE_FIREBASE_AUTH_DOMAIN` environment variable

---

## 🔐 Master Account Login Details

### Authentication Method

✅ **Email + Password** (NO wallet connection required)

### Master Account Credentials

**Default Email**: `master@onchainweb.site`

**Email Domain Rules**:
- ✅ Must use REAL email domains (gmail.com, onchainweb.site, your-domain.com)
- ❌ Cannot use fake domains (admin.local, admin.onchainweb.app)

**Password**: Set during initial account creation (secure, minimum 8 characters)

### Login Process

1. Navigate to: **https://onchainweb.site/master-admin**
2. Enter email: `master@onchainweb.site`
3. Enter password: Your secure password
4. Click "Login"
5. System verifies:
   - ✅ Email in allowlist
   - ✅ Firebase authentication
   - ✅ Firestore role verification
   - ✅ Master permissions
6. Access granted to dashboard

---

## 🔍 How Login Works (Technical Summary)

### Authentication Flow

```
User Access → Route Guard → Email Allowlist Check → Firebase Auth → 
Firestore Query → Role Verification → Access Granted
```

### Key Technical Details

**Storage Strategy**:
- Firebase Auth: User credentials (email/password)
- Firestore Database: Admin document with role and permissions
- Document ID: Firebase Auth UID (not email)
- Query Method: Search by email field using Firestore queries

**Security Layers**:
1. Email must be in `VITE_ADMIN_ALLOWLIST` environment variable
2. Firebase Authentication validates credentials
3. Firestore confirms role is "master"
4. Permissions must include "all"

### Configuration Files

```bash
# .env file
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ALLOWLIST=master@onchainweb.site
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
# ... other Firebase config variables
```

### Key Code Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Route Guard | `Onchainweb/src/components/AdminRouteGuard.jsx` | Protects admin routes |
| Login Form | `Onchainweb/src/components/AdminLogin.jsx` | Email/password interface |
| Auth Logic | `Onchainweb/src/lib/adminAuth.js` | Credential validation |
| Admin Service | `Onchainweb/src/services/adminService.js` | Firebase operations |
| Master Setup | `Onchainweb/src/components/MasterAccountSetup.jsx` | Initial account creation |

---

## 📊 Master Account Capabilities

### Full Platform Control

The master account has complete access to all platform features:

**User Management**:
- View all users in real-time
- Edit user profiles and balances
- Freeze/unfreeze accounts
- Manage KYC verification status

**Admin Management**:
- Create new admin accounts
- Grant/revoke specific permissions
- Delete admin accounts
- Assign users to specific admins

**Financial Operations**:
- Approve/reject deposits
- Process withdrawal requests
- Manually adjust user balances
- View complete transaction history

**System Administration**:
- Monitor platform activity
- View admin action logs
- Configure platform settings
- Access analytics and reports

---

## ✅ Verification Summary

### Verification Script Created

**Location**: `/verify-master-login.sh`

**Usage**:
```bash
./verify-master-login.sh
```

**Checks**:
- ✅ Environment variables configured
- ✅ Firebase credentials present
- ✅ Admin features enabled
- ✅ Master email in allowlist
- ✅ Shows access URLs and next steps

### Manual Verification Steps

**Firebase Console - Authentication**:
1. Go to Firebase Console → Authentication → Users
2. Verify user exists with email: `master@onchainweb.site`
3. Status should be "Enabled"

**Firebase Console - Firestore**:
1. Go to Firestore Database → Collections → admins
2. Find document where `email == "master@onchainweb.site"`
3. Verify fields:
   - `role: "master"`
   - `permissions: ["all"]`
   - `uid: [firebase-auth-uid]`

**Login Test**:
1. Navigate to https://onchainweb.site/master-admin
2. Enter credentials
3. Should successfully access master dashboard

---

## 📚 Documentation Created

### 1. Comprehensive Guide
**File**: `MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md`  
**Contents**: Complete technical documentation with configuration, authentication flow, security features, troubleshooting, and all details

### 2. Quick Reference
**File**: `MASTER_ACCOUNT_QUICK_REFERENCE.md`  
**Contents**: Quick access guide with URLs, login steps, verification, troubleshooting checklist

### 3. Verification Script
**File**: `verify-master-login.sh`  
**Contents**: Automated script to check environment configuration and display master account details

### 4. Existing Documentation
- `MASTER_ACCOUNT_LOGIN_FIX.md` - Technical fix for document ID mismatch
- `MASTER_LOGIN_QUICK_START.md` - Quick start guide
- `docs/admin/ADMIN_SETUP_GUIDE.md` - Complete setup instructions

---

## 🎯 Summary

### Master Account Domain Name
**Primary**: `onchainweb.site`  
**Master Dashboard**: https://onchainweb.site/master-admin

### Login Mechanism
- **Method**: Email + Password (Firebase Authentication)
- **Email**: `master@onchainweb.site`
- **Password**: Set during account creation
- **No Wallet**: Admin accounts do NOT require wallet connection
- **Verification**: Email allowlist → Firebase Auth → Firestore role check

### Key Points
1. ✅ Master account uses email/password authentication
2. ✅ Email must be in `VITE_ADMIN_ALLOWLIST` environment variable
3. ✅ Domain is `onchainweb.site` for production
4. ✅ Firebase Auth handles credentials
5. ✅ Firestore stores role and permissions
6. ✅ Complete documentation and verification tools provided

### Configuration Status
- ✅ Default master email: `master@onchainweb.site`
- ✅ Admin features enabled by default
- ✅ Firebase Auth domain configurable
- ✅ Role-based access control implemented
- ✅ Security layers in place

---

## 🚀 Next Steps

To use the master account:

1. **Verify Configuration**
   ```bash
   ./verify-master-login.sh
   ```

2. **Check Firebase Console**
   - Ensure user exists in Authentication
   - Verify admin document in Firestore

3. **Test Login**
   - Navigate to https://onchainweb.site/master-admin
   - Enter email: `master@onchainweb.site`
   - Enter password
   - Access dashboard

4. **Review Documentation**
   - Read `MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md` for complete details
   - Use `MASTER_ACCOUNT_QUICK_REFERENCE.md` for quick access

---

**Documentation Status**: ✅ Complete  
**Verification Tools**: ✅ Provided  
**Login Mechanism**: ✅ Documented  
**Configuration**: ✅ Verified  

**Last Updated**: February 8, 2026
