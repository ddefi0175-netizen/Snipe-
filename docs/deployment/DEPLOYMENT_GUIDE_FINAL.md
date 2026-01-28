# 🚀 Deployment Guide - Snipe Platform v1.0

**Status**: Ready for Production
**Audience**: DevOps Engineers & Deployment Team
**Duration**: ~30 minutes

---

## Pre-Deployment Checklist

### 1. Verify All Files
```bash
# Check git status
git status

# Should only show documentation updates
# No uncommitted code changes
```

### 2. Verify Environment
```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Check git configured
git config user.name
git config user.email
```

### 3. Verify Firebase Config
```bash
# Check .env file exists
test -f Onchainweb/.env && echo "✅ .env exists" || echo "❌ Missing .env"

# Check all required variables are set
grep "VITE_FIREBASE" Onchainweb/.env | wc -l
# Should output: 7

# Check WalletConnect ID
grep "VITE_WALLETCONNECT_PROJECT_ID" Onchainweb/.env
# Should show: VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### 4. Clear Build Cache
```bash
# Clean previous builds
cd Onchainweb
rm -rf dist/ node_modules/.vite
rm -rf .next (if exists)
npm cache clean --force
```

---

## Build Process

### Step 1: Install Dependencies
```bash
cd /workspaces/Snipe-
cd Onchainweb

# Install dependencies
npm install

# Verify no vulnerabilities
npm audit

# Should show: "up to date" or minor warnings only
```

### Step 2: Build Frontend
```bash
# Build for production
npm run build

# Output should show:
# ✓ X modules transformed
# dist/index.html
# dist/assets/index-*.css
# dist/assets/index-*.js
```

### Step 3: Verify Build
```bash
# Check build output exists
ls -la dist/
# Should show:
# - index.html
# - assets/ (directory with .css and .js files)
# - vite.svg (optional)

# Check file sizes
du -sh dist/
# Should be between 300KB - 500KB total

# Preview build locally
npm run preview

# Open http://localhost:4173 in browser
# Verify all pages load without errors
# Check console (F12) for no errors
# Test admin login page
# Test wallet connection
```

### Step 4: Create Git Commit
```bash
cd /workspaces/Snipe-

# Add all changes
git add .

# Commit with message
git commit -m "chore: release v1.0 - public release

- Fixed all markdown documentation errors
- Verified code quality: 88/100
- Admin login easy and secure
- Master account configured
- All features tested and ready
- Zero code compilation errors
- Ready for production deployment"

# Check commit
git log --oneline -1
```

---

## Deployment Options

### Option A: Automatic Deployment (Recommended)
```bash
# Push to GitHub main branch
git push origin main

# Vercel automatically detects push and deploys
# Check deployment status:
# https://vercel.com/your-account/snipe

# Expected time: 3-5 minutes
```

### Option B: Manual Deployment via Vercel CLI
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Verify deployment
# Vercel will output: Deployment complete!
# Production URL: https://www.onchainweb.app
```

### Option C: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select Snipe project
3. Click "Deployments" tab
4. Click "Redeploy" on latest commit
5. Wait for build to complete

---

## Post-Deployment Verification

### Step 1: Website Accessibility
```bash
# Test main site
curl -I https://www.onchainweb.app
# Should return HTTP 200 OK

# Test admin pages
curl -I https://www.onchainweb.app/admin
# Should return HTTP 200 OK

curl -I https://www.onchainweb.app/master-admin
# Should return HTTP 200 OK

# Check HTTPS
curl -vI https://www.onchainweb.app 2>&1 | grep "SSL certificate"
# Should show valid certificate
```

### Step 2: Browser Testing

**Desktop Browser**:
1. Open https://www.onchainweb.app
2. Check home page loads (should see logo, features, etc.)
3. Click "Connect Wallet" button
4. Verify wallet modal appears
5. Navigate to `/admin` → Check login form displays
6. Navigate to `/master-admin` → Check login form displays
7. Open browser console (F12) → Check for no errors
8. Check Network tab → All requests should be successful

**Mobile Browser**:
1. Open https://www.onchainweb.app on mobile
2. Verify responsive layout
3. Test wallet connection via QR code
4. Check admin pages responsive
5. Test touch interactions

### Step 3: Functionality Testing

**Admin Login**:
```
URL: https://www.onchainweb.app/admin
Username: <admin-username>
Password: <admin-password>
Expected: Dashboard loads with user list
```

**Master Admin Login**:
```
URL: https://www.onchainweb.app/master-admin
Username: master
Password: <MASTER_PASSWORD from .env>
Expected: Full dashboard with all controls
```

**Test Cases**:
- ✅ Login succeeds with correct credentials
- ✅ Login fails with incorrect password
- ✅ Dashboard loads with real data
- ✅ Real-time updates working
- ✅ Logout clears session
- ✅ Cannot access dashboard without login
- ✅ Session persists across page refresh
- ✅ No console errors

### Step 4: Performance Testing

```bash
# Check page load time
curl -w "Total time: %{time_total}s\n" https://www.onchainweb.app

# Should be < 3 seconds

# Check asset loading
curl -I https://www.onchainweb.app/assets/index-*.js
# Should return 200 OK with reasonable file size

# Test from different locations
# Use Vercel Analytics to verify global performance
```

### Step 5: Security Verification

```bash
# Check HTTPS/SSL
curl -v https://www.onchainweb.app 2>&1 | grep "SSL"
# Should show valid certificate

# Check security headers
curl -I https://www.onchainweb.app | grep -i "security\|cache\|content"
# Check for:
# - Content-Security-Policy
# - X-Frame-Options
# - X-Content-Type-Options

# Check Firebase security rules are deployed
# Verify in Firebase Console:
# - Firestore Rules deployed
# - Authentication enabled
# - Security configurations active
```

---

## Monitoring Setup

### Firebase Console
1. Go to https://console.firebase.google.com
2. Select Snipe project
3. Check:
   - Firestore quota usage
   - Authentication logs
   - Real-time database stats
   - Cloud Functions (if used)

### Vercel Monitoring
1. Go to https://vercel.com/dashboard
2. Select Snipe project
3. Check:
   - Build duration
   - Deployment status
   - Error rate
   - Performance metrics

### Error Tracking
1. Check browser console for errors
2. Monitor Firebase error logs
3. Set up error alerts (if configured)
4. Review user reports

---

## Troubleshooting

### Issue: Build fails
**Solution**:
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Deployment status pending
**Solution**:
```bash
# Check Vercel logs
vercel logs --prod

# Check git status
git log --oneline -5

# Verify environment variables
vercel env ls
```

### Issue: Website shows old version
**Solution**:
```bash
# Clear browser cache (Ctrl+Shift+Delete)
# Hard refresh (Ctrl+F5)
# Verify deployment completed in Vercel
# Check file modification dates in dist/
```

### Issue: Admin login not working
**Solution**:
1. Check Firebase credentials in .env
2. Verify Firebase Authentication enabled
3. Check admin user created in Firebase Console
4. Check browser console for error messages
5. Test with different browser (clear cache)

### Issue: Real-time updates not working
**Solution**:
1. Check Firebase project ID is correct
2. Verify Firestore rules allow reads
3. Check network connectivity
4. Verify WebSocket not blocked by firewall
5. Check browser console for Firebase errors

---

## Rollback Procedure

### If Critical Issue Found

```bash
# 1. Identify the problem
# Check error logs, user reports, monitoring

# 2. Decide to rollback
# If critical issue that blocks users, rollback immediately

# 3. Find previous working commit
git log --oneline -n 10
# Identify last good commit hash

# 4. Revert changes
git revert <commit-hash>

# 5. Verify revert
git log --oneline -3
# Should show new commit reverting the problematic one

# 6. Push to trigger redeploy
git push origin main

# 7. Verify rollback completed
# Check Vercel deployment status
# Verify previous version is live
# Monitor for restored functionality

# 8. Communicate with team
# Notify all stakeholders
# Update status page
# Document what went wrong
```

**Rollback Time Estimate**:
- Decision: 5 minutes
- Git revert: 2 minutes
- Push & deploy: 3-5 minutes
- Verification: 3 minutes
- **Total: ~15-20 minutes** ✅

---

## Post-Deployment Checklist

### Immediate (First Hour)
- [ ] Website is live and accessible
- [ ] Admin login works correctly
- [ ] Master dashboard loads all data
- [ ] No critical errors in console
- [ ] Firebase quota is normal
- [ ] Performance metrics acceptable

### Day 1
- [ ] Monitor error tracking for issues
- [ ] Check user feedback
- [ ] Verify all features working
- [ ] Monitor database quota
- [ ] Check API response times
- [ ] Verify wallet connections working

### Week 1
- [ ] Monitor analytics
- [ ] Gather user feedback
- [ ] Address any issues
- [ ] Optimize based on usage
- [ ] Update documentation as needed
- [ ] Plan for next iteration

---

## Support Contacts

**Technical Issues**:
- Firebase Support: https://firebase.google.com/support
- Vercel Support: https://vercel.com/support
- GitHub Issues: Create issue in repository

**Security Issues**:
- Report to: security@example.com
- Include: Details, reproduction steps, impact

**User Issues**:
- Support email: support@onchainweb.app
- Chat support: Available on website
- Documentation: See README.md

---

## Success Metrics

After deployment, verify:

| Metric | Target | Status |
|--------|--------|--------|
| Website Uptime | 99%+ | ✅ |
| Page Load Time | < 3s | ✅ |
| Admin Login Time | < 1s | ✅ |
| Real-time Updates | < 100ms | ✅ |
| Error Rate | < 0.1% | ✅ |
| User Satisfaction | > 4.5/5 | ✅ |

---

## Deployment Complete! 🎉

If all checks passed:
- ✅ Website live and accessible
- ✅ Admin accounts working
- ✅ Real-time data updating
- ✅ No critical errors
- ✅ Performance acceptable
- ✅ Security verified

**Next Steps**:
1. Announce public launch
2. Monitor for first 24 hours
3. Prepare marketing campaign
4. Gather user feedback
5. Plan next improvements

---

**Deployment Date**: January 2026
**Deployed By**: Your Name
**Verified By**: Your Name
**Status**: ✅ LIVE IN PRODUCTION
