# Cloud Functions Deployment Status

## Date: January 20, 2026

## Current Status

### ✅ Completed
- **Realtime Database Rules**: Successfully deployed to `onchainweb-37d30-default-rtdb`
- **RTDB Security**: Master/admin access controls active
- **Code**: All 8 Cloud Functions written and ready in `/functions/index.js`
- **Dependencies**: firebase-functions ^5.1.0, firebase-admin ^12.0.0 installed
- **Runtime**: Upgraded to Node.js 20
- **Firebase Extensions**:
  - firestore-send-email (ACTIVE)
  - storage-resize-images (ACTIVE)

### ❌ Blocked
- **Cloud Functions Deployment**: All 8 functions failing to build in Cloud Build
- **Error**: "Build error details not available" - logs inaccessible
- **Build Duration**: Consistent 23-28 second failures

## Functions Ready to Deploy

1. **updateUserStatus** - Update user status/data (master/admin)
2. **freezeUserAccount** - Freeze/unfreeze accounts (master only)
3. **getUserList** - Get paginated user list (admin)
4. **syncUserToRTDB** - Firestore → RTDB sync trigger
5. **syncRTDBToFirestore** - RTDB → Firestore sync trigger
6. **bulkUpdateUserStatus** - Bulk user operations (master)
7. **cleanupDeletedUsers** - Daily cleanup scheduled function
8. **cleanupUserDataOnDelete** - Auth deletion trigger

All in region: **asia-east2**

## IAM Permissions Granted

### Service Accounts Configured
1. **Compute Service Account**: `766146811888-compute@developer.gserviceaccount.com`
   - Storage Object Viewer ✅

2. **Cloud Build Service Account**: `766146811888@cloudbuild.gserviceaccount.com`
   - Storage Admin ✅
   - Artifact Registry Reader ✅

3. **Cloud Functions Service Agent**: `service-766146811888@gcf-admin-robot.iam.gserviceaccount.com`
   - Storage Admin ✅
   - Artifact Registry Reader ✅

## Root Cause Analysis

The consistent build failures with no accessible logs suggest one of:

1. **Missing Service APIs** (most likely):
   - Cloud Run API might not be enabled
   - Event Arc API might be missing
   - Realtime Database API might need enabling

2. **VPC Service Controls**:
   - Service accounts might be blocked by VPC-SC perimeter
   - Need to allow access to GCS, Artifact Registry, Cloud Build

3. **Log Access Permissions**:
   - User lacks `roles/logging.viewer` to see build logs
   - Logs might be in a different log bucket

4. **Regional Quota**:
   - asia-east2 might have quota limits
   - Could try different region (us-central1, asia-northeast1)

## Recommended Next Steps

### Option 1: Enable Missing APIs (Try First)
```bash
gcloud services enable run.googleapis.com --project=onchainweb-37d30
gcloud services enable eventarc.googleapis.com --project=onchainweb-37d30
gcloud services enable firebasedatabase.googleapis.com --project=onchainweb-37d30
```

Then redeploy:
```bash
cd /workspaces/Snipe-
firebase deploy --only functions --project=onchainweb-37d30
```

### Option 2: Grant Log Viewer Access
In IAM, grant your user:
- Role: `Logs Viewer` (roles/logging.viewer)

Then check build logs:
```bash
gcloud builds log --region=asia-east2 <BUILD_ID>
```

### Option 3: Try Different Region
Change all functions from `asia-east2` to `us-central1`:
- Edit `/functions/index.js` - replace `.region('asia-east2')` with `.region('us-central1')`
- Redeploy

### Option 4: Migrate to Cloud Functions Gen2
Gen2 has better error reporting and different build system:
- Update `firebase.json` functions section
- Enable Cloud Run API
- Redeploy

## Workaround: Manual Function Testing

While deployment is blocked, you can test functions locally:

```bash
cd /workspaces/Snipe-/functions
npm install
firebase emulators:start --only functions
```

This will run functions at `http://localhost:5001/onchainweb-37d30/asia-east2/<functionName>`

## Files Modified Today

- ✅ `/functions/package.json` - Dependencies and Node 20 engine
- ✅ `/functions/index.js` - 8 Cloud Functions for user management
- ✅ `/database.rules.json` - RTDB security rules (deployed)
- ✅ `/firebase.json` - Added database config, Node 20 runtime
- ✅ `REALTIME_DATABASE_SETUP.md` - Documentation

## Git Status

All changes committed and pushed to main:
- Commit: `ef9fcac` - "Bump firebase-functions SDK"
- Commit: `7eb9027` - "Fix RTDB rules and upgrade functions runtime"

## Next Session Checklist

- [ ] Enable Cloud Run API
- [ ] Enable Event Arc API
- [ ] Grant user Logs Viewer role
- [ ] Check one build log for actual error
- [ ] Consider region change if quota issue
- [ ] Test functions in emulator if deployment still blocked

---

**Status**: RTDB rules deployed ✅ | Functions blocked pending API/log access 🔴
