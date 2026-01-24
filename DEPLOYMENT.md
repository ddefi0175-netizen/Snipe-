# 🚀 Snipe Deployment Guide

This guide covers deploying the Snipe platform using **Vercel** (frontend) and **Firebase** (backend/database).

## 🎯 Deployment Architecture

- **Frontend**: Vercel (recommended) or Cloudflare Pages
- **Backend/Database**: Firebase (Firestore + Authentication)
- **CDN**: Cloudflare (optional, for additional edge caching)

---

## ✅ Recommended: Vercel + Firebase

### Why This Stack?

- ✅ **No Cold Starts**: Instant response with serverless functions
- ✅ **Real-Time Updates**: WebSocket listeners via Firebase
- ✅ **Lower Costs**: $0-5/month for Firebase + free Vercel hosting
- ✅ **Better Reliability**: 99.95% uptime SLA
- ✅ **Easier Deployment**: Frontend-only deployment, no backend server

### Quick Deployment Steps

1. **Set up Firebase Backend** (5 minutes)
   - Follow the [Firebase Setup Guide](FIREBASE_SETUP.md)
   - Configure Firestore database
   - Set up Firebase Authentication

2. **Deploy Frontend to Vercel** (5 minutes)
   - Follow the [Vercel Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy!

📖 **Detailed Guide**: See [docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)

---

## 🌐 Alternative: Cloudflare Pages

Cloudflare Pages can also be used as an alternative to Vercel for frontend hosting.

### Setup Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `cd Onchainweb && npm install && npm run build`
   - **Build output directory**: `Onchainweb/dist`
   - **Root directory**: `/`
5. Add environment variables (same as Vercel setup)
6. Deploy!

---

## 📋 Environment Variables Required

For both Vercel and Cloudflare deployments, you need these environment variables:

### Firebase Configuration (Required)
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### WalletConnect (Required for wallet connections)
```bash
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

Get your WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)

---

## 🔍 Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Firebase project set up and configured
- [ ] Deployment succeeded without errors
- [ ] App loads at your domain
- [ ] No console errors in browser
- [ ] Wallet connection works (MetaMask, WalletConnect)
- [ ] Admin panel accessible
- [ ] Real-time data updates working

---

## 🆘 Troubleshooting

### Build Failures
- Verify all environment variables are set correctly
- Check Node.js version is 18+ in deployment settings
- Review build logs for specific errors

### Firebase Connection Issues
- Confirm Firebase credentials are correct
- Check Firebase project is active
- Verify Firestore security rules allow access

### Wallet Connection Problems
- Ensure `VITE_WALLETCONNECT_PROJECT_ID` is set
- Test with multiple browsers
- Check browser console for specific errors

---

## 📚 Additional Resources

- [Vercel Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)
- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [Backend Replacement Guide](BACKEND_REPLACEMENT.md)
- [Quick Start Guide](QUICK_START_GUIDE.md)

---

## 🗂️ Legacy MongoDB Deployment (Deprecated)

**Note**: The MongoDB + Express.js backend is deprecated and no longer recommended.  
**For new projects**: Use Firebase + Vercel as described above.

If you need legacy deployment instructions, refer to the git history or contact the maintainers.
