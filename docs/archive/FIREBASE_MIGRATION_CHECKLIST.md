# Firebase Migration Checklist

Use this checklist to verify your Firebase migration is complete and working correctly.

## Pre-Migration Verification

- [ ] Current MongoDB backend is accessible
- [ ] All environment variables documented
- [ ] Database backup created (if migrating data)
- [ ] Dependencies up to date (`npm install`)

## Firebase Setup

### Project Creation
- [ ] Firebase project created
- [ ] Project ID noted down
- [ ] Billing account linked (if needed)

### Firestore Database
- [ ] Firestore enabled
- [ ] Region selected appropriately
- [ ] Security rules deployed
- [ ] Indexes deployed
- [ ] Test data can be written

### Authentication
- [ ] Email/Password provider enabled
- [ ] Test user created
- [ ] Admin user created with UID
- [ ] Admin document in Firestore `admins` collection

### Configuration
- [ ] `.firebaserc` updated with project ID
- [ ] `firebase.json` configured correctly
- [ ] `.env` file created with all Firebase variables
- [ ] WalletConnect Project ID added

## Code Verification

### File Structure
- [ ] `/config` directory exists with:
  - [ ] `firebase.config.js`
  - [ ] `constants.js`
- [ ] `/services` directory exists with:
  - [ ] `firebase.service.js`
  - [ ] `database.service.js`
  - [ ] `api.service.js`
  - [ ] `index.js`
- [ ] Supporting directories created:
  - [ ] `/pages`
  - [ ] `/features`
  - [ ] `/layouts`
  - [ ] `/hooks`
  - [ ] `/utils`

### Configuration Files
- [ ] `firestore.rules` in project root
- [ ] `firestore.indexes.json` in project root
- [ ] `firebase.json` in project root
- [ ] `.firebaserc` in project root
- [ ] `.gitignore` updated for Firebase

### Documentation
- [ ] `FIREBASE_SETUP.md` created
- [ ] `FIREBASE_MIGRATION_SUMMARY.md` created
- [ ] `MIGRATION_GUIDE_FIREBASE.md` created
- [ ] `QUICK_START_FIREBASE.md` created
- [ ] `Onchainweb/src/README.md` created
- [ ] Main `README.md` updated

## Build & Deploy

### Local Testing
- [ ] Dependencies installed: `npm install`
- [ ] Build succeeds: `npm run build`
- [ ] Dev server runs: `npm run dev`
- [ ] No console errors on startup
- [ ] Firebase initializes successfully

### Deployment
- [ ] Firebase CLI installed: `firebase --version`
- [ ] Logged in: `firebase login`
- [ ] Project selected: `firebase use default`
- [ ] Rules deployed: `firebase deploy --only firestore:rules`
- [ ] Indexes deployed: `firebase deploy --only firestore:indexes`
- [ ] Hosting deployed: `firebase deploy --only hosting` (optional)

## Functional Testing

### Authentication
- [ ] Master admin can login at `/master-admin`
- [ ] Regular admin can login at `/admin`
- [ ] Login errors shown appropriately
- [ ] Logout works correctly
- [ ] Session persists on page refresh

### User Management
- [ ] Users collection accessible
- [ ] Can create new user
- [ ] Can read user data
- [ ] Can update user data
- [ ] Real-time updates work

### Trading Features
- [ ] Can create trade
- [ ] Trade appears in list
- [ ] Can update trade status
- [ ] Real-time trade updates work
- [ ] Trade history loads correctly

### Chat System
- [ ] Can send message
- [ ] Messages appear in real-time
- [ ] Admin can reply
- [ ] Reply appears for user
- [ ] Chat history loads

### Admin Features
- [ ] Admin dashboard loads
- [ ] User list displays
- [ ] Can manage users
- [ ] Can view activity logs
- [ ] Permissions enforced correctly

### Deposits & Withdrawals
- [ ] Can create deposit request
- [ ] Can create withdrawal request
- [ ] Admin can approve/reject
- [ ] Status updates in real-time
- [ ] History displays correctly

### Notifications
- [ ] Notifications created
- [ ] Notifications display
- [ ] Can mark as read
- [ ] Unread count updates
- [ ] Real-time delivery works

### Settings
- [ ] Global settings load
- [ ] Admin can update settings
- [ ] Changes persist
- [ ] Changes reflect immediately

## Security Verification

### Firestore Rules
- [ ] Anonymous users have limited access
- [ ] Authenticated users can only access own data
- [ ] Admins have appropriate access
- [ ] Cannot delete activity logs
- [ ] Test in Firestore Rules Playground

### Authentication
- [ ] Strong passwords enforced
- [ ] Email verification (if enabled)
- [ ] Admin roles properly set
- [ ] Token expiration works
- [ ] Refresh tokens work

### Data Privacy
- [ ] User data not exposed
- [ ] Admin permissions checked
- [ ] Sensitive data encrypted
- [ ] Audit logs immutable

## Performance Testing

### Load Time
- [ ] Initial page load < 3s
- [ ] Admin login < 2s
- [ ] Dashboard loads < 2s
- [ ] Real-time updates < 1s

### Real-time Updates
- [ ] Chat messages instant
- [ ] Trade updates instant
- [ ] Notification delivery instant
- [ ] User list updates instant

### Offline Support
- [ ] App loads offline
- [ ] Cached data available
- [ ] Syncs when back online
- [ ] No data loss

## Migration Verification (If Migrating Data)

### Data Integrity
- [ ] All users migrated
- [ ] All trades migrated
- [ ] All deposits/withdrawals migrated
- [ ] All notifications migrated
- [ ] All settings migrated

### Data Validation
- [ ] User counts match
- [ ] Trade counts match
- [ ] Balance totals match
- [ ] Timestamps preserved
- [ ] Relationships intact

### Cleanup
- [ ] Old backend server stopped (optional)
- [ ] MongoDB data backed up
- [ ] Old API endpoints documented
- [ ] Migration logs reviewed

## Post-Migration

### Monitoring
- [ ] Firebase Console accessible
- [ ] Usage metrics reviewed
- [ ] Error logs checked
- [ ] Performance monitored
- [ ] Alerts configured

### Documentation
- [ ] Team trained on Firebase
- [ ] Deployment process documented
- [ ] Troubleshooting guide available
- [ ] Contact info updated

### Backup Strategy
- [ ] Firestore backups enabled
- [ ] Backup schedule configured
- [ ] Recovery process tested
- [ ] Backup storage verified

## Rollback Plan (If Needed)

- [ ] Old backend still available
- [ ] Database backup accessible
- [ ] Environment variables saved
- [ ] Rollback procedure documented
- [ ] Team knows rollback steps

## Final Sign-off

### Technical Review
- [ ] Code reviewed by team
- [ ] Security reviewed
- [ ] Performance benchmarked
- [ ] Documentation complete

### Stakeholder Approval
- [ ] Product owner approved
- [ ] Technical lead approved
- [ ] Security team approved
- [ ] Operations team notified

### Go-Live Checklist
- [ ] All tests passed
- [ ] Monitoring in place
- [ ] Support team ready
- [ ] Communication sent
- [ ] Rollback plan ready

---

## Quick Reference

### Key Commands

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Select project
firebase use your-project-id

# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy hosting
firebase deploy --only hosting

# Build frontend
cd Onchainweb && npm run build

# Run development
npm run dev
```

### Environment Variables Required

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_WALLETCONNECT_PROJECT_ID=
```

### Support Resources

- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [Quick Start Guide](QUICK_START_FIREBASE.md)
- [Migration Summary](FIREBASE_MIGRATION_SUMMARY.md)
- [Source Structure](Onchainweb/src/README.md)

---

**Print this checklist and check off items as you complete them!**

✅ **Migration Status**: __________ / __________ items complete

🎯 **Target Date**: __________

👤 **Responsible**: __________

📅 **Last Updated**: __________
