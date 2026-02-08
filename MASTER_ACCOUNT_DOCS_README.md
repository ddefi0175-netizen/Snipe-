# Master Account Documentation Index

This directory contains complete documentation for the Snipe platform's master account domain and login system.

## 📋 Quick Access

### Master Account Information

**Domain**: `onchainweb.site`  
**Master Dashboard**: https://onchainweb.site/master-admin  
**Default Email**: `master@onchainweb.site`  
**Login Method**: Email + Password (NO wallet required)

## 📚 Documentation Files

### 1. Executive Summary (Start Here)
**File**: [MASTER_ACCOUNT_EXECUTIVE_SUMMARY.md](./MASTER_ACCOUNT_EXECUTIVE_SUMMARY.md)

Quick overview with all essential information:
- Master account domain name
- Login credentials and process
- Authentication mechanism summary
- Verification steps
- Next actions

**Best for**: Quick reference and executive overview

---

### 2. Complete Technical Documentation
**File**: [MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md](./MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md)

Comprehensive technical guide covering:
- Domain configuration details
- Complete authentication flow
- Environment setup
- Security features
- Firestore structure
- Common issues and solutions
- Master account capabilities

**Best for**: Developers, system administrators, technical implementation

---

### 3. Quick Reference Guide
**File**: [MASTER_ACCOUNT_QUICK_REFERENCE.md](./MASTER_ACCOUNT_QUICK_REFERENCE.md)

Fast-access guide with:
- Step-by-step login instructions
- Verification checklist
- Troubleshooting quick fixes
- Configuration summary
- Key URLs

**Best for**: Daily operations, quick lookups, troubleshooting

---

### 4. Login Fix Documentation
**File**: [MASTER_ACCOUNT_LOGIN_FIX.md](./MASTER_ACCOUNT_LOGIN_FIX.md)

Technical details about the document ID fix:
- Root cause analysis
- Solution implementation
- Before/after comparison
- Migration notes

**Best for**: Understanding the technical fix, troubleshooting login issues

---

## 🛠️ Verification Tools

### Automated Verification Script
**File**: [verify-master-login.sh](./verify-master-login.sh)

**Usage**:
```bash
./verify-master-login.sh
```

**What it checks**:
- Environment variables configuration
- Firebase credentials
- Admin features enabled
- Master email in allowlist
- Displays access URLs and next steps

**Run this first** to verify your setup!

---

## 🚀 Getting Started

### For First-Time Setup

1. **Run Verification**
   ```bash
   ./verify-master-login.sh
   ```

2. **Read Executive Summary**
   - Open [MASTER_ACCOUNT_EXECUTIVE_SUMMARY.md](./MASTER_ACCOUNT_EXECUTIVE_SUMMARY.md)
   - Review domain, credentials, and login process

3. **Check Firebase Console**
   - Verify user exists in Authentication
   - Confirm admin document in Firestore

4. **Test Login**
   - Navigate to https://onchainweb.site/master-admin
   - Login with credentials

### For Troubleshooting

1. **Quick Reference** → [MASTER_ACCOUNT_QUICK_REFERENCE.md](./MASTER_ACCOUNT_QUICK_REFERENCE.md)
2. **Common Issues** → See "Troubleshooting" section
3. **Technical Details** → [MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md](./MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md)

### For Development

1. **Complete Guide** → [MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md](./MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md)
2. **Authentication Flow** → See "Authentication Mechanism" section
3. **Code Components** → See "Key Code Files" section

---

## 📖 Document Comparison

| Document | Length | Purpose | Audience |
|----------|--------|---------|----------|
| Executive Summary | 7.1K | Overview & quick facts | Management, quick review |
| Complete Documentation | 11K | Full technical guide | Developers, admins |
| Quick Reference | 5.0K | Fast access, troubleshooting | Daily operations |
| Login Fix | 4.6K | Technical fix details | Developers |
| Verification Script | 4.2K | Automated checking | Everyone |

---

## 🔑 Key Information Summary

### Domain & URLs
- **Domain**: onchainweb.site
- **Master Dashboard**: https://onchainweb.site/master-admin
- **Admin Dashboard**: https://onchainweb.site/admin

### Credentials
- **Email**: master@onchainweb.site (configurable)
- **Password**: Set during initial setup
- **Method**: Email/Password (NO wallet connection)

### Configuration
- **Environment Variable**: `VITE_ADMIN_ALLOWLIST=master@onchainweb.site`
- **Admin Feature**: `VITE_ENABLE_ADMIN=true`
- **Firebase Auth**: Configured via environment variables

### Authentication Flow
```
User → /master-admin → Route Guard → Email Check → 
Firebase Auth → Firestore Query → Role Check → Access Granted
```

---

## ✅ Verification Checklist

Before attempting login:
- [ ] Run `./verify-master-login.sh`
- [ ] Firebase credentials configured
- [ ] `VITE_ENABLE_ADMIN=true` in .env
- [ ] Master email in `VITE_ADMIN_ALLOWLIST`
- [ ] Firebase Auth user exists
- [ ] Firestore admin document exists with role="master"
- [ ] Access URL: https://onchainweb.site/master-admin

---

## 🔗 Related Documentation

- **Admin Setup**: `docs/admin/ADMIN_SETUP_GUIDE.md`
- **Firebase Config**: `docs/admin/FIREBASE_AUTO_PROVISIONING.md`
- **Quick Start**: `MASTER_LOGIN_QUICK_START.md`
- **Security**: `SECURITY.md`

---

## 📞 Support

For issues or questions:
1. Check [MASTER_ACCOUNT_QUICK_REFERENCE.md](./MASTER_ACCOUNT_QUICK_REFERENCE.md) troubleshooting section
2. Review [MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md](./MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md) for detailed info
3. Run `./verify-master-login.sh` to diagnose configuration issues

---

**Last Updated**: February 8, 2026  
**Status**: ✅ Complete  
**Platform**: Snipe Trading Platform
