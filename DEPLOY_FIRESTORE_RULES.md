# Deploy Firestore Security Rules - Quick Guide

## Critical: Rules Must Be Deployed

⚠️ **IMPORTANT**: The updated Firestore security rules MUST be deployed to Firebase for admin authentication to work properly.

## Prerequisites

1. **Firebase CLI Installed**:
```bash
npm install -g firebase-tools
```

2. **Firebase Project Initialized**:
```bash
firebase login
firebase use [your-project-id]
```

3. **Check Current Project**:
```bash
firebase projects:list
```

## Deploy Rules

### Option 1: Deploy Rules Only (Recommended)

```bash
# From project root directory
firebase deploy --only firestore:rules
```

**Expected Output:**
```
✔  firestore: released rules firestore.rules to cloud.firestore
✨  Deploy complete!
```

### Option 2: Deploy Everything

```bash
# Deploy all Firebase configurations
firebase deploy
```

**This will deploy:**
- Firestore rules
- Firestore indexes
- Cloud Functions (if any)
- Hosting (if configured)

## Verify Deployment

### Method 1: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Verify the rules show:
   - `isAdmin()` function with email regex matching
   - `isMasterAdmin()` function
   - Admin-only restrictions on sensitive collections

### Method 2: CLI

```bash
# Get current rules
firebase firestore:rules:get
```

Should show the updated rules with email-based admin detection.

### Method 3: Test Admin Login

1. Navigate to: `https://your-domain.com/master-admin`
2. Login with admin credentials
3. Check browser console for errors
4. Verify dashboard loads successfully

## Common Issues

### Issue: "Permission Denied" After Login

**Cause**: Rules not deployed or cached
**Solution**:
```bash
# Redeploy rules
firebase deploy --only firestore:rules --force

# Clear browser cache and retry
```

### Issue: "firebase: command not found"

**Cause**: Firebase CLI not installed
**Solution**:
```bash
npm install -g firebase-tools
firebase login
```

### Issue: "No project active"

**Cause**: Firebase project not selected
**Solution**:
```bash
# List available projects
firebase projects:list

# Select your project
firebase use [your-project-id]

# Or use project alias
firebase use default
```

### Issue: Rules deployment succeeds but authentication still fails

**Cause**: Browser cache or outdated Firebase SDK
**Solution**:
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear all site data in browser dev tools
3. Try in incognito/private window
4. Check Firebase SDK version in package.json

## Security Rules Summary

### Key Changes

1. **Email-Based Admin Detection**:
   - Any email ending with `@admin.onchainweb.app` is recognized as admin
   - Master admin: `master@admin.onchainweb.app`
   - Regular admin: `[username]@admin.onchainweb.app`

2. **Dual Verification**:
   - Email domain matching (primary)
   - Firestore document existence (secondary)

3. **Admin Collection**:
   - Admins can create their own profile on first login
   - Master admin can create/update/delete any admin
   - Regular admins can only update their own profile

4. **Sensitive Data Protection**:
   - Settings: Admin-only read/write
   - Activity logs: Admin-only read, no updates/deletes
   - Chat messages: Authenticated users only
   - User data: Owner or admin access only

## Post-Deployment Checklist

- [ ] Rules deployed successfully (no errors)
- [ ] Firebase Console shows updated rules
- [ ] Master admin can login
- [ ] Regular admin can login
- [ ] Dashboard loads without errors
- [ ] Real-time data accessible
- [ ] Settings can be modified
- [ ] No public access to sensitive data

## Rollback (If Needed)

If the new rules cause issues, you can rollback:

```bash
# View rules history
firebase firestore:rules:list

# Restore previous version
firebase firestore:rules:restore [version-id]
```

Or manually edit rules in Firebase Console and publish.

## Production Deployment

For production environments:

1. **Test in Development First**:
```bash
firebase use dev
firebase deploy --only firestore:rules
# Test thoroughly
```

2. **Deploy to Production**:
```bash
firebase use prod
firebase deploy --only firestore:rules
```

3. **Verify Production**:
   - Test admin login on production domain
   - Check all features work correctly
   - Monitor Firebase Console for errors

4. **Monitor Access**:
   - Review Firestore usage in Firebase Console
   - Check for permission denied errors
   - Monitor admin activity logs

## Quick Reference

### Deploy Commands
```bash
# Deploy rules only
firebase deploy --only firestore:rules

# Deploy with force (ignore warnings)
firebase deploy --only firestore:rules --force

# Deploy to specific project
firebase deploy --only firestore:rules --project [project-id]

# View rules
firebase firestore:rules:get

# Test rules locally (requires emulator)
firebase emulators:start --only firestore
```

### Rule Testing (Local Emulator)

```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# In another terminal, run tests
npm test

# Or manually test at
# http://localhost:4000/firestore (Emulator UI)
```

## Support

If you encounter issues:

1. **Check deployment logs** for errors
2. **Verify Firebase project** is correct
3. **Test in incognito mode** to avoid cache issues
4. **Review browser console** for permission errors
5. **Check Firebase Console** → Firestore → Rules tab

For urgent issues:
- Check [ADMIN_AUTHENTICATION_FIX.md](ADMIN_AUTHENTICATION_FIX.md)
- Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open issue on GitHub with deployment logs

---

**Status**: Required for admin authentication  
**Priority**: Critical  
**Estimated Time**: 2-5 minutes
