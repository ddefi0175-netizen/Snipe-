# 🔧 Maintenance & Operations Guide

This document outlines routine maintenance tasks, monitoring procedures, and operational best practices for the Snipe platform.

---

## 📋 Weekly Maintenance Checklist

### 1. Dashboard & Feature Testing (Every Monday)

- [ ] **Admin Login**: Log in as master/admin and verify dashboard loads correctly
- [ ] **User Management**:
  - [ ] View user list and ensure data loads quickly
  - [ ] Check user details, points, and activity logs
  - [ ] Test user role changes and verify permissions
- [ ] **Live Chat**:
  - [ ] Send test messages as both user and admin
  - [ ] Verify real-time message delivery
  - [ ] Check message history loads correctly
- [ ] **Trading Features**:
  - [ ] Verify price feeds are updating
  - [ ] Test deposit/withdraw flows (with test data)
  - [ ] Check balance calculations
- [ ] **Wallet Integration**:
  - [ ] Connect wallet as test user
  - [ ] Verify balance displays correctly
  - [ ] Test disconnect functionality
- [ ] **Uploads & Media**:
  - [ ] Upload test file
  - [ ] Verify upload status updates
  - [ ] Check file retrieval

### 2. System Health Checks (Every Monday)

- [ ] **Backend Health**:
  - [ ] Visit: `https://your-backend-url/health`
  - [ ] Expected: HTTP 200 with `{"status":"ok"}`
  - [ ] Check response time (should be <500ms)
- [ ] **Frontend Health**:
  - [ ] Visit: `https://your-frontend-url`
  - [ ] Verify all pages load (home, dashboard, admin)
  - [ ] Test SPA routing (refresh on different routes)
- [ ] **Database Connection**:
  - [ ] Log into MongoDB Atlas dashboard
  - [ ] Check connection count and current load
  - [ ] Review slow query logs
  - [ ] Verify backup status

### 3. Log Review (Every Monday)

- [ ] **Backend Logs** (Render/your host):
  - [ ] Check for error messages or stack traces
  - [ ] Look for repeated 4xx/5xx errors
  - [ ] Verify no authentication failures (unless expected)
  - [ ] Check for timeout warnings
- [ ] **Frontend Deploy Logs** (Vercel/GitHub Pages):
  - [ ] Verify latest deploy succeeded
  - [ ] Check build logs for warnings
  - [ ] Review any deploy errors
- [ ] **MongoDB Atlas Logs**:
  - [ ] Review connection errors
  - [ ] Check for slow queries (>100ms)
  - [ ] Verify no authentication issues

---

## 🔄 Release & Update Process

### Before Deploying Updates

1. **Local Testing**:

   ```bash
   # Pull latest code
   git pull origin main

   # Run health check script
   chmod +x test-deployment.sh
   ./test-deployment.sh

   # Test seed script
   cd backend
   node seed.js
   ```

2. **Manual Smoke Tests**:
   - [ ] Backend: Test all API endpoints
   - [ ] Frontend: Navigate through all pages
   - [ ] Admin: Test all admin controls
   - [ ] Database: Verify seed data loads correctly

3. **Environment Variables**:
   - [ ] Review `.env` changes in both backend and frontend
   - [ ] Update production environment variables if needed
   - [ ] Verify secrets are properly set in hosting platforms

### Deploying Updates

1. **Backend Deployment** (Render):
   - Push to main branch triggers auto-deploy
   - Monitor deploy logs in Render dashboard
   - Verify health endpoint after deploy
   - Test critical API endpoints

2. **Frontend Deployment** (Vercel):
   - Push to main branch triggers auto-deploy
   - Monitor build logs in Vercel dashboard
   - Test SPA routing after deploy
   - Verify wallet connection works

3. **Post-Deploy Verification**:
   - [ ] Run `test-deployment.sh` against production
   - [ ] Log in as admin and test dashboards
   - [ ] Create test user and verify user flows
   - [ ] Check real-time features (chat, price feeds)

### GitHub Releases

For significant updates:

```bash
# Tag a new release
git tag -a v1.1.0 -m "Release v1.1.0: Feature updates"
git push origin v1.1.0
```

Then create a GitHub Release:

1. Go to: `https://github.com/ddefi0175-netizen/Snipe/releases/new`
2. Select the tag you created
3. Add release notes describing:
   - New features
   - Bug fixes
   - Breaking changes (if any)
   - Upgrade instructions
4. Attach any relevant files (migration scripts, etc.)
5. Publish the release

---

## 🔍 Monitoring & Alerts

### Automated Health Checks

GitHub Actions runs automated health checks every 6 hours:

- Backend API health endpoint
- Frontend availability
- Critical API endpoints

**View Results**: <https://github.com/ddefi0175-netizen/Snipe/actions>

### Manual Health Check

Run the deployment test script anytime:

```bash
cd /workspaces/Snipe
./test-deployment.sh
```

### Setting Up External Monitoring (Recommended)

Use a free service like **UptimeRobot** or **BetterUptime**:

1. **Backend Monitoring**:
   - Monitor: `https://your-backend-url/health`
   - Check interval: Every 5 minutes
   - Alert via: Email, Slack, Discord

2. **Frontend Monitoring**:
   - Monitor: `https://your-frontend-url`
   - Check interval: Every 5 minutes
   - Alert via: Email, Slack, Discord

3. **API Endpoints**:
   - Monitor: `https://your-backend-url/api/users`
   - Expected: HTTP 200 or 401 (if auth required)
   - Check interval: Every 10 minutes

---

## 🗄️ Database Maintenance

### MongoDB Atlas Backups

**Enable Automatic Backups**:

1. Log into MongoDB Atlas
2. Go to your cluster → "Backup" tab
3. Enable "Continuous Cloud Backup"
4. Set retention policy (7 days recommended for free tier)

**Test Restore Procedure** (Quarterly):

1. In MongoDB Atlas, go to "Backup" tab
2. Select a recent snapshot
3. Click "Restore" → Create new cluster
4. Test the restored data
5. Delete the test cluster when done

### Manual Database Backup

```bash
# Backup entire database
mongodump --uri "mongodb+srv://USER:PASSWORD@cluster.mongodb.net/snipe" --out ./backup-$(date +%Y%m%d)

# Restore from backup
mongorestore --uri "mongodb+srv://USER:PASSWORD@cluster.mongodb.net/snipe" ./backup-20260107
```

**Backup Schedule**:

- Automatic: Daily (via MongoDB Atlas)
- Manual: Before major releases
- Store backups: Securely offsite (S3, Google Drive, etc.)

### Database Cleanup

**Monthly Tasks**:

- Archive old activity logs (>90 days)
- Clean up expired sessions
- Review and remove test data

```javascript
// Example: Archive old logs
db.activitylogs.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});
```

---

## 🔐 Security Maintenance

### Weekly Security Audit

GitHub Actions runs automated security audits every Monday:

- `npm audit` on backend dependencies
- `npm audit` on frontend dependencies
- Check for outdated packages

**View Results**: <https://github.com/ddefi0175-netizen/Snipe/actions/workflows/security-audit.yml>

### Manual Security Review

**Run locally**:

```bash
# Backend
cd backend
npm audit
npm outdated

# Frontend
cd ../Onchainweb
npm audit
npm outdated
```

**Apply automatic fixes**:

```bash
npm audit fix
```

**For breaking changes**:

- Review changelog of updated package
- Test thoroughly in development
- Update code if needed
- Deploy with caution

### Credential Rotation (Quarterly)

Rotate sensitive credentials every 3-6 months:

1. **JWT Secret**:

   ```bash
   # Generate new secret
   openssl rand -base64 32

   # Update in backend/.env and hosting platform
   JWT_SECRET=new-secret-here
   ```

2. **Master Password**:
   - Update `MASTER_PASSWORD` in backend `.env`
   - Redeploy backend
   - Notify admin users of change

3. **MongoDB Password**:
   - Change in MongoDB Atlas dashboard
   - Update `MONGO_URI` in backend `.env`
   - Redeploy backend

4. **API Keys** (if any):
   - Rotate CoinGecko API key (if using paid tier)
   - Update other third-party API keys

---

## 📊 Performance Monitoring

### Key Metrics to Track

1. **Backend Performance**:
   - Response time (should be <500ms)
   - Error rate (should be <1%)
   - Database query time (should be <100ms)

2. **Frontend Performance**:
   - Page load time (should be <3s)
   - First contentful paint (should be <1.5s)
   - Time to interactive (should be <5s)

3. **Database Performance**:
   - Connection count
   - Slow queries
   - Storage usage

### Using MongoDB Atlas Metrics

1. Log into MongoDB Atlas
2. Go to your cluster → "Metrics" tab
3. Review:
   - Operations per second
   - Network utilization
   - Connections
   - Query execution time

---

## 🐛 Troubleshooting Common Issues

### Backend Not Responding

1. Check backend logs in hosting platform
2. Verify MongoDB connection:

   ```bash
   mongo "mongodb+srv://cluster.mongodb.net" --username USER --password PASS
   ```

3. Restart backend service
4. Check environment variables are set correctly

### Frontend Not Loading

1. Check build logs in Vercel/hosting platform
2. Verify `VITE_API_BASE_URL` is correct
3. Test backend API directly with curl
4. Clear browser cache and try again

### Chat Not Working

1. Check backend `/api/chat/*` endpoints
2. Verify `ActiveChat` model has active chat
3. Check for CORS errors in browser console
4. Test with different browsers

### Database Connection Errors

1. Verify MongoDB Atlas IP whitelist includes your server
2. Check credentials in `MONGO_URI`
3. Review connection limits in MongoDB Atlas
4. Check for network issues between server and MongoDB

---

## 📝 Documentation Updates

Update documentation when:

- Project structure changes
- New features are added
- Deployment process changes
- Environment variables are added/changed
- API endpoints are modified

**Documentation to Update**:

- [ ] Root README.md
- [ ] Backend README.md
- [ ] Frontend README.md
- [ ] DEPLOYMENT.md
- [ ] This MAINTENANCE.md file
- [ ] ADMIN_ONLY.md (if admin features change)

---

## 🤝 Community Support

### GitHub Issues

Enable and monitor GitHub Issues for:

- Bug reports
- Feature requests
- Questions from users
- Community contributions

**Issue Response Time**: Aim for <48 hours

### Pull Requests

Review process for community PRs:

1. Check code quality and tests
2. Run locally to verify functionality
3. Review security implications
4. Test with production data (if safe)
5. Merge and deploy
6. Thank the contributor!

---

## 📅 Maintenance Schedule

| Task | Frequency | Day/Time |
| ------ | ----------- | ---------- |
| Dashboard testing | Weekly | Monday, 9 AM |
| Log review | Weekly | Monday, 10 AM |
| Security audit | Weekly | Monday (automated) |
| Health checks | Every 6 hours | Automated |
| Database backup review | Monthly | 1st of month |
| Credential rotation | Quarterly | End of Q1, Q2, Q3, Q4 |
| Performance review | Monthly | Last Friday |
| Dependency updates | Monthly | 2nd Tuesday |

---

## 🆘 Emergency Response

### If Production is Down

1. **Immediate Actions**:
   - Check status page/health endpoint
   - Review recent deployments
   - Check backend and database logs
   - Verify hosting platform status

2. **Communication**:
   - Post status update (if status page exists)
   - Notify users via social media
   - Update team on progress

3. **Resolution**:
   - Roll back to last working version if needed
   - Fix issue and test thoroughly
   - Deploy fix
   - Verify resolution

4. **Post-Mortem**:
   - Document what went wrong
   - Update procedures to prevent recurrence
   - Improve monitoring/alerts

### Escalation Contact

For critical issues, contact:

- **Maintainer**: ddefi0175-netizen
- **Hosting Support**: Render.com, Vercel, MongoDB Atlas

---

**Last Updated**: January 2026
**Next Review**: April 2026
