# Quick Deployment Guide - Snipe Platform

## 🚀 Ready to Deploy!

This guide provides the fastest path to deploying the Snipe trading platform.

## Prerequisites

- ✅ Code review completed
- ✅ Build successful
- ✅ Production readiness verified
- ✅ Firebase project configured

## 5-Minute Deployment

### Option 1: Deploy to Vercel (Easiest)

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Deploy from Onchainweb directory
cd Onchainweb
vercel deploy --prod

# 3. Follow prompts to link your project
```

**Environment Variables in Vercel:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add all `VITE_*` variables from your `.env` file
- Redeploy if needed

### Option 2: Deploy to Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy
cd Onchainweb
netlify deploy --prod --dir=dist

# 3. Follow prompts to create/link site
```

### Option 3: Deploy to Firebase Hosting

```bash
# 1. Build the app
cd Onchainweb
npm run build

# 2. Deploy to Firebase
firebase deploy --only hosting
```

## Critical Post-Deployment Step

**IMPORTANT**: Deploy Firestore security rules for admin login to work!

```bash
# From project root
firebase deploy --only firestore:rules
```

This enables:
- ✅ Admin authentication
- ✅ Role-based access control
- ✅ Data security
- ✅ Master account auto-creation

## Verify Deployment

1. **Visit Your Site**
   ```
   https://your-domain.com
   ```

2. **Test Master Admin Login**
   ```
   https://your-domain.com/master-admin
   ```
   - Username: `master`
   - Password: [Your VITE_MASTER_PASSWORD]

3. **Check Console**
   - Open browser DevTools
   - No red errors should appear
   - Look for: "Firebase initialized successfully"

## First-Time Admin Setup

### Master Account Auto-Creation

The system will automatically:
1. Create master account in Firebase on first page load
2. Use email: `master@admin.onchainweb.app`
3. Use password: Value from `VITE_MASTER_PASSWORD`

### Manual Admin Creation (Optional)

To create additional admin accounts:

1. **Via Firebase Console**
   - Go to Firebase Console → Authentication → Users
   - Click "Add user"
   - Email: `username@admin.onchainweb.app`
   - Set password
   - Add to `VITE_ADMIN_ALLOWLIST`

2. **Via Master Admin Dashboard**
   - Login as master admin
   - Go to "Admin Roles" section
   - Click "Create New Admin"
   - Fill in details and permissions

## Environment Variables Checklist

Make sure these are set in your hosting platform:

### Required
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Admin Access (Recommended)
```bash
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin
VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app
```

### Auto-Setup (Development Only)
```bash
VITE_MASTER_PASSWORD=YourSecurePassword
VITE_MASTER_EMAIL=master@admin.onchainweb.app
VITE_MASTER_USERNAME=master
```

**Security Note**: Remove `VITE_MASTER_PASSWORD` after first login in production!

## Troubleshooting

### Build Fails
```bash
cd Onchainweb
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firestore Permission Errors
```bash
firebase deploy --only firestore:rules --force
```

### Admin Login Not Working
1. Check Firestore rules deployed
2. Verify `VITE_ENABLE_ADMIN=true`
3. Check email in `VITE_ADMIN_ALLOWLIST`
4. Clear browser cache and try again

### Master Account Not Created
1. Check `VITE_MASTER_PASSWORD` is set
2. Reload `/master-admin` page
3. Check browser console for errors

## Performance Optimization

After deployment, verify:
- ✅ Gzip compression enabled
- ✅ CDN configured
- ✅ Cache headers set
- ✅ Images optimized

Most hosting platforms do this automatically.

## Monitoring

### Firebase Console
- Monitor authentication logs
- Check Firestore usage
- Review security events

### Hosting Dashboard
- Monitor bandwidth usage
- Check error logs
- Review performance metrics

## Next Steps

1. ✅ Deploy application
2. ✅ Deploy Firestore rules
3. ✅ Test admin login
4. ✅ Monitor for 24 hours
5. ✅ Announce public release

## Support

For issues:
1. Check browser console for errors
2. Review Firebase Console logs
3. Verify environment variables
4. Consult documentation:
   - `ADMIN_LOGIN_TEST_RESULTS.md`
   - `PRODUCTION_DEPLOYMENT_GUIDE.md`
   - `ADMIN_SETUP_GUIDE.md`

## Quick Reference

| Action | Command |
|--------|---------|
| Build | `npm run build` |
| Deploy (Vercel) | `vercel deploy --prod` |
| Deploy (Netlify) | `netlify deploy --prod --dir=dist` |
| Deploy (Firebase) | `firebase deploy --only hosting` |
| Deploy Rules | `firebase deploy --only firestore:rules` |
| Test Locally | `npm run dev` |

---

**Last Updated**: January 2026
**Status**: ✅ Ready for Production
