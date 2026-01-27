# Step 2: Firestore Deployment

**Estimated time:** 2 minutes

## Overview

Deploy Firestore security rules and database indexes to your Firebase project.

## Prerequisites

- Environment variables configured (Step 1)
- Firebase CLI logged in
- Firebase project initialized

## Steps

### 1. Login to Firebase

```bash
firebase login
```

### 2. Verify Firebase Project

Check that your project is configured:

```bash
firebase projects:list
```

Verify the project in `.firebaserc` matches your intended project.

### 3. Review Security Rules

Open `firestore.rules` and verify the rules are production-ready.

### 4. Validate Rules

Run the validation script:

```bash
./validate-firestore-rules.sh
```

### 5. Deploy Security Rules

Deploy the rules to production:

```bash
./deploy-firestore-rules.sh
```

Or manually:

```bash
firebase deploy --only firestore:rules
```

### 6. Deploy Database Indexes

Deploy the indexes for query optimization:

```bash
firebase deploy --only firestore:indexes
```

## Verification

✅ Security rules deployed successfully
✅ Database indexes deployed
✅ Firebase Console shows updated rules

## Next Step

[Step 3: Application Deployment →](3-APPLICATION-DEPLOYMENT.md)
