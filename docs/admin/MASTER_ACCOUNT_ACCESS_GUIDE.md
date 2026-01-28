# Master Account Access Guide

**Generated**: January 18, 2026
**Status**: ✅ Active

## Quick Access

### Login Credentials

```
Username: [SET IN backend/.env as MASTER_USERNAME]
Password: [SET IN backend/.env as MASTER_PASSWORD]
```

**IMPORTANT**: The actual credentials are stored in your `backend/.env` file and should NEVER be committed to version control. See "Setup Instructions" below.

### Access URLs

- **Admin Dashboard**: https://www.onchainweb.app/admin
- **Master Dashboard**: https://www.onchainweb.app/master-admin
- **Backend API**: https://snipe-api.onrender.com/api/auth/login

## Setup Instructions

1. Copy the credentials from your secure storage or `backend/.env` file
2. Keep credentials in a secure password manager
3. Never commit credentials to git
4. Use environment variables for automation

## How to Login

### Via Browser

1. Open: https://www.onchainweb.app/master-admin
2. Enter your master username (from backend/.env)
3. Enter your master password (from backend/.env)
4. Click **Login**

### Via API (curl)

```bash
curl -X POST https://snipe-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "YOUR_MASTER_USERNAME",
    "password": "YOUR_MASTER_PASSWORD"
  }'
```

### Via Environment Variables

```bash
# Set environment variables from your backend/.env file
export MASTER_USERNAME="your-master-username"
export MASTER_PASSWORD="your-master-password"

# Use in scripts
./test-admin-realtime.sh
```

## System Information

- **Platform**: Snipe Trading Platform
- **Backend**: Node.js + Firebase
- **Frontend**: React + Vite
- **Deployment**: Vercel (frontend) + Render (backend)
- **Database**: Firebase Firestore

## Master Account Permissions

As master user, you have full access to:

✅ **User Management**
- View all users in real-time
- Edit user profiles and balances
- Freeze/unfreeze accounts
- Manage user settings

✅ **Admin Management**
- Create new admin accounts
- Grant/revoke permissions
- Assign users to admins
- Manage admin accounts

✅ **Financial Operations**
- Approve/reject deposits
- Process withdrawals
- Adjust user balances
- View transaction history

✅ **System Control**
- Monitor platform activity
- View admin action logs
- Configure platform settings
- Manage trading parameters

✅ **Reporting**
- Access analytics
- View user statistics
- Monitor platform health
- Review activity logs

## Security Notes

⚠️ **Important**:

- Never share this password via email or chat
- Use environment variables instead of pasting in terminal
- Consider using a password manager for secure storage
- Rotate password periodically (at least quarterly)
- Log out after each session
- Keep credentials confidential

## Environment Variables

For development and deployment:

**Local (.env files)**:
```dotenv
MASTER_USERNAME=snipe_admin_secure_7ecb869e
MASTER_PASSWORD=YOUR_MASTER_PASSWORD
```

**Vercel Dashboard**:
Navigate to Project Settings → Environment Variables, then add:
```
Variable: MASTER_PASSWORD
Value: YOUR_MASTER_PASSWORD
```

**Render.com Dashboard** (if applicable):
Navigate to Service Settings → Environment, then add:
```
MASTER_PASSWORD=YOUR_MASTER_PASSWORD
```

## Testing Login

### Test 1: Direct API Call

```bash
curl -X POST https://snipe-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "snipe_admin_secure_7ecb869e",
    "password": "YOUR_MASTER_PASSWORD"
  }' | jq .
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "snipe_admin_secure_7ecb869e",
    "role": "master"
  }
}
```

### Test 2: Dashboard Login

1. Open https://www.onchainweb.app/master-admin
2. See login form
3. Enter credentials above
4. Click **Login**
5. Should see master dashboard

### Test 3: Test Script

```bash
# Run real-time test
MASTER_PASSWORD='YOUR_MASTER_PASSWORD' ./test-admin-realtime.sh

# Expected: Shows "✅ Backend Health Check: OK"
```

## Troubleshooting

### Login Failed

**Issue**: "Invalid username or password" error

**Solutions**:
1. Verify credentials are exactly as shown above
2. Check that password is not trimmed or modified
3. Ensure no extra spaces before/after password
4. Try resetting password if issue persists

### Backend Not Responding

**Issue**: Connection timeout when trying to login

**Solutions**:
1. Check backend status: https://snipe-api.onrender.com/health
2. Render.com free tier sleeps after 15 min inactivity (30-60 sec startup)
3. Wait for backend to respond
4. Check backend logs on Render dashboard

### Vercel Not Deploying

**Issue**: New credentials not working on production

**Solutions**:
1. Verify `MASTER_PASSWORD` is set in Vercel Environment Variables
2. Trigger manual deployment: Vercel dashboard → Deployments → Redeploy
3. Check Vercel build logs for errors
4. Ensure backend .env has matching password

## Recovery Procedures

### If Password is Forgotten

1. Access backend server (Render.com)
2. Update `MASTER_PASSWORD` in environment variables
3. Trigger redeploy
4. Use new password to login

### If Account is Locked

1. Contact system administrator
2. Have admin reset master account
3. Set new master password
4. Update all systems with new credential

### Backup Login Method

No backup login method exists. Keep password safe and up-to-date.

## API Endpoints

Once logged in, you can access:

```
GET  /api/health                    - System status
GET  /api/users                     - List all users
GET  /api/auth/status              - Current user status
GET  /api/admin-activity           - Admin activity logs
GET  /api/auth/admins              - List admin accounts
POST /api/auth/admin               - Create admin account
PATCH /api/users/:id               - Update user
```

## Dashboard Features

### Master Admin Dashboard

Access at: https://www.onchainweb.app/master-admin

Features:
- Real-time user management
- Admin account creation
- System monitoring
- Activity logs
- Financial controls
- Settings management

### Regular Admin Dashboard

Access at: https://www.onchainweb.app/admin

Features (varies by permissions):
- User management
- KYC review
- Deposit approval
- Withdrawal processing
- Customer support
- Report viewing

## Change Log

| Date | Change | Details |
|------|--------|---------|
| Jan 18, 2026 | Credential Rotation | Updated from `Snipe$Admin@Secure#2025!7d97a66f` to new secure password |
| Jan 18, 2026 | Systems Updated | All test scripts and documentation updated |
| Jan 18, 2026 | Git Commit | Credential rotation committed (df532b7) |

## Contact

For credential-related issues or password reset:

- Platform: https://www.onchainweb.app
- Email: ddefi0175@gmail.com
- GitHub: https://github.com/ddefi0175-netizen/Snipe-

---

**Last Updated**: January 18, 2026
**Status**: ✅ Active and Verified
**Security**: Cryptographically generated password (256-bit entropy)
