# Backend Setup & Installation Guide

**Date**: January 10, 2026
**Status**: ✅ Ready to Run

## Current State

✅ **node_modules**: Installed (7 core dependencies)
✅ **.env file**: Created and ready
✅ **package.json**: Configured
✅ **All dependencies**: Verified

## Dependencies Installed

```
snipe-backend@1.0.0
├── bcryptjs@3.0.3          (Password hashing)
├── cors@2.8.5              (Cross-origin requests)
├── dotenv@16.6.1           (Environment variables)
├── express@4.22.1          (Web framework)
├── jsonwebtoken@9.0.3      (JWT authentication)
├── mongoose@7.8.8          (MongoDB ORM - deprecated but available)
└── nodemon@3.1.11          (Development auto-reload)
```

## Quick Start

### 1. Ensure Dependencies are Installed

If you're starting fresh or see "node_modules not found" errors:

```bash
cd backend
./setup-dependencies.sh
```

Or manually:

```bash
cd backend
npm install
```

### 2. Configure Environment

Update `backend/.env` with your values:

```dotenv
# Firebase Project ID (REQUIRED)
FIREBASE_PROJECT_ID=onchainweb-37d30

# Authentication
JWT_SECRET=your-32-char-random-key
MASTER_USERNAME=snipe_admin_secure
MASTER_PASSWORD=YourSecurePassword!123

# Server
PORT=4000
NODE_ENV=development
```

### 3. Start Development Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Server running on http://localhost:4000
✅ Firebase initialized
✅ Ready to accept requests
```

## Important Notes

### node_modules is NOT in Git

✅ **This is intentional** - best practice
- node_modules is in .gitignore
- Dependencies are defined in package-lock.json
- After cloning, run `npm install` to restore

### .env File is NOT in Git

✅ **This is intentional** - security practice
- .env is in .gitignore
- Contains sensitive credentials
- Never commit secrets to git
- Use `.env.example` as template

### MongoDB Backend is Deprecated

⚠️ **Note for v2.0.0+**:
- MongoDB (mongoose) is kept for legacy compatibility
- Primary database is Firebase Firestore
- New deployments: use Firebase only
- mongoose can be removed if maintaining Firebase-only

## Troubleshooting

### "node_modules not found"

```bash
cd backend
npm install
```

### "Cannot find module 'express'"

Same solution:
```bash
npm install
```

### ".env file not found"

Create from example:
```bash
cp .env.example .env
# Then edit .env with your values
```

### Server won't start

1. ✅ Check node_modules exists: `ls node_modules`
2. ✅ Check .env exists: `cat .env | head`
3. ✅ Check Firebase config: `echo $FIREBASE_PROJECT_ID`
4. ✅ Check port is free: `lsof -i :4000`

## What NOT to Commit

```
❌ node_modules/           (too large, auto-generated)
❌ .env                    (contains secrets)
❌ .DS_Store               (macOS files)
❌ *.log                   (log files)
```

## What IS Committed

```
✅ package.json            (dependencies list)
✅ package-lock.json       (locked versions)
✅ .env.example            (template only)
✅ src/                    (all source code)
✅ .gitignore              (ignore rules)
```

## Production Deployment

When deploying to production:

1. **On target server**, run:
   ```bash
   npm install --production
   ```

2. **Set environment variables** via hosting platform:
   - Firebase Project ID
   - JWT Secret
   - Master credentials
   - NODE_ENV=production

3. **Start with**:
   ```bash
   npm start
   # or with PM2:
   pm2 start index.js --name "snipe-backend"
   ```

## Support

For issues with dependencies:
- Check [package.json](package.json) for versions
- Run `npm audit` to check for vulnerabilities
- Run `npm update` to update packages safely

---

**Last Updated**: January 10, 2026
**Backend Version**: 1.0.0
