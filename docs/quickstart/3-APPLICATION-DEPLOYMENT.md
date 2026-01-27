# Step 3: Application Deployment

**Estimated time:** 5 minutes

## Overview

Build and deploy the application to your chosen hosting platform.

## Prerequisites

- Environment configured (Step 1)
- Firestore deployed (Step 2)
- Node.js 18+ installed

## Build the Application

### 1. Install Dependencies

```bash
cd Onchainweb
npm install
```

### 2. Build for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### 3. Test Build Locally

```bash
npm run preview
```

Visit `http://localhost:4173` to test the production build.

## Deployment Options

Choose your preferred hosting platform:

### Option A: Firebase Hosting (Recommended)

```bash
firebase deploy --only hosting
```

Your app will be available at: `https://your-project-id.web.app`

### Option B: Vercel

```bash
cd Onchainweb
vercel --prod
```

### Option C: Cloudflare Pages

```bash
cd Onchainweb
wrangler pages deploy dist
```

## Verification

✅ Application builds without errors
✅ Production site is accessible
✅ Firebase authentication works
✅ Wallet connections function

## Next Step

[Step 4: Admin Setup →](4-ADMIN-SETUP.md)
