# Step 3: Vercel Deployment

**Estimated time:** 10 minutes

## Overview

Deploy your application to Vercel (onchainweb.site).

## Prerequisites

- ✅ Environment configured (Step 1)
- ✅ Firestore rules deployed (Step 2)
- ✅ Vercel account created
- ✅ Vercel CLI installed: `npm install -g vercel`

## Quick Deployment

### Option 1: Automated Script

```bash
./deploy-vercel.sh
```

This script will:
1. ✅ Run pre-deployment checks
2. 🔥 Deploy Firestore rules
3. 🏗️  Build application
4. 📤 Deploy to Vercel
5. ✅ Run post-deployment tests

### Option 2: Manual Deployment

#### 1. Login to Vercel

```bash
vercel login
```

#### 2. Build Application

```bash
cd Onchainweb
npm install
npm run build
```

#### 3. Deploy to Production

```bash
vercel --prod
```

#### 4. Configure Custom Domain

In Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add custom domain: `onchainweb.site`
3. Follow DNS configuration instructions

## Configuration Files

### vercel.json

Already configured with:
- ✅ Vite framework detection
- ✅ Static build configuration
- ✅ Asset routing
- ✅ SPA fallback to index.html

```json
{
  "version": 2,
  "builds": [
    {
      "src": "Onchainweb/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "framework": "vite",
  "buildCommand": "cd Onchainweb && npm install && npm run build",
  "outputDirectory": "Onchainweb/dist",
  "installCommand": "cd Onchainweb && npm install"
}
```

## Environment Variables in Vercel

### Set via Dashboard

1. Visit: `https://vercel.com/YOUR-USERNAME/onchainweb-site/settings/environment-variables`
2. Add each variable from your `.env` file
3. Select environment: Production, Preview, Development (as needed)

### Required Variables

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_WALLETCONNECT_PROJECT_ID
VITE_ADMIN_ALLOWLIST
VITE_APP_URL
```

## Post-Deployment

### 1. Verify Deployment

```bash
./test-post-deployment.sh "https://onchainweb.site"
```

### 2. Check Application

Visit: https://onchainweb.site

Verify:
- ✅ Site loads successfully
- ✅ Wallet connection works
- ✅ Firebase data loads
- ✅ Admin routes accessible

### 3. Monitor Logs

```bash
vercel logs
```

Or view in Vercel Dashboard → Deployments → Logs

## Troubleshooting

### Build Fails

```bash
# Check build locally first
cd Onchainweb
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

### Environment Variables Not Set

Make sure all required variables are set in:
- Vercel Dashboard → Settings → Environment Variables
- Local `.env` file for testing

### 404 Errors

Ensure `vercel.json` has correct routes configuration for SPA.

### Firebase Connection Issues

1. Check Firebase credentials in Vercel environment variables
2. Verify Firebase project is active
3. Check Firestore rules are deployed
4. Review browser console for errors

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys on:
- ✅ Push to main branch (production)
- ✅ Pull request creation (preview)

### Manual Redeployment

```bash
vercel --prod --yes
```

## Domain Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Dashboard → Domains → Add
   - Enter: `onchainweb.site`

2. **Configure DNS**
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → Vercel IP addresses

3. **Wait for Verification**
   - Usually takes 1-60 minutes
   - SSL certificate auto-provisioned

### DNS Records Example

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

## Security Checklist

✅ Environment variables set in Vercel (not committed to git)
✅ Firebase rules deployed
✅ Admin allowlist configured
✅ HTTPS enabled (automatic with Vercel)
✅ Custom domain configured with SSL

## Live URLs

```
Production:  https://onchainweb.site
Master Admin: https://onchainweb.site/master-admin
Admin Portal: https://onchainweb.site/admin
```

## Next Step

[Step 4: Admin Setup →](4-ADMIN-SETUP.md)
