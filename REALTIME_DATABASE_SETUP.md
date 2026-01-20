# Real-Time Database & Cloud Functions Setup

## Overview

We've created 8 powerful Cloud Functions for master/admin control of users with real-time database syncing.

## What You Get

### Functions (8 Total)

1. **updateUserStatus()** - Update user status in real-time
2. **freezeUserAccount()** - Freeze/unfreeze accounts (Master only)
3. **getUserList()** - Get paginated user list
4. **syncUserToRTDB()** - Auto-sync Firestore → Realtime DB
5. **syncRTDBToFirestore()** - Auto-sync Realtime DB → Firestore
6. **bulkUpdateUserStatus()** - Bulk update multiple users
7. **cleanupDeletedUsers()** - Daily cleanup of orphaned users
8. **cleanupUserDataOnDelete()** - GDPR-compliant data deletion

### Security Features

- ✅ Real-time user database (Firestore + Realtime DB)
- ✅ Master/Admin role-based access control
- ✅ Permission-based authorization
- ✅ Bidirectional data sync
- ✅ Activity logging for all changes
- ✅ GDPR compliance (auto-delete on account deletion)

---

## Deployment Steps

### Step 1: Install Dependencies

```bash
cd functions
npm install
cd ..
```

### Step 2: Deploy Functions

```bash
firebase deploy --only functions --project=onchainweb-37d30
```

Expected output:
```
✔ Deploy complete!
8 functions deployed successfully
✔ functions: Updated 8 functions
```

### Step 3: Deploy Database Rules

```bash
firebase deploy --only database --project=onchainweb-37d30
```

### Step 4: Verify Deployment

Check functions:
```bash
firebase functions:list --project=onchainweb-37d30
```

Should show all 8 functions with status ✓

---

## Using the Functions

### 1. Update User Status (Admin/Master)

```javascript
// Call from your app
const updateUserStatus = firebase.functions().httpsCallable('updateUserStatus');

await updateUserStatus({
  userId: 'user123',
  status: 'active',  // or 'inactive', 'suspended'
  userData: {
    vipLevel: 2,
    balance: 500
  }
});
```

### 2. Freeze User Account (Master Only)

```javascript
const freezeUserAccount = firebase.functions().httpsCallable('freezeUserAccount');

await freezeUserAccount({
  userId: 'user123',
  frozen: true,
  reason: 'Suspicious activity'
});
```

### 3. Get User List (Admin Dashboard)

```javascript
const getUserList = firebase.functions().httpsCallable('getUserList');

const result = await getUserList({
  limit: 50,
  offset: 0
});

console.log(result.users);  // Array of users
```

### 4. Bulk Update Users (Master Only)

```javascript
const bulkUpdateUserStatus = firebase.functions().httpsCallable('bulkUpdateUserStatus');

await bulkUpdateUserStatus({
  userIds: ['user1', 'user2', 'user3'],
  status: 'inactive',
  reason: 'Platform maintenance'
});
```

---

## Real-Time Data Sync

### Firestore ↔ Realtime Database Sync

Data automatically syncs both directions:

```
User Update in Firestore
    ↓
syncUserToRTDB() trigger
    ↓
Update Realtime Database
    ↓
Client sees real-time changes
```

And reverse:

```
User Update in Realtime DB
    ↓
syncRTDBToFirestore() trigger
    ↓
Update Firestore
    ↓
Admin dashboard refreshes
```

### Real-Time User Data Structure

```
/users/{userId}
  ├── wallet: "0x123abc..."
  ├── status: "active"
  ├── frozen: false
  ├── vipLevel: 2
  ├── balance: 5000
  └── lastModified: 1705773600000
```

---

## Database Rules

The file `database.rules.json` contains:

- **Master**: Full read/write access to all user data
- **Admin**: Read access to users (with proper permissions), no write
- **Users**: Read own data, limited update permission
- **Public**: No access to sensitive data

---

## Activity Logging

All admin actions are logged automatically:

```
/activityLog/{logId}
  ├── adminId: "admin123"
  ├── adminUsername: "master"
  ├── action: "freeze_account"
  ├── userId: "user123"
  ├── reason: "Suspicious activity"
  └── timestamp: 1705773600000
```

---

## Automatic Cleanup

### Daily Cleanup (3 AM Hong Kong Time)

The `cleanupDeletedUsers()` function runs daily and:
- Checks Firestore for all users
- Checks Realtime Database
- Removes orphaned users from RTDB
- Logs cleanup activity

### On User Deletion

When a user is deleted from Firebase Authentication:
- All Firestore data deleted
- All Realtime Database data deleted
- Activity logs updated
- GDPR compliant

---

## Error Handling

### Common Errors & Solutions

#### "Permission denied"
- Make sure user is master/admin
- Check admin role in admins collection

#### "Must be authenticated"
- User not logged in
- Token expired

#### "Must be an admin to manage users"
- Only admins can access user functions
- Check admins collection

---

## Best Practices

1. **Always verify admin role** before allowing user management
2. **Log all sensitive actions** to activity logs
3. **Use bulk functions** for multiple user updates
4. **Monitor daily cleanup** in activity logs
5. **Test functions** in emulator before production
6. **Backup data regularly** before bulk operations

---

## Testing in Firebase Emulator

```bash
firebase emulators:start
```

Then call functions:

```javascript
const functions = firebase.app().functions('asia-east2');
const updateUserStatus = functions.httpsCallable('updateUserStatus');

await updateUserStatus({
  userId: 'test-user-123',
  status: 'active'
});
```

---

## Firebase Console Monitoring

1. Go to Firebase Console
2. Navigate to **Functions**
3. See all 8 functions deployed
4. View logs and errors
5. Monitor execution times

---

## Troubleshooting

### Functions not deploying

```bash
# Check Node version
node --version  # Should be 18+

# Clear cache
rm -rf functions/node_modules
cd functions && npm install && cd ..

# Deploy again
firebase deploy --only functions --project=onchainweb-37d30
```

### Real-time sync not working

1. Check Realtime Database is enabled in Firebase Console
2. Verify database.rules.json is deployed
3. Check Cloud Function logs for errors
4. Ensure user has admin role

### Activity logs not appearing

- Check activityLogs collection in Firestore
- Verify admin is authenticated
- Check Cloud Function execution logs

---

## File Structure

```
/functions
  ├── index.js ............... Cloud Functions code
  ├── package.json ........... Dependencies
  └── node_modules/

/database.rules.json ......... Realtime Database security rules
/firebase.json .............. Firebase configuration
/firestore.rules ............ Firestore security rules
```

---

## Next Steps

1. ✅ Deploy Cloud Functions
2. ✅ Deploy Database Rules
3. 📋 Update admin dashboard UI to use functions
4. 📋 Create admin control panel for user management
5. 📋 Set up monitoring and alerts

---

## Support & Documentation

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [Cloud Functions Best Practices](https://firebase.google.com/docs/functions/tips)
- [Security Rules Guide](https://firebase.google.com/docs/database/security)

---

**Status**: ✅ Ready to Deploy
**Functions**: 8 total
**Last Updated**: January 20, 2026
**Region**: asia-east2
