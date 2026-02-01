# Final Deployment Guide - Snipe Platform v1.0.0

**Version**: 1.0.0  
**Date**: February 1, 2026  
**Status**: Production Ready 🚀

---

## 🎯 Quick Deployment Path

Choose your preferred hosting platform:

### Option 1: Vercel (Recommended - Easiest) ⚡

**Time**: 5 minutes  
**Cost**: Free for hobby projects  
**Best For**: Quick deployment with zero configuration

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to frontend
cd Onchainweb

# 3. Install dependencies (if not done)
npm install

# 4. Deploy
vercel --prod
```

**Follow prompts**:
- Link to existing project or create new
- Set environment variables when prompted
- Done! You'll get a production URL

**Environment Variables to Set** (via Vercel Dashboard):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_WALLETCONNECT_PROJECT_ID
```

### Option 2: Cloudflare Pages (Best Performance) 🚀

**Time**: 10 minutes  
**Cost**: Free for most usage  
**Best For**: Global CDN, excellent performance

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Build the project
cd Onchainweb
npm install
npm run build

# 4. Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=snipe-platform
```

**Set Environment Variables**:
```bash
# Via Cloudflare Dashboard: Pages > snipe-platform > Settings > Environment Variables
# Add all VITE_* variables listed above
```

### Option 3: Firebase Hosting (Firebase Integration) 🔥

**Time**: 10 minutes  
**Cost**: Free for most usage  
**Best For**: Already using Firebase services

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize project (if not done)
firebase init hosting

# 4. Build and deploy
cd Onchainweb
npm install
npm run build
cd ..
firebase deploy --only hosting
```

**Configure firebase.json**:
```json
{
  "hosting": {
    "public": "Onchainweb/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  }
}
```

---

## 📋 Pre-Deployment Checklist

Run this verification before deploying:

```bash
./verify-deployment.sh
```

This script checks:
- ✅ Node.js and npm versions
- ✅ Project structure
- ✅ Dependencies installed
- ✅ Environment configuration
- ✅ Production build success
- ✅ Security configuration
- ✅ Documentation presence
- ✅ Deployment scripts

---

## 🔐 Required Environment Variables

### Firebase Configuration (Required)

Get these from [Firebase Console](https://console.firebase.google.com):
1. Select your project
2. Go to Project Settings (gear icon)
3. Scroll to "Your apps" section
4. Click on Web app or create one
5. Copy configuration values

```bash
VITE_FIREBASE_API_KEY="AIza..."           # From Firebase Console
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc..."
VITE_FIREBASE_MEASUREMENT_ID="G-ABC123"
```

### WalletConnect Configuration (Required)

Get from [WalletConnect Cloud](https://cloud.walletconnect.com):
1. Sign up / Login
2. Create new project
3. Copy Project ID

```bash
VITE_WALLETCONNECT_PROJECT_ID="abc123..."  # From WalletConnect Cloud
```

### Optional Configuration

```bash
VITE_ADMIN_ALLOWLIST="master@example.com,admin@example.com"
VITE_ENABLE_ADMIN="true"
```

---

## 🔥 Firebase Setup (One-Time)

### 1. Deploy Firestore Rules

```bash
# Install Firebase CLI if not done
npm install -g firebase-tools

# Login
firebase login

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 2. Verify Rules Deployment

```bash
# Check rules in Firebase Console
# Go to: Firestore Database > Rules
# Verify rules are active
```

### 3. Enable Authentication

In Firebase Console:
1. Go to Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. Save

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Local Environment

```bash
# Clone repository (if not done)
git clone https://github.com/ddefi0175-netizen/Snipe-.git
cd Snipe-

# Install dependencies
cd Onchainweb
npm install
cd ..
```

### Step 2: Run Verification

```bash
# Make script executable (if not done)
chmod +x verify-deployment.sh

# Run verification
./verify-deployment.sh
```

**Expected Output**: All checks pass or only warnings

### Step 3: Test Local Build

```bash
cd Onchainweb

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

**Visit**: http://localhost:4173  
**Test**: 
- Homepage loads
- No console errors
- Assets load correctly

### Step 4: Deploy Firebase Rules

```bash
# From project root
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

**Expected Output**: 
```
✔  Deploy complete!
```

### Step 5: Choose and Deploy to Hosting

Pick one of the three options above (Vercel, Cloudflare, or Firebase).

### Step 6: Configure Environment Variables

In your hosting platform's dashboard:
1. Find Environment Variables section
2. Add all required VITE_* variables
3. Save and redeploy (if needed)

### Step 7: Verify Deployment

```bash
# Replace with your actual URL
SITE_URL="https://your-site.vercel.app"

# Test homepage
curl -I $SITE_URL

# Test admin route
curl -I $SITE_URL/master-admin
```

**Expected**: HTTP 200 responses

---

## ✅ Post-Deployment Testing

### Critical Tests (Must Pass)

1. **Homepage Loads**
   - Visit your production URL
   - Check for any console errors (F12 → Console)
   - Verify all images and assets load

2. **Wallet Connection**
   - Click "Connect Wallet"
   - Try MetaMask connection
   - Verify wallet address appears
   - Test disconnect

3. **Admin Login**
   - Visit `/master-admin`
   - Try logging in with master credentials
   - Verify dashboard loads
   - Check real-time data updates

4. **Firebase Connection**
   - Open browser console
   - Look for "Firebase initialized successfully"
   - Verify no Firebase errors

5. **Navigation**
   - Test all menu links
   - Verify SPA routing works (no 404s)
   - Test back/forward buttons

### Performance Tests (Recommended)

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse https://your-site.com --view

# Target scores:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

### Security Tests (Important)

1. **SSL Certificate**
   - Verify HTTPS is enforced
   - Check certificate validity (click padlock icon)

2. **Environment Variables**
   - Verify no `.env` file in production
   - Check environment variables are set correctly

3. **Firebase Rules**
   - Try accessing Firestore without authentication
   - Should be denied

4. **Admin Access**
   - Try accessing `/master-admin` without login
   - Should redirect or show login

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `vite: not found`
```bash
cd Onchainweb
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error**: `Firebase not defined`
```bash
# Check environment variables are set
# Verify VITE_FIREBASE_* variables in hosting platform
```

### Deployment Fails

**Vercel**:
```bash
# Clear cache and redeploy
vercel --prod --force
```

**Cloudflare**:
```bash
# Check wrangler login
wrangler whoami
# Re-authenticate if needed
wrangler login
```

**Firebase**:
```bash
# Re-initialize
firebase init hosting
# Follow prompts and redeploy
firebase deploy --only hosting
```

### Runtime Errors

**White Screen**:
1. Check browser console for errors
2. Verify all environment variables are set
3. Check Firebase configuration
4. Test on different browser

**Wallet Not Connecting**:
1. Verify VITE_WALLETCONNECT_PROJECT_ID is set
2. Check wallet extension is installed
3. Try WalletConnect QR code method
4. Check browser console for errors

**Admin Login Fails**:
1. Verify Firebase Auth is enabled
2. Check VITE_FIREBASE_AUTH_DOMAIN
3. Verify admin allowlist configuration
4. Check browser console for errors

---

## 📊 Monitoring Post-Deployment

### First 24 Hours

Monitor these metrics:

1. **Error Tracking**
   - Check hosting platform logs
   - Monitor browser console errors
   - Watch Firebase usage

2. **Performance**
   - Page load times
   - API response times
   - Real-time update latency

3. **Usage**
   - User signups
   - Wallet connections
   - Admin logins
   - Chat messages

### Ongoing Monitoring

1. **Weekly**
   - Review error logs
   - Check Firebase quotas
   - Monitor hosting costs
   - Test critical features

2. **Monthly**
   - Security audit
   - Dependency updates
   - Performance review
   - User feedback analysis

---

## 🔄 Rollback Procedure

If critical issues arise:

### Vercel Rollback

```bash
# Via Dashboard
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

# Or via CLI
vercel rollback
```

### Cloudflare Rollback

```bash
# Via Dashboard
1. Go to Pages > Deployments
2. Find last working deployment
3. Click "Retry deployment" or "Rollback"
```

### Firebase Rollback

```bash
# List deployments
firebase hosting:releases

# Rollback to previous
firebase hosting:rollback
```

**Time to Rollback**: ~2-5 minutes

---

## 📞 Support Resources

### Documentation
- [README.md](README.md) - Project overview
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - Setup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment
- [RELEASE_NOTES.md](RELEASE_NOTES.md) - Version notes
- [SECURITY.md](SECURITY.md) - Security practices

### Getting Help
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check all MD files in repository
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **WalletConnect Docs**: [docs.walletconnect.com](https://docs.walletconnect.com)

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Homepage loads in < 3 seconds
- ✅ No console errors in browser
- ✅ Wallet connection works
- ✅ Admin login functional
- ✅ Real-time updates working
- ✅ Firebase connected
- ✅ SSL certificate valid
- ✅ All tests pass
- ✅ Lighthouse score > 90

---

## 🌟 Next Steps After Deployment

1. **Announce Launch**
   - Share on social media
   - Update README with live URL
   - Create GitHub release

2. **Monitor Performance**
   - Set up error tracking
   - Configure uptime monitoring
   - Review analytics

3. **Gather Feedback**
   - Enable user feedback forms
   - Monitor support channels
   - Track feature requests

4. **Plan Updates**
   - Review roadmap
   - Prioritize features
   - Schedule maintenance

---

## 📝 Deployment Checklist

Print this and check off as you go:

- [ ] Run `verify-deployment.sh` successfully
- [ ] Firebase rules deployed
- [ ] Firebase indexes deployed
- [ ] Environment variables configured
- [ ] Production build successful
- [ ] Deployed to hosting platform
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Homepage loads correctly
- [ ] Wallet connection tested
- [ ] Admin login tested
- [ ] No console errors
- [ ] Lighthouse audit passed
- [ ] Error monitoring configured
- [ ] Team notified
- [ ] Documentation updated
- [ ] Announcement prepared

---

**Congratulations on your deployment! 🎉**

Your Snipe Platform is now live and ready to serve users around the world.

**Support**: For issues, check documentation or open a GitHub issue.

---

*Last Updated: February 1, 2026*  
*Version: 1.0.0*
