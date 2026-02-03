# Vercel Environment Variable Scripts

This directory contains automated scripts to manage Vercel environment variables for the onchainweb.site deployment.

## Scripts Overview

### 1. `setup-vercel-env.sh` - Automated Environment Setup

**Purpose**: Automatically configure all required Vercel environment variables and trigger a production redeployment.

**Usage**:
```bash
./setup-vercel-env.sh
```

**What it does**:
1. ✅ Checks if Vercel CLI is installed (installs if needed)
2. ✅ Verifies Vercel login status (prompts to login if needed)
3. ✅ Detects and links to your Vercel project
4. ✅ Sets required admin environment variables:
   - `VITE_ENABLE_ADMIN=true`
   - `VITE_ADMIN_ROUTE=/admin`
   - `VITE_MASTER_ADMIN_ROUTE=/master-admin`
   - `VITE_ADMIN_ALLOWLIST=master@onchainweb.site`
5. ✅ Prompts for Firebase credentials (with defaults from .env if available)
6. ✅ Optionally configures WalletConnect Project ID
7. ✅ Triggers production redeployment automatically
8. ✅ Provides verification steps and next actions

**When to use**:
- First-time Vercel deployment setup
- Fixing "Admin Features Disabled" issue
- Updating environment variables after changes
- Recovering from missing configuration

### 2. `check-vercel-env.sh` - Environment Status Check

**Purpose**: Check the current status of all Vercel environment variables and identify missing ones.

**Usage**:
```bash
./check-vercel-env.sh
```

**What it shows**:
- ✅/❌ Status of each required environment variable
- Which variables are set for Production, Preview, and Development
- Current deployment status
- Summary of missing variables
- Next steps to fix issues

**When to use**:
- Before deploying to verify configuration
- Troubleshooting deployment issues
- Verifying that environment variables are set correctly
- After running setup script to confirm success

## Quick Start

### Initial Setup

1. **Run the setup script**:
   ```bash
   ./setup-vercel-env.sh
   ```

2. **Follow the interactive prompts**:
   - Login to Vercel if prompted
   - Confirm Firebase credentials
   - Optionally add WalletConnect ID

3. **Wait for deployment** (2-3 minutes)

4. **Create master account in Firebase Console**:
   - Visit: https://console.firebase.google.com
   - Go to: Authentication → Users → Add user
   - Email: `master@onchainweb.site`
   - Password: [Strong password, 12+ characters]

5. **Verify the deployment**:
   - Visit: https://onchainweb.site/master-admin
   - Expected: Login page (not "Admin Features Disabled")
   - Status should show: `VITE_ENABLE_ADMIN = true`

### Checking Status

To verify your environment variables are set correctly:

```bash
./check-vercel-env.sh
```

This will show:
- All admin variables status
- All Firebase variables status
- Optional variables status
- Latest deployment information

## Troubleshooting

### "Vercel CLI is not installed"

**Solution**: The script will automatically install it, or install manually:
```bash
npm install -g vercel
```

### "Not logged in to Vercel"

**Solution**: The script will prompt you to login, or login manually:
```bash
vercel login
```

### "Not linked to a Vercel project"

**Solution**: Run from the Onchainweb directory:
```bash
cd Onchainweb
vercel link
cd ..
```

### "Failed to set environment variable"

**Possible causes**:
1. Not logged in to Vercel
2. No permission to modify project
3. Invalid project link

**Solution**:
1. Verify login: `vercel whoami`
2. Check project access in Vercel dashboard
3. Re-link project: `vercel link`

### Environment variables set but deployment still shows error

**Solution**:
1. Wait for deployment to complete (check Vercel dashboard)
2. Clear browser cache
3. Trigger manual redeployment: `vercel --prod`

## Environment Variables Reference

### Required Admin Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_ENABLE_ADMIN` | `true` | Enables admin features |
| `VITE_ADMIN_ROUTE` | `/admin` | Admin panel route |
| `VITE_MASTER_ADMIN_ROUTE` | `/master-admin` | Master admin route |
| `VITE_ADMIN_ALLOWLIST` | `master@onchainweb.site` | Allowed admin emails |

### Required Firebase Variables

| Variable | Example | Get From |
|----------|---------|----------|
| `VITE_FIREBASE_API_KEY` | `AIza...` | Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | `project.firebaseapp.com` | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | `project-id` | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | `project.firebasestorage.app` | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Firebase Console |
| `VITE_FIREBASE_APP_ID` | `1:123:web:abc` | Firebase Console |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Firebase Console |

### Optional Variables

| Variable | Purpose | Get From |
|----------|---------|----------|
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect QR code | https://cloud.walletconnect.com |
| `VITE_TELEGRAM_BOT_TOKEN` | Telegram integration | @BotFather on Telegram |
| `VITE_TELEGRAM_CHAT_ID` | Telegram chat ID | Bot API |

## Manual Commands

If you prefer to set variables manually:

### Add a variable:
```bash
vercel env add VARIABLE_NAME production
# Then enter the value when prompted
```

### List all variables:
```bash
vercel env ls
```

### Remove a variable:
```bash
vercel env rm VARIABLE_NAME production
```

### Trigger redeployment:
```bash
cd Onchainweb
vercel --prod
```

## Related Documentation

- [Vercel Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md) - Full deployment guide
- [Master Account Setup Guide](MASTER_ACCOUNT_SETUP_GUIDE.md) - Setting up master account
- [Quick Start Guide](QUICK_START_GUIDE.md) - General project setup
- [Firebase Configuration](BACKEND_REPLACEMENT.md) - Firebase setup details

## Support

If you encounter issues:

1. Check script output for error messages
2. Run `./check-vercel-env.sh` to verify status
3. Review the Vercel dashboard for deployment logs
4. Check browser console for JavaScript errors
5. Verify Firebase credentials are correct

## License

MIT License - See LICENSE file for details
