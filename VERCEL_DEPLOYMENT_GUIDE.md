# Vercel Deployment Guide for Snipe Frontend

This guide ensures WalletConnect and all features work correctly on Vercel.

## Prerequisites

1. Vercel account connected to your GitHub repository
2. WalletConnect Project ID (get from https://cloud.walletconnect.com)

## Step 1: Get WalletConnect Project ID

WalletConnect is required for users to connect mobile wallets via QR code.

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign up for a free account
3. Create a new project
4. Copy your Project ID (looks like: `2a1b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`)

## Step 2: Configure Vercel Environment Variables

### Via Vercel Dashboard:

1. Go to your Vercel project dashboard
2. Click on "Settings"
3. Navigate to "Environment Variables"
4. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_API_BASE` | `https://snipe-api.onrender.com/api` | Production, Preview, Development |
| `VITE_WALLETCONNECT_PROJECT_ID` | `your-project-id-here` | Production, Preview, Development |

### Via Vercel CLI:

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Set environment variables
vercel env add VITE_API_BASE production
# Enter: https://snipe-api.onrender.com/api

vercel env add VITE_WALLETCONNECT_PROJECT_ID production
# Enter: your-project-id-here
```

## Step 3: Trigger Deployment

### Option A: Push to GitHub
```bash
git push origin main
# Vercel will auto-deploy
```

### Option B: Redeploy via Dashboard
1. Go to Vercel dashboard
2. Navigate to "Deployments"
3. Click "Redeploy" on the latest deployment

### Option C: Vercel CLI
```bash
vercel --prod
```

## Step 4: Verify Deployment

After deployment completes:

1. **Visit your app**: https://www.onchainweb.app
2. **Test Build Logs**: Check that build shows no errors related to missing packages
3. **Test Wallet Connection**:
   - Click "Connect Wallet"
   - Try connecting with MetaMask or another browser wallet
   - Try WalletConnect (should show QR code)

### Expected Build Output

```
✓ built in 4-6s
dist/index.html                    0.88 kB
dist/assets/index-[hash].css     167.81 kB
dist/assets/index-[hash].js      359.64 kB
dist/assets/index-[hash].js      496.01 kB
```

## Troubleshooting

### Build Fails with "Cannot resolve import 'react-router-dom'"

**Problem**: Dependencies not installed

**Solution**: Vercel should automatically run `npm install`. Check `vercel.json`:
```json
{
  "buildCommand": "cd Onchainweb && npm install && npm run build",
  "outputDirectory": "Onchainweb/dist"
}
```

### WalletConnect Shows Error "Project ID Required"

**Problem**: `VITE_WALLETCONNECT_PROJECT_ID` not set or not available at build time

**Solution**: 
1. Verify the environment variable is set in Vercel dashboard
2. Make sure it's set for "Production" environment
3. Redeploy the application

### Wallet Connection Button Does Nothing

**Causes & Solutions**:

1. **JavaScript Error**: Check browser console for errors
2. **Environment Detection**: Make sure you're testing in a supported browser
3. **Missing Dependencies**: Verify build logs show all packages installed

### WalletConnect QR Code Doesn't Appear

**Causes & Solutions**:

1. **Project ID Invalid**: Verify Project ID is correct in Vercel settings
2. **Network Error**: Check browser network tab for failed requests to WalletConnect relay
3. **Ad Blocker**: Some ad blockers may block WalletConnect - try disabling

## Environment Variables Reference

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `VITE_API_BASE` | ✅ Yes | Backend API endpoint | `https://snipe-api.onrender.com/api` |
| `VITE_WALLETCONNECT_PROJECT_ID` | ✅ Yes (for WalletConnect) | WalletConnect Project ID | `2a1b3c4d5e6f7g8h...` |
| `VITE_APP_NAME` | ❌ No | App name for branding | `OnchainWeb` |
| `VITE_APP_URL` | ❌ No | App URL for meta tags | `https://onchainweb.app` |

## Build Configuration

The build is configured in `vercel.json`:

```json
{
  "buildCommand": "cd Onchainweb && npm install && npm run build",
  "outputDirectory": "Onchainweb/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
1. Dependencies are installed before build
2. Build output goes to correct directory
3. SPA routing works correctly

## Post-Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Deployment succeeded without errors
- [ ] App loads at https://www.onchainweb.app
- [ ] No console errors in browser
- [ ] "Connect Wallet" button appears
- [ ] MetaMask connection works
- [ ] WalletConnect QR code appears
- [ ] Mobile wallet connection works
- [ ] Admin panel accessible at /admin
- [ ] Master dashboard accessible at /master-admin

## Support

If you encounter issues:

1. Check build logs in Vercel dashboard
2. Check browser console for JavaScript errors
3. Verify all environment variables are set
4. Review [WalletConnect Implementation Guide](WALLETCONNECT_IMPLEMENTATION.md)
5. Check [WalletConnect Login Fix Documentation](WALLETCONNECT_LOGIN_FIX.md)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [WalletConnect Cloud](https://cloud.walletconnect.com)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Last Updated**: 2026-01-08
**Deployment Platform**: Vercel
**Status**: ✅ Production Ready
