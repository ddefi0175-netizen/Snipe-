# 🚀 Snipe Public Release Guide

**Version**: 1.0.0  
**Status**: Ready for Public Release  
**Date**: January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Release Verification](#pre-release-verification)
3. [Wallet Connection System](#wallet-connection-system)
4. [Admin & Master Account Control](#admin--master-account-control)
5. [Long-Term Maintenance Plan](#long-term-maintenance-plan)
6. [Public Release Steps](#public-release-steps)
7. [Post-Release Monitoring](#post-release-monitoring)

---

## Overview

Snipe is a fully-featured real-time trading platform with:

✅ **11 Wallet Providers** - MetaMask, Trust Wallet, Coinbase, OKX, Phantom, and more  
✅ **Real-Time Data** - All admin/master controls work with live MongoDB data  
✅ **Live Chat** - Real-time chat system for community engagement  
✅ **Admin Management** - Granular permission-based admin system  
✅ **Security First** - JWT authentication, bcrypt hashing, no hardcoded credentials  
✅ **Production Ready** - Deployed on Render (backend) and Vercel (frontend)

### Live URLs

- **Frontend**: https://www.onchainweb.app
- **Backend API**: https://snipe-api.onrender.com/api
- **Health Check**: https://snipe-api.onrender.com/health

---

## Pre-Release Verification

### Automated Verification Script

Run the comprehensive verification script to check all systems:

```bash
# Set your master password
export MASTER_PASSWORD='your-secure-password'

# Run verification
./verify-public-release.sh https://snipe-api.onrender.com/api
```

The script verifies:

1. ✅ Infrastructure health (frontend & backend)
2. ✅ Authentication system (master & admin login)
3. ✅ Admin management & permissions
4. ✅ Real-time data features
5. ✅ Live chat system
6. ✅ Wallet connection configuration
7. ✅ Security & documentation
8. ✅ Build & deployment readiness

### Manual Verification Checklist

- [ ] **Backend Health**: Visit https://snipe-api.onrender.com/health - expect `{"status":"ok","mongoConnected":true}`
- [ ] **Frontend Load**: Visit https://www.onchainweb.app - should load within 3 seconds
- [ ] **Master Login**: Test at https://www.onchainweb.app/master-admin
- [ ] **Admin Panel**: Test at https://www.onchainweb.app/admin
- [ ] **Wallet Connection**: Click "Connect Wallet" and test with any supported wallet
- [ ] **Live Chat**: Send a test message and verify delivery
- [ ] **Real-Time Data**: Check admin dashboard shows live user counts

---

## Wallet Connection System

### Supported Wallets (11 Total)

| Wallet | Connection Method | Platform |
|--------|-------------------|----------|
| **MetaMask** | Injected / WalletConnect | Desktop, Mobile, Browser |
| **Trust Wallet** | Deep Link / WalletConnect | Mobile, dApp Browser |
| **Coinbase Wallet** | Injected / WalletConnect | Desktop, Mobile |
| **OKX Wallet** | Injected / WalletConnect | Desktop, Mobile |
| **Phantom** | Injected (EVM Mode) | Desktop, Mobile |
| **Binance Web3** | Injected | Desktop |
| **Rabby Wallet** | Injected | Desktop |
| **TokenPocket** | Deep Link / Injected | Mobile |
| **Rainbow** | WalletConnect | Mobile |
| **Ledger Live** | WalletConnect | Desktop |
| **imToken** | Deep Link / Injected | Mobile |

### Connection Strategies

The system intelligently detects the user's environment and provides the optimal connection method:

1. **Desktop Browser with Extension**
   - Direct injected provider connection (fastest)
   - Falls back to WalletConnect QR code

2. **Mobile Browser**
   - Deep links to open wallet apps directly
   - Automatic return to browser after signing

3. **In-App dApp Browser**
   - Uses wallet's native injected provider
   - Detects Trust Wallet, MetaMask, OKX, etc.

4. **No Wallet Installed**
   - WalletConnect QR code for any wallet
   - Links to download official wallet apps

### WalletConnect Configuration

**IMPORTANT**: WalletConnect requires a Project ID to function.

1. Get your free Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Set environment variable in `Onchainweb/.env`:
   ```bash
   VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
   ```
3. Rebuild the frontend:
   ```bash
   cd Onchainweb
   npm run build
   ```

### Verification Steps

1. **Desktop Test**:
   - Install MetaMask extension
   - Visit site and click "Connect Wallet"
   - Select "MetaMask"
   - Approve connection in extension
   - Verify connected address appears

2. **Mobile Test**:
   - Open Trust Wallet or MetaMask mobile app
   - Use in-app browser to visit site
   - Click "Connect Wallet"
   - Should auto-detect wallet
   - Verify connected address appears

3. **WalletConnect Test**:
   - On desktop without wallet extension
   - Click "Connect Wallet" → "WalletConnect"
   - QR code should appear
   - Scan with mobile wallet
   - Approve connection
   - Verify connected address appears

### Error Handling

The system provides clear, actionable error messages:

- ❌ **Wallet not detected**: Links to download page
- 🚫 **User rejection**: Explains to approve in wallet
- ⏳ **Pending request**: Tells user to check wallet
- 🔒 **Account locked**: Instructs to unlock wallet

---

## Admin & Master Account Control

### Real-Time Data Architecture

All admin and master account operations use **real-time data from MongoDB**:

✅ **User Management** - Live balance updates, instant changes  
✅ **Deposit Processing** - Real-time deposit/withdrawal approvals  
✅ **Trade Monitoring** - Active trades refresh every 3 seconds  
✅ **KYC Workflow** - Real-time approval/rejection  
✅ **Activity Logging** - All admin actions logged with timestamps  

### Data Refresh Intervals

- **User List**: 30 seconds
- **Active Trades**: 3 seconds
- **Deposits/Withdrawals**: 30 seconds
- **Admin Activity**: Real-time on action

### Master Account

**Access**: https://www.onchainweb.app/master-admin

**Credentials**:
- Username: `master`
- Password: Set via `MASTER_PASSWORD` environment variable

**Capabilities**:
- ✅ Full user management
- ✅ Create/delete admin accounts
- ✅ Assign custom permissions to admins
- ✅ Approve deposits/withdrawals
- ✅ Monitor all platform activity
- ✅ Configure system settings

### Admin Accounts

**Access**: https://www.onchainweb.app/admin

**Permission Types**:

| Permission | Description |
|------------|-------------|
| `manageUsers` | View and edit user profiles |
| `manageBalances` | Modify user balances |
| `manageKYC` | Review/approve KYC |
| `manageTrades` | Monitor trades |
| `manageDeposits` | Process deposits |
| `manageWithdrawals` | Approve withdrawals |
| `customerService` | Access support |
| `viewReports` | Access analytics |
| `viewLogs` | View audit logs |
| `siteSettings` | Modify settings |
| `createAdmins` | Create admins (master only) |

### Creating Admin Accounts

Master accounts can create admins via API:

```bash
# 1. Login as master
curl -X POST https://snipe-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"master","password":"YOUR_PASSWORD"}'

# 2. Create admin with specific permissions
curl -X POST https://snipe-api.onrender.com/api/auth/admin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin",
    "password": "SecurePass123!",
    "email": "admin@example.com",
    "permissions": {
      "manageUsers": true,
      "manageBalances": true,
      "manageKYC": true
    },
    "userAccessMode": "all"
  }'
```

### User Access Modes

- **All Users** (`userAccessMode: "all"`): Access to all platform users
- **Assigned Users** (`userAccessMode: "assigned"`): Limited to specific user IDs

### Verification Steps

1. **Master Login Test**:
   ```bash
   curl -X POST https://snipe-api.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"master","password":"YOUR_PASSWORD"}'
   ```
   Expected: `{"success":true,"token":"...","role":"master"}`

2. **Real-Time Data Test**:
   ```bash
   curl https://snipe-api.onrender.com/api/users?limit=10 \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   Expected: Response includes `realTime` metadata with timestamp

3. **Admin Creation Test**:
   - Use master token to create test admin
   - Login with test admin credentials
   - Verify admin can access assigned features
   - Delete test admin after verification

---

## Long-Term Maintenance Plan

### Weekly Maintenance (Every Monday)

**Time Required**: ~1 hour

1. **Dashboard Testing**
   - [ ] Test admin login
   - [ ] Verify user list loads
   - [ ] Test live chat
   - [ ] Check wallet connection
   - [ ] Test deposit/withdrawal flows

2. **System Health**
   - [ ] Check backend: https://snipe-api.onrender.com/health
   - [ ] Verify frontend loads: https://www.onchainweb.app
   - [ ] Review MongoDB Atlas metrics
   - [ ] Check response times (<500ms)

3. **Log Review**
   - [ ] Backend logs on Render
   - [ ] Frontend deploy logs on Vercel
   - [ ] MongoDB Atlas connection logs
   - [ ] Look for errors or warnings

### Monthly Maintenance

**Time Required**: ~2 hours

1. **Security Audit**
   ```bash
   # Backend
   cd backend
   npm audit
   npm audit fix
   
   # Frontend
   cd Onchainweb
   npm audit
   npm audit fix
   ```

2. **Database Maintenance**
   - [ ] Review MongoDB Atlas backups
   - [ ] Check database performance metrics
   - [ ] Archive old activity logs (>90 days)
   - [ ] Verify index performance

3. **Performance Review**
   - [ ] Check page load times
   - [ ] Review API response times
   - [ ] Monitor database query performance
   - [ ] Analyze error rates

### Quarterly Maintenance

**Time Required**: ~4 hours

1. **Credential Rotation**
   - [ ] Generate new JWT_SECRET
   - [ ] Update MASTER_PASSWORD
   - [ ] Rotate MongoDB password
   - [ ] Update API keys

2. **Backup Testing**
   - [ ] Test MongoDB restore procedure
   - [ ] Verify backup completeness
   - [ ] Document any recovery issues

3. **Dependency Updates**
   ```bash
   # Check for outdated packages
   cd backend && npm outdated
   cd ../Onchainweb && npm outdated
   
   # Update carefully (test after each)
   npm update
   ```

### Automated Monitoring

**GitHub Actions** (already configured):
- Health checks every 6 hours
- Security audits weekly
- Auto-deploy on push to main

**Recommended External Monitoring**:
- **UptimeRobot** or **BetterUptime**
  - Monitor backend health endpoint every 5 minutes
  - Monitor frontend every 5 minutes
  - Alert via email/Slack/Discord

### Emergency Response Plan

**If Production is Down**:

1. **Immediate Actions** (5 minutes):
   - Check https://snipe-api.onrender.com/health
   - Check Render.com status page
   - Check MongoDB Atlas status
   - Review recent deployments

2. **Communication** (10 minutes):
   - Post status update (if status page exists)
   - Notify users via social media
   - Update team on progress

3. **Resolution** (varies):
   - Identify root cause from logs
   - Roll back to last working version if needed
   - Fix and test thoroughly
   - Deploy fix
   - Verify resolution

4. **Post-Mortem** (1 hour):
   - Document what went wrong
   - Update procedures to prevent recurrence
   - Improve monitoring/alerts

### Maintenance Schedule

| Task | Frequency | Estimated Time |
|------|-----------|----------------|
| Dashboard testing | Weekly | 30 min |
| Log review | Weekly | 20 min |
| Security audit | Weekly (automated) | 10 min |
| Health checks | Every 6 hours (automated) | Auto |
| Database backup review | Monthly | 30 min |
| Performance review | Monthly | 1 hour |
| Credential rotation | Quarterly | 2 hours |
| Backup testing | Quarterly | 2 hours |
| Dependency updates | Monthly | 1 hour |

---

## Public Release Steps

### 1. Final Verification

Run the complete verification:

```bash
export MASTER_PASSWORD='your-password'
./verify-public-release.sh https://snipe-api.onrender.com/api
```

Expected: All tests pass (100% success rate)

### 2. Update Repository Description

Go to: https://github.com/ddefi0175-netizen/Snipe

Set description:
```
Real-time trading platform with live chat, wallet integration, and admin control
```

Add topics:
```
trading, blockchain, react, nodejs, mongodb, cryptocurrency, web3, walletconnect, defi, real-time
```

### 3. Make Repository Public

**Steps**:
1. Go to Settings → General
2. Scroll to "Danger Zone"
3. Click "Change repository visibility"
4. Select "Make public"
5. Type repository name to confirm
6. Click "I understand, make this repository public"

### 4. Enable GitHub Features

**Enable Issues**:
1. Go to Settings → Features
2. Check ✅ "Issues"

**Enable Discussions** (Optional):
1. Go to Settings → Features
2. Check ✅ "Discussions"

**Enable Projects** (Optional):
1. Go to Settings → Features
2. Check ✅ "Projects"

### 5. Create GitHub Release

1. Go to: https://github.com/ddefi0175-netizen/Snipe/releases/new
2. Click "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `v1.0.0 - Initial Public Release`
5. Description:

```markdown
# Snipe v1.0.0 - Initial Public Release 🚀

## Features

- ✨ **Real-Time Trading** - Live cryptocurrency price feeds from CoinGecko
- 💬 **Live Chat** - Real-time chat system for community engagement
- 🔗 **Wallet Integration** - Support for 11 major wallet providers
  - MetaMask, Trust Wallet, Coinbase, OKX, Phantom, and more
  - Desktop, mobile, and in-app browser support
  - WalletConnect for universal compatibility
- 👥 **Admin System** - Granular permission-based admin management
- ⚡ **Real-Time Data** - All operations use live MongoDB data
- 🔒 **Security First** - JWT auth, bcrypt hashing, no hardcoded credentials
- ♿ **Accessible** - Built with accessibility-first principles
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## Live Demo

- **Frontend**: https://www.onchainweb.app
- **API Docs**: See [README](https://github.com/ddefi0175-netizen/Snipe#readme)

## Quick Start

```bash
git clone https://github.com/ddefi0175-netizen/Snipe.git
cd Snipe
# See README.md for setup instructions
```

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Deployment: Vercel + Render

## Documentation

- [README](https://github.com/ddefi0175-netizen/Snipe#readme)
- [Deployment Guide](DEPLOYMENT.md)
- [Wallet Integration](WALLETCONNECT_IMPLEMENTATION.md)
- [Admin Guide](ADMIN_USER_GUIDE.md)
- [Maintenance](MAINTENANCE.md)

## What's Next

See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for future improvements.

Contributions welcome! ⭐
```

6. Click "Publish release"

### 6. Configure Monitoring Secrets

Add these secrets to GitHub repository:

1. Go to: Settings → Secrets and variables → Actions
2. Add:
   - `BACKEND_URL`: https://snipe-api.onrender.com
   - `FRONTEND_URL`: https://www.onchainweb.app
   - `MASTER_PASSWORD`: Your master password

### 7. Announcement

**Prepare announcement post**:

```text
🚀 Excited to announce Snipe v1.0.0 - Open Source Trading Platform!

Snipe is a modern, accessible real-time trading platform built with:
✨ Real-time price feeds
💬 Live chat system
🔗 11 wallet providers (MetaMask, Trust Wallet, Coinbase, etc.)
👥 Granular admin management
⚡ Real-time data from MongoDB
🔒 Security-first design

Built with React, Node.js, and MongoDB.
Fully open source and ready to deploy!

🔗 GitHub: https://github.com/ddefi0175-netizen/Snipe
🌐 Live Demo: https://www.onchainweb.app

Contributions welcome! ⭐
```

**Post to**:
- Twitter/X
- LinkedIn
- Reddit (r/webdev, r/reactjs, r/node)
- Dev.to
- Hacker News (Show HN)
- Discord communities

---

## Post-Release Monitoring

### First 24 Hours

Monitor continuously:

- [ ] GitHub stars/forks
- [ ] Issues opened
- [ ] Live site uptime
- [ ] Error logs (backend & frontend)
- [ ] Database performance
- [ ] API response times
- [ ] User signups (if tracking)

### First Week

- [ ] Respond to issues within 24 hours
- [ ] Review and merge community PRs
- [ ] Update documentation based on feedback
- [ ] Fix any critical bugs
- [ ] Monitor health check results

### Success Metrics

Track these metrics:

**Repository**:
- GitHub stars
- Forks and clones
- Issues opened/closed
- Pull requests received
- Contributors

**Platform**:
- Daily active users
- Wallet connections
- Chat messages sent
- API requests per day

**Community**:
- Social media mentions
- Community discussions
- Blog posts/articles

---

## Summary

### ✅ Verification Complete

- [x] Wallet connection system verified (11 providers)
- [x] App features functional (chat, trading, admin)
- [x] Admin/master control with real-time data verified
- [x] Long-term maintenance plan documented
- [x] Public release guide created

### 📋 Ready for Public Release

All systems verified and operational:
- ✅ Backend healthy and responsive
- ✅ Frontend deployed and accessible
- ✅ Wallet connections configured
- ✅ Admin system functional
- ✅ Real-time data working
- ✅ Documentation complete
- ✅ Security measures in place
- ✅ Maintenance plan established

### 🎯 Next Steps

1. Run `./verify-public-release.sh` one final time
2. Make repository public
3. Create GitHub release v1.0.0
4. Enable Issues and Discussions
5. Post announcements
6. Monitor for first 24 hours

---

**Last Updated**: January 2026  
**Status**: ✅ Ready for Public Release  
**Version**: 1.0.0
