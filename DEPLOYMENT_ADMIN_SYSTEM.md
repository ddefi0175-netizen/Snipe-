# Deployment Guide - Admin System

## Current Status ✅

**Build:** ✅ Successful (verified January 26, 2026)
- No build errors
- All dependencies installed
- Production bundle created successfully

**Deployment Platforms:**
- Vercel (configured via `vercel.json`)
- GitHub Pages (configured via `.github/workflows/deploy.yml`)
- Cloudflare Pages (configured via `wrangler.toml`)

## Quick Deployment Steps

### Option 1: Vercel (Recommended for Admin System)

**Prerequisites:**
1. Vercel account connected to GitHub repository
2. Firebase credentials ready
3. Admin allowlist emails ready

**Steps:**

1. **Set Environment Variables in Vercel Dashboard:**
   ```
   VITE_ENABLE_ADMIN=true
   VITE_ADMIN_ALLOWLIST=master@yourdomain.com,admin1@yourdomain.com
   
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

2. **Deploy:**
   - Push to main branch (auto-deploys) OR
   - Use Vercel CLI: `vercel --prod`

3. **After First Deploy:**
   - Navigate to `https://your-domain.vercel.app/master-admin`
   - Complete master account setup
   - Save credentials securely

### Option 2: GitHub Pages

**Prerequisites:**
1. GitHub Pages enabled in repository settings
2. Workflow permissions set (Settings → Actions → General → Workflow permissions)

**Note:** GitHub Pages doesn't support environment variables directly. You'll need to:
- Fork the repository
- Add environment variables to repository secrets
- Modify build workflow to inject variables during build

**Not recommended for production** due to environment variable limitations.

### Option 3: Cloudflare Pages

**Prerequisites:**
1. Cloudflare account
2. Pages project created and connected to GitHub

**Steps:**

1. **Set Environment Variables in Cloudflare Dashboard:**
   - Navigate to: Pages → Your Project → Settings → Environment variables
   - Add all Firebase and admin configuration variables (same as Vercel)

2. **Deploy:**
   - Push to main branch (auto-deploys)
   - Or use Wrangler CLI: `wrangler pages publish Onchainweb/dist`

## Deployment Checklist

### Pre-Deployment

- [ ] **Firebase Setup Complete**
  - [ ] Firebase project created
  - [ ] Authentication enabled
  - [ ] Firestore database created
  - [ ] Security rules deployed: `firebase deploy --only firestore:rules`
  - [ ] Indexes deployed: `firebase deploy --only firestore:indexes`

- [ ] **Environment Variables Prepared**
  - [ ] All Firebase credentials gathered
  - [ ] Master admin email decided (must start with `master@`)
  - [ ] Admin allowlist emails prepared
  - [ ] WalletConnect project ID obtained

- [ ] **Local Testing Complete**
  - [ ] Build successful: `npm run build`
  - [ ] Master account creation tested
  - [ ] Admin creation tested
  - [ ] User auto-registration tested
  - [ ] Login flows tested

### During Deployment

- [ ] **Configure Platform**
  - [ ] Environment variables set in deployment platform
  - [ ] Build command configured: `cd Onchainweb && npm install && npm run build`
  - [ ] Output directory set: `Onchainweb/dist`
  - [ ] SPA rewrites configured (all routes → /index.html)

- [ ] **Deploy**
  - [ ] Push to main branch or use CLI
  - [ ] Wait for build to complete
  - [ ] Check deployment logs for errors

### Post-Deployment

- [ ] **Verify Deployment**
  - [ ] Website loads successfully
  - [ ] Main app accessible at `/`
  - [ ] Admin routes respond: `/admin` and `/master-admin`

- [ ] **Initial Setup**
  - [ ] Navigate to `/master-admin`
  - [ ] Complete master account setup
  - [ ] Save master credentials securely
  - [ ] Login as master successfully

- [ ] **Test Admin Features**
  - [ ] Create a test admin account
  - [ ] Login as admin in incognito window
  - [ ] Verify admin sees only granted permissions
  - [ ] Connect a wallet on main app
  - [ ] Verify user appears in admin dashboard

- [ ] **Security Verification**
  - [ ] Firestore security rules active
  - [ ] Only authorized emails can access admin
  - [ ] Session management working (24h expiry)
  - [ ] No console errors related to auth

## Common Deployment Issues & Fixes

### Issue 1: Build Fails with "vite: not found"

**Cause:** Dependencies not installed

**Fix:**
```bash
cd Onchainweb
npm install
npm run build
```

### Issue 2: "Firebase not available" in Production

**Cause:** Environment variables not set or incorrect

**Fix:**
1. Verify all `VITE_FIREBASE_*` variables are set in deployment platform
2. Check variables don't have trailing spaces or quotes
3. Redeploy after setting variables

### Issue 3: "Email not in admin allowlist"

**Cause:** Email not in `VITE_ADMIN_ALLOWLIST` or variables not updated

**Fix:**
1. Add email to `VITE_ADMIN_ALLOWLIST` (comma-separated, no spaces)
2. Redeploy
3. Clear browser cache

### Issue 4: Routes Return 404

**Cause:** SPA rewrites not configured

**Fix:**
- **Vercel:** Already configured in `vercel.json`
- **Cloudflare:** Add `_redirects` file:
  ```
  /* /index.html 200
  ```
- **GitHub Pages:** Already handled by copying `404.html`

### Issue 5: Master Account Setup Fails

**Cause:** Firebase Authentication not enabled

**Fix:**
1. Go to Firebase Console → Authentication
2. Enable Email/Password sign-in method
3. Try master setup again

### Issue 6: Admin Creation Returns Permission Error

**Cause:** Firestore security rules too restrictive

**Fix:**
1. Deploy security rules: `firebase deploy --only firestore:rules`
2. Verify master account has master role in Firestore
3. Check browser console for detailed error

## Monitoring & Maintenance

### Health Checks

Monitor these after deployment:

1. **Application Health:**
   - Main app loads
   - Admin routes accessible
   - Firebase connection active

2. **Authentication:**
   - Master login works
   - Admin login works
   - Session persistence works

3. **Data Flow:**
   - Users auto-register on wallet connect
   - Real-time updates working
   - Admin list updates immediately

### Regular Tasks

**Daily:**
- Check for failed logins in Firebase Console
- Monitor user registrations

**Weekly:**
- Review admin activity logs
- Check Firestore usage
- Verify backups

**Monthly:**
- Audit admin permissions
- Review user access patterns
- Update dependencies: `npm update`

## Rollback Procedure

If deployment fails or causes issues:

1. **Immediate Rollback (Vercel/Cloudflare):**
   - Go to deployment platform dashboard
   - Select previous successful deployment
   - Click "Promote to Production"

2. **Git Rollback:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Emergency:**
   - Set `VITE_ENABLE_ADMIN=false` in environment variables
   - This disables admin routes without requiring code changes
   - Redeploy

## Next Steps After Successful Deployment

1. **Create Initial Admins:**
   - Login as master
   - Create admin accounts with appropriate permissions
   - Test each admin login

2. **User Management:**
   - Monitor new user registrations
   - Assign users to admins (if using assigned mode)
   - Set user quotas as needed

3. **Documentation:**
   - Share admin login URLs with admins
   - Provide credentials securely
   - Share ADMIN_USER_GUIDE.md

4. **Security:**
   - Enable Firebase App Check (optional)
   - Set up monitoring and alerts
   - Review security rules regularly

## Support Resources

- **Setup Guide:** `ADMIN_SYSTEM_SETUP_GUIDE.md`
- **Implementation Details:** `ADMIN_SYSTEM_IMPLEMENTATION.md`
- **Environment Config:** `ADMIN_SYSTEM_ENV_EXAMPLE.md`
- **User Guide:** `README_ADMIN_COMPLETE.md`

## Firebase Console Quick Links

- **Authentication:** https://console.firebase.google.com → Your Project → Authentication
- **Firestore:** https://console.firebase.google.com → Your Project → Firestore Database
- **Rules:** https://console.firebase.google.com → Your Project → Firestore → Rules
- **Usage:** https://console.firebase.google.com → Your Project → Usage

## Emergency Contacts

If you encounter issues:
1. Check browser console for errors
2. Review Firebase Console logs
3. Check deployment platform logs
4. Refer to troubleshooting in `ADMIN_SYSTEM_SETUP_GUIDE.md`

---

**Deployment Status:** Ready for Production ✅

**Last Verified:** January 26, 2026

**Build Status:** Passing ✅
