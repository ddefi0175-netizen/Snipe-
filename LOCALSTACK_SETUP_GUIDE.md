# 🚀 LocalStack Setup & Firebase Emulation Guide

**LocalStack Auth Token**: ✅ **ACTIVATED**
**Token**: `ls-nIMOYoBO-veTa-zOTe-9009-daJa07294c5e`
**Status**: Ready to use

---

## 📋 What is LocalStack?

LocalStack emulates AWS services (and Firebase) locally on your machine, allowing you to:
- ✅ Test Firebase services without internet
- ✅ Develop offline
- ✅ Avoid Firebase Console manual setup (in some cases)
- ✅ Run Firestore, Auth, Storage locally
- ✅ Debug issues in isolation
- ✅ Save on Firebase API calls during development

---

## 🎯 Quick Start: Launch LocalStack

### Option 1: Start LocalStack with Firestore Emulation

```bash
cd /workspaces/Snipe-
localstack start -e SERVICES=firestore,dynamodb -d
```

**What this does**:
- Starts LocalStack in background (`-d`)
- Enables Firestore service (`-e SERVICES=firestore`)
- Enables DynamoDB (for data storage)

**Wait 10-20 seconds for startup**

### Option 2: Start with Full Firebase Services

```bash
localstack start \
  -e SERVICES=firestore,dynamodb,cognito-idp,s3 \
  -d
```

**Services included**:
- ✅ Firestore (document database)
- ✅ DynamoDB (backup database)
- ✅ Cognito IDP (authentication)
- ✅ S3 (file storage)

---

## ✅ Verify LocalStack is Running

```bash
localstack status
```

**Expected output**:
```
✓ All LocalStack services running
✓ LocalStack hostname: localhost
✓ LocalStack port: 4566
```

Or check one service:

```bash
curl http://localhost:4566/health
```

Expected: `200 OK` response with services list

---

## 🔧 Configure Your App for LocalStack

### Step 1: Create `.env.local` (Local override)

```bash
cat > Onchainweb/.env.local << 'EOF'
# Override Firebase to use LocalStack
VITE_FIREBASE_EMULATOR_HOST=localhost:9099
VITE_FIRESTORE_EMULATOR_HOST=localhost:8080
VITE_STORAGE_EMULATOR_HOST=localhost:9199
VITE_AUTH_EMULATOR_HOST=localhost:9099

# Keep original Firebase project ID (LocalStack uses it for emulation)
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_DATABASE_URL=http://localhost:4566
VITE_FIREBASE_PROJECT_ID=onchainweb-37d30
VITE_FIREBASE_STORAGE_BUCKET=localhost:9199
VITE_FIREBASE_MESSAGING_SENDER_ID=demo-sender
VITE_FIREBASE_APP_ID=demo-app
EOF
```

### Step 2: Start LocalStack Firebase Emulator

```bash
# Start Firebase emulator on LocalStack
firebase emulators:start --project onchainweb-37d30
```

**Expected output**:
```
✓ Firestore Emulator running on localhost:8080
✓ Authentication Emulator running on localhost:9099
✓ Cloud Storage Emulator running on localhost:9199
```

---

## 🧪 Test LocalStack Connection

### Test 1: Check Firestore Emulator

```bash
curl http://localhost:8080/healthz
```

Expected output: Service is running

### Test 2: Check Authentication Emulator

```bash
curl http://localhost:9099/healthz
```

Expected output: Auth service ready

### Test 3: Check Storage Emulator

```bash
curl http://localhost:9199/healthz
```

Expected output: Storage service ready

---

## ⚙️ Run App with LocalStack

### Step 1: Start LocalStack

```bash
localstack start -e SERVICES=firestore,dynamodb,cognito-idp,s3 -d
```

Wait 15 seconds

### Step 2: Start Firebase Emulator

```bash
firebase emulators:start --project onchainweb-37d30
```

**Keep this running** (it will show a dashboard at http://localhost:4000)

### Step 3: Start Development Server (in new terminal)

```bash
cd Onchainweb
npm run dev
```

**Your app will now**:
- ✅ Connect to LocalStack emulated services
- ✅ Create users in emulated Firestore
- ✅ Store data in emulated storage
- ✅ Authenticate with emulated Auth
- ✅ No internet connection needed!

---

## 📊 Firebase Emulator Dashboard

Once Firebase emulator is running, open:

```
http://localhost:4000
```

You can:
- 📊 View Firestore collections
- 👤 Manage Authentication users
- 📁 Browse Cloud Storage
- 🔍 Inspect data in real-time

---

## 🛑 Stop LocalStack

### Stop All Services

```bash
localstack stop
```

### Or Kill All Containers

```bash
docker ps
docker stop <container-id>
```

---

## 🐛 Troubleshooting

### Problem: "LocalStack connection refused"
**Solution**:
```bash
# Check if LocalStack is running
localstack status

# If not, start it
localstack start -d
```

### Problem: "Cannot connect to Firestore Emulator"
**Solution**:
```bash
# Check emulator is running
firebase emulators:start --project onchainweb-37d30

# Check port 8080 is available
lsof -i :8080
```

### Problem: "Port already in use"
**Solution**:
```bash
# Kill process using port
lsof -i :8080 | awk 'NR==2 {print $2}' | xargs kill -9

# Then restart
firebase emulators:start --project onchainweb-37d30
```

### Problem: "Auth token expired"
**Solution**:
```bash
# Re-apply auth token
localstack auth set-token "ls-nIMOYoBO-veTa-zOTe-9009-daJa07294c5e"

# Restart LocalStack
localstack stop
localstack start -d
```

---

## 📚 Create Test Data

### Create Test User in Emulated Firebase

```bash
# Via Firebase CLI
firebase auth:create --project onchainweb-37d30 \
  --email test@example.com \
  --password password123
```

Or in Emulator UI at http://localhost:4000:
1. Go to **Authentication**
2. Click **Add User**
3. Email: `test@example.com`
4. Password: `password123`
5. Click **Add User**

### Create Test Firestore Documents

In Emulator Dashboard (http://localhost:4000):
1. Go to **Firestore**
2. Click **+ Start collection**
3. Name: `users`
4. Add document with test data

---

## 🔄 Development Workflow with LocalStack

```
1. Start LocalStack
   localstack start -d

2. Start Firebase Emulator (new terminal)
   firebase emulators:start --project onchainweb-37d30

3. Start Development Server (another terminal)
   cd Onchainweb
   npm run dev

4. Develop & Test
   - Open http://localhost:5173
   - All data stored locally
   - Test authentication offline
   - Debug admin features

5. View Data
   - Firestore Emulator: http://localhost:4000
   - See real-time changes
   - Create test data
   - Inspect documents

6. When Done
   - Stop dev server (Ctrl+C)
   - Stop emulator (Ctrl+C)
   - Stop LocalStack (localstack stop)
```

---

## 🎯 Use Cases

### Use LocalStack When:
✅ Developing features without Firebase
✅ Testing authentication flows
✅ Building admin features
✅ Adding new database collections
✅ Working offline (no internet)
✅ Debugging issues in isolation
✅ Running tests

### Use Production Firebase When:
✅ Deploying to production
✅ Testing with real users
✅ Using real wallet connections
✅ Monitoring production metrics
✅ Accessing real data

---

## ⚡ Pro Tips

### Tip 1: Save Emulator Data Between Sessions

```bash
# Export data when stopping
firebase emulators:export ./exportedData

# Import data when starting
firebase emulators:start --import ./exportedData
```

### Tip 2: Run Multiple Dev Sessions

```bash
# Terminal 1: LocalStack
localstack start -d

# Terminal 2: Firebase Emulator
firebase emulators:start --project onchainweb-37d30

# Terminal 3: Dev Server
npm run dev

# Terminal 4: Testing/Scripts
# Run tests, scripts, etc.
```

### Tip 3: Reset All Data

```bash
# Stop emulator
Ctrl+C in emulator terminal

# Delete export directory
rm -rf ./exportedData

# Restart fresh
firebase emulators:start --project onchainweb-37d30
```

### Tip 4: Monitor LocalStack Logs

```bash
# Watch logs in real-time
localstack logs -f
```

---

## 🔐 Auth Token Info

**Your Token**:
```
ls-nIMOYoBO-veTa-zOTe-9009-daJa07294c5e
```

**Token Status**: ✅ Active
**Expiration**: Check in LocalStack dashboard
**How to renew**: Contact LocalStack support

**To update token**:
```bash
localstack auth set-token "new-token-here"
```

---

## 📖 Documentation Links

| Resource | Link |
|----------|------|
| **LocalStack Docs** | https://docs.localstack.cloud |
| **Firebase Emulator** | https://firebase.google.com/docs/emulator-suite |
| **Firestore Emulator** | https://firebase.google.com/docs/firestore/local-emulation |
| **Auth Emulator** | https://firebase.google.com/docs/auth/emulator-setup |

---

## ✨ Summary

LocalStack enables you to:
- ✅ Develop completely offline
- ✅ Test Firebase features locally
- ✅ Speed up iteration cycle
- ✅ Debug issues in isolation
- ✅ Avoid Firebase quota usage
- ✅ Run tests without real Firebase
- ✅ Collaborate with team on same data

---

## 🚀 Quick Reference

```bash
# Start LocalStack
localstack start -d

# Start Firebase Emulator
firebase emulators:start --project onchainweb-37d30

# View EmulatorFirestore Emulator UI
# Open: http://localhost:4000

# Start Dev Server
cd Onchainweb && npm run dev

# Test app
# Open: http://localhost:5173

# Stop everything
# Ctrl+C in all terminals
# localstack stop
```

---

**Happy local development! 🎉**
