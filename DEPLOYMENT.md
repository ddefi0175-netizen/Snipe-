# 🚀 Snipe Deployment Guide

This guide covers deploying the Snipe platform using **Vercel** (frontend) and **Cloudflare** (backend/database).

## 🎯 Deployment Architecture

- **Frontend**: Vercel (recommended) or Cloudflare Pages or GitHub Pages
- **Backend/Database**: Cloudflare (D1 Database + Workers)
- **CDN**: Cloudflare (integrated edge caching)

---

## ✅ Recommended: Vercel + Cloudflare

### Why This Stack?

- ✅ **No Cold Starts**: Instant response with serverless functions
- ✅ **Real-Time Updates**: WebSocket support via Cloudflare Durable Objects
- ✅ **Lower Costs**: $0-5/month for Cloudflare + free Vercel hosting
- ✅ **Better Reliability**: 99.95% uptime SLA
- ✅ **Easier Deployment**: Frontend-only deployment, no backend server

### Quick Deployment Steps

1. **Set up Cloudflare Backend** (5 minutes)
   - Create Cloudflare account at [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Set up D1 Database for data storage
   - Configure Cloudflare Workers for authentication

2. **Deploy Frontend to Vercel or GitHub Pages** (5 minutes)
   - Follow the [Vercel Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)
   - Or use GitHub Pages (automatic deployment on push to main)
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

For Vercel, Cloudflare Pages, and GitHub Pages deployments, you need these environment variables:

### Cloudflare Configuration (Required)
```bash
VITE_CLOUDFLARE_ACCOUNT_ID=your-account-id
VITE_CLOUDFLARE_D1_DATABASE_ID=your-database-id
VITE_CLOUDFLARE_API_TOKEN=your-api-token
```

### WalletConnect (Required for wallet connections)
```bash
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

Get your WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)

---

## 🔍 Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Cloudflare D1 database set up and configured
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

### Cloudflare Connection Issues
- Confirm Cloudflare credentials are correct
- Check D1 database is active and accessible
- Verify Cloudflare Workers are deployed correctly

### Wallet Connection Problems
- Ensure `VITE_WALLETCONNECT_PROJECT_ID` is set
- Test with multiple browsers
- Check browser console for specific errors

---

## 📚 Additional Resources

- [Vercel Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Quick Start Guide](QUICK_START_GUIDE.md)

---

## 🗂️ Legacy MongoDB Deployment (Deprecated)

**Note**: The MongoDB + Express.js backend is deprecated and no longer recommended.  
**For new projects**: Use Cloudflare + Vercel/GitHub Pages as described above.

If you need legacy deployment instructions, refer to the git history or contact the maintainers.
