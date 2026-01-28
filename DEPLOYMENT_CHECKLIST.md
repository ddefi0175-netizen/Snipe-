# Deployment Checklist for Public Release

## Pre-Deployment Security

### 1. Firebase Configuration
- [ ] Revoke exposed service account key (ID: 79be340424b59131436919c6f1a1ce5caa2cdaa2)
- [ ] Generate new service account key for backend operations (if needed)
- [ ] Update .env files with new Firebase project credentials (onchainweb-b4b36)
- [ ] Verify .gitignore includes all Firebase service account key patterns
- [ ] Confirm no service account keys in git history of new commits

### 2. Environment Variables
- [ ] Update Onchainweb/.env with production Firebase config
- [ ] Update backend/.env with production credentials
- [ ] Verify all placeholder values replaced in documentation
- [ ] Test application with new credentials locally

### 3. Deployment Platforms
- [ ] Update Vercel environment variables
- [ ] Update Render environment variables  
- [ ] Update Cloudflare environment variables
- [ ] Remove all references to old Firebase project (onchainweb-37d30)

## Firebase Project Setup (onchainweb-b4b36)

### 4. Firebase Console Configuration
- [ ] Enable Authentication (Email/Password provider)
- [ ] Create Firestore Database (start in production mode)
- [ ] Enable Realtime Database
- [ ] Deploy security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy indexes: `firebase deploy --only firestore:indexes`
- [ ] Deploy database rules: `firebase deploy --only database`

### 5. Admin Account Setup
- [ ] Create master admin account in Firebase Authentication
- [ ] Create master admin document in Firestore admins collection
- [ ] Test master admin login at /master-admin
- [ ] Verify admin permissions work correctly

### 6. Cloud Functions (if using)
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Verify functions are working in Firebase Console
- [ ] Test function invocations from application

## Application Testing

### 7. Functionality Tests
- [ ] Test wallet connection (MetaMask, WalletConnect, etc.)
- [ ] Test user registration/auto-provisioning
- [ ] Test trading operations
- [ ] Test deposit/withdrawal flows
- [ ] Test admin dashboard access
- [ ] Test real-time updates (chat, notifications)

### 8. Security Tests
- [ ] Verify Firestore security rules block unauthorized access
- [ ] Test admin-only routes require authentication
- [ ] Verify no sensitive data in browser console logs
- [ ] Test rate limiting on authentication endpoints
- [ ] Scan for exposed credentials in codebase

### 9. Performance Tests
- [ ] Test load time with production build
- [ ] Verify Firebase query performance
- [ ] Test with multiple concurrent users
- [ ] Check bundle size: `npm run build`

## Documentation Updates

### 10. Repository Documentation
- [ ] Update README.md with new Firebase project info
- [ ] Update setup guides with correct project ID
- [ ] Verify all example configurations use placeholders
- [ ] Add security warnings to credential documentation

### 11. Deployment Documentation
- [ ] Document environment variable setup for each platform
- [ ] Create troubleshooting guide for common issues
- [ ] Document admin account creation process
- [ ] Add monitoring and logging setup instructions

## Final Verification

### 12. Code Review
- [ ] Review all changed files in pull request
- [ ] Verify no hardcoded credentials in any file
- [ ] Check that all security fixes are included
- [ ] Ensure build completes without errors

### 13. Deployment
- [ ] Merge pull request to main branch
- [ ] Deploy to staging environment first
- [ ] Test all functionality in staging
- [ ] Deploy to production
- [ ] Monitor logs for errors post-deployment

### 14. Post-Deployment
- [ ] Verify production site is accessible
- [ ] Test critical user flows in production
- [ ] Monitor Firebase usage and quotas
- [ ] Set up error tracking and alerts
- [ ] Document any issues and resolutions

## Security Monitoring

### 15. Ongoing Security
- [ ] Set up alerts for failed authentication attempts
- [ ] Monitor Firebase security rules usage
- [ ] Review access logs weekly
- [ ] Schedule credential rotation (quarterly)
- [ ] Keep Firebase SDK versions updated

## Rollback Plan

### 16. Emergency Procedures
- [ ] Document how to rollback to previous version
- [ ] Keep backup of working .env files
- [ ] Document Firebase project restoration process
- [ ] Have contact information for team members

---

## Quick Reference

### Firebase Project Info
- **Project ID**: onchainweb-b4b36
- **Project Number**: 635972146777
- **App ID**: 1:635972146777:web:70807929d2f014c0160348
- **Database URL**: https://onchainweb-b4b36-default-rtdb.asia-southeast1.firebasedatabase.app

### Environment Variable Template
```env
VITE_FIREBASE_API_KEY=AIzaSyA1fSnlpADLpeDFrbRxdIcgQlccqudpsWU
VITE_FIREBASE_AUTH_DOMAIN=onchainweb-b4b36.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://onchainweb-b4b36-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=onchainweb-b4b36
VITE_FIREBASE_STORAGE_BUCKET=onchainweb-b4b36.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=635972146777
VITE_FIREBASE_APP_ID=1:635972146777:web:70807929d2f014c0160348
VITE_FIREBASE_MEASUREMENT_ID=G-NVT9RVZW06
```

### Critical Commands
```bash
# Deploy Firebase rules and indexes
firebase deploy --only firestore:rules,firestore:indexes,database

# Build for production
cd Onchainweb && npm run build

# Test production build locally
npm run preview
```

---

**Date Created**: 2026-01-28 18:44:36
**Last Updated**: 2026-01-28 18:44:36
**Status**: Ready for deployment preparation