# Migration Guide: MongoDB to Firebase

This guide explains the architectural changes from the previous MongoDB-based backend to the new Firebase-based system.

## Overview

### Previous Architecture (MongoDB + Express)
- **Backend**: Node.js + Express server
- **Database**: MongoDB Atlas
- **API**: REST API with JWT authentication
- **Real-time**: Polling-based updates

### New Architecture (Firebase)
- **Backend**: Firebase (serverless)
- **Database**: Firestore (NoSQL)
- **API**: Firebase SDK (direct database access)
- **Real-time**: WebSocket-based real-time listeners
- **Auth**: Firebase Authentication

## Key Benefits of Migration

1. **Real-time by Default**: Firestore provides native real-time listeners, eliminating the need for polling
2. **Simplified Architecture**: No separate backend server to maintain
3. **Better Scalability**: Firebase scales automatically
4. **Lower Costs**: Pay only for what you use
5. **Reduced Complexity**: No need to manage server infrastructure
6. **Offline Support**: Built-in offline data persistence
7. **Security**: Row-level security with Firestore rules

## Breaking Changes

### 1. Environment Variables

**Old (.env)**:
```env
VITE_API_BASE=https://snipe-api.onrender.com/api
```

**New (.env)**:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 2. API Calls

**Old (REST API)**:
```javascript
const response = await fetch(`${API_BASE}/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(userData)
});
const data = await response.json();
```

**New (Firebase SDK)**:
```javascript
import { createUser } from './lib/firebaseService';

const userId = await createUser(userData);
```

### 3. Real-time Updates

**Old (Polling)**:
```javascript
const interval = setInterval(async () => {
  const response = await fetch(`${API_BASE}/trades`);
  const trades = await response.json();
  setTrades(trades);
}, 3000);
```

**New (Real-time Listeners)**:
```javascript
import { subscribeToTrades } from './lib/firebaseService';

const unsubscribe = subscribeToTrades(userId, (trades) => {
  setTrades(trades);
});

// Cleanup when component unmounts
return () => unsubscribe();
```

### 4. Authentication

**Old (JWT)**:
```javascript
const response = await fetch(`${API_BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});
const { token } = await response.json();
localStorage.setItem('token', token);
```

**New (Firebase Auth)**:
```javascript
import { signIn } from './lib/firebaseService';

const userCredential = await signIn(email, password);
const user = userCredential.user;
// Token management handled automatically by Firebase
```

## Data Structure Mapping

### Users Collection

**MongoDB Schema**:
```javascript
{
  _id: ObjectId,
  wallet: String,
  username: String,
  balance: Number,
  createdAt: Date
}
```

**Firestore Document**:
```javascript
{
  wallet: string,
  username: string,
  balance: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Trades Collection

**MongoDB Schema**:
```javascript
{
  _id: ObjectId,
  userId: String,
  type: String,
  amount: Number,
  status: String,
  createdAt: Date
}
```

**Firestore Document**:
```javascript
{
  userId: string,
  type: string,
  amount: number,
  status: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Migration Steps

### For New Installations

1. Follow the [Firebase Setup Guide](FIREBASE_SETUP.md)
2. Configure environment variables
3. Deploy Firestore rules and indexes
4. Create initial admin user
5. Start using the app

### For Existing Users (Migrating Data)

If you have existing data in MongoDB that you want to migrate to Firebase:

1. **Export MongoDB Data**:
   ```bash
   # Export each collection
   mongoexport --uri="mongodb+srv://..." --collection=users --out=users.json
   mongoexport --uri="mongodb+srv://..." --collection=trades --out=trades.json
   mongoexport --uri="mongodb+srv://..." --collection=admins --out=admins.json
   ```

2. **Transform Data Format**:
   - Remove `_id` fields (Firestore generates IDs automatically)
   - Convert date strings to timestamps
   - Ensure field names match Firestore schema

3. **Import to Firestore**:
   You can use the Firebase Console or write a migration script:

   ```javascript
   // migration.js
   import admin from 'firebase-admin';
   import fs from 'fs';

   admin.initializeApp();
   const db = admin.firestore();

   async function importCollection(collectionName, filePath) {
     const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
     const batch = db.batch();
     
     data.forEach((doc) => {
       const { _id, ...docData } = doc;
       const docRef = db.collection(collectionName).doc(_id);
       batch.set(docRef, docData);
     });
     
     await batch.commit();
     console.log(`Imported ${data.length} documents to ${collectionName}`);
   }

   // Run imports
   await importCollection('users', 'users.json');
   await importCollection('trades', 'trades.json');
   await importCollection('admins', 'admins.json');
   ```

4. **Verify Data**:
   - Check Firestore Console to ensure data imported correctly
   - Test API calls to verify data is accessible
   - Run test queries to ensure indexes are working

## Code Updates Required

### 1. Update Imports

Replace all imports from `./lib/api.js` (old REST API) with imports from `./lib/firebaseService.js`:

```javascript
// Old
import { fetchUsers, createUser } from './lib/api';

// New
import { getAllUsers, createUser } from './lib/firebaseService';
```

### 2. Update Component Logic

Replace fetch calls with Firebase SDK calls:

```javascript
// Old
useEffect(() => {
  const loadUsers = async () => {
    const response = await fetch(`${API_BASE}/users`);
    const users = await response.json();
    setUsers(users);
  };
  loadUsers();
}, []);

// New
useEffect(() => {
  const unsubscribe = subscribeToUsers((users) => {
    setUsers(users);
  });
  return () => unsubscribe();
}, []);
```

### 3. Update Error Handling

Firebase errors have different structures:

```javascript
// Old
try {
  const response = await fetch(...);
  if (!response.ok) throw new Error(response.statusText);
} catch (error) {
  console.error('API Error:', error.message);
}

// New
try {
  await createUser(userData);
} catch (error) {
  console.error('Firebase Error:', error.code, error.message);
}
```

## Backend Directory

The `backend/` directory is now **deprecated** and can be removed or kept for reference. All backend functionality is now handled by Firebase.

If you want to keep the old backend for transition purposes:
1. Keep the `backend/` directory
2. Update `VITE_API_BASE` to point to your MongoDB backend
3. The app will work with the old backend until you're ready to fully migrate

## Testing

After migration, test the following:

1. **User Registration**: Create new users via wallet connection
2. **Admin Login**: Login with Firebase auth credentials
3. **Real-time Updates**: Verify trades, deposits update in real-time
4. **Chat System**: Test chat messages between users and admins
5. **Notifications**: Check notification delivery
6. **Permissions**: Verify admin permissions work correctly

## Rollback Plan

If you need to rollback to MongoDB:

1. Keep the `backend/` directory
2. Restore `VITE_API_BASE` in `.env`
3. Revert changes to components using Firebase
4. Restart your backend server

## Support

For migration assistance:
- Check [Firebase Setup Guide](FIREBASE_SETUP.md)
- Review [Firebase Documentation](https://firebase.google.com/docs)
- Open an issue on [GitHub](https://github.com/ddefi0175-netizen/Snipe/issues)

## Conclusion

The migration to Firebase simplifies the architecture while improving real-time capabilities and scalability. While it requires updating environment variables and some code changes, the long-term benefits include:

- Reduced operational overhead
- Better real-time performance
- Automatic scaling
- Built-in security
- Lower costs

Follow this guide carefully and test thoroughly to ensure a smooth transition.
