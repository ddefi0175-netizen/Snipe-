# Master Account Login Fix

## Problem
Master accounts could not login even with valid Firebase Authentication credentials. The login would succeed at the authentication level but fail when trying to access the admin dashboard.

## Root Cause
There was a **document ID mismatch** between how admin documents were created and how they were retrieved:

### Creation (in `initializeMasterAccount`)
```javascript
const adminId = user.uid;  // Uses Firebase Auth UID
const adminRef = doc(db, 'admins', adminId);
```

### Retrieval (in `getAdminByEmail` - BEFORE FIX)
```javascript
const adminRef = doc(db, 'admins', email.replace(/[^a-zA-Z0-9]/g, '_'));
```

The function was trying to find a document using a sanitized email as the ID, but documents were created using the Firebase Auth UID.

## Solution
Changed `getAdminByEmail` to **query by the email field** instead of using email as the document ID:

```javascript
// NEW: Query the admins collection by email field
const q = query(collection(db, 'admins'), where('email', '==', email), limit(1));
const querySnapshot = await getDocs(q);

if (!querySnapshot.empty) {
    const adminDoc = querySnapshot.docs[0];
    return { ...adminDoc.data(), id: adminDoc.id };
}
```

This matches how documents are actually created (with UID as document ID).

## How Master Account Login Works (After Fix)

### 1. Master Account Creation
When `initializeMasterAccount(email, password)` is called:
1. Creates Firebase Auth user
2. Creates Firestore document: `admins/{uid}` with:
   - `email`: user email
   - `uid`: Firebase Auth UID
   - `role`: "master"
   - `permissions`: ["all"]

### 2. Login Flow
When master tries to login:
1. **Email check**: Verifies email is in `VITE_ADMIN_ALLOWLIST`
2. **Firebase Auth**: Signs in with `signInWithEmailAndPassword`
3. **Admin lookup**: Queries Firestore `admins` collection where `email == user.email`
4. **Role check**: Verifies admin document has `role: 'master'`
5. **Access granted**: User can access master dashboard

### 3. Master Account Requirements
For a master account to work:
- Email must be in `VITE_ADMIN_ALLOWLIST` environment variable
- Firebase Auth user must exist
- Firestore document must exist in `admins` collection with:
  - `email` field matching the login email
  - `role` field set to "master"
  - `permissions` field (usually ["all"])

## Testing Master Account Login

### 1. Setup Environment
```bash
# In .env file
VITE_ADMIN_ALLOWLIST=master@yourdomain.com
```

### 2. Create Master Account (One-Time)
```javascript
// Use the master account setup form or
import { initializeMasterAccount } from './services/adminService';
await initializeMasterAccount('master@yourdomain.com', 'SecurePassword123');
```

### 3. Login
- Navigate to `/master-admin`
- Enter email: `master@yourdomain.com`
- Enter password
- Should successfully login and see master dashboard

## Firestore Security Rules
The `admins` collection should have these rules:
```javascript
match /admins/{adminId} {
  // Only admins can read admin data
  allow read: if isAdmin();
  
  // Only master admin can create new admins
  allow create: if isMasterAdmin() &&
                   request.resource.data.keys().hasAll(['email', 'role', 'permissions']);
}
```

## Additional Notes

### Document ID Strategy
All admin documents now consistently use Firebase Auth UID as the document ID:
- Ensures uniqueness (UID is guaranteed unique)
- Prevents conflicts from email sanitization
- Makes lookups by UID simple: `doc(db, 'admins', uid)`
- Lookups by email use queries: `where('email', '==', email)`

### Email Validation
- The `VITE_ADMIN_ALLOWLIST` is comma-separated
- Emails are trimmed and lowercased for comparison
- Example: `VITE_ADMIN_ALLOWLIST=master@domain.com,admin@domain.com`

### Master vs Regular Admin
- **Master**: `role: 'master'`, `permissions: ['all']` - Full access
- **Regular Admin**: `role: 'admin'`, `permissions: [...]` - Limited permissions

## Files Modified
- `Onchainweb/src/services/adminService.js` - Fixed `getAdminByEmail()` function

## Related Components
- `MasterAdminDashboard.jsx` - Master dashboard UI
- `AdminRouteGuard.jsx` - Authentication guard for admin routes
- `AdminLogin.jsx` - Admin login form
- `MasterAccountSetup.jsx` - Master account creation UI
- `adminAuth.js` - Admin authentication logic

## Migration Notes
Existing deployments with admin documents created using email-based IDs will need migration:
1. Query existing documents by email field
2. If document exists with sanitized email as ID, create new document with UID as ID
3. Copy all data to new document
4. Delete old document (after verification)

Or simply recreate admin accounts if there are few admins.
