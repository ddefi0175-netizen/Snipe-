# Admin and Master Account User Guide

## Overview

This guide explains how to use the admin and master account features to control the Snipe trading platform with real-time data from MongoDB.

## Table of Contents

1. [Master Account](#master-account)
2. [Admin Accounts](#admin-accounts)
3. [Real-Time Data Features](#real-time-data-features)
4. [Common Tasks](#common-tasks)
5. [Troubleshooting](#troubleshooting)

---

## Master Account

### Access

- **URL**: `https://www.onchainweb.app/master-admin`
- **Username**: `master`
- **Password**: Set via `MASTER_PASSWORD` environment variable on Render

### Capabilities

The master account has **full control** over the platform:

✅ **User Management**
- View all registered users in real-time from MongoDB
- Edit user balances, points, VIP levels
- Freeze/unfreeze user accounts
- Set trade modes (auto, win, lose)
- View detailed user profiles and activity

✅ **Admin Management**
- Create new admin accounts with custom permissions
- Grant any combination of permissions to admins
- Assign specific users to admins or give "all users" access
- Reset admin passwords
- Delete admin accounts
- View admin activity logs

✅ **Financial Control**
- Approve/reject deposits in real-time
- Process withdrawal requests
- Adjust user balances
- View transaction history

✅ **Trading Control**
- Monitor active trades in real-time
- Set trade outcomes (auto/win/lose)
- Manage trading levels and profit rates
- View trade history

✅ **System Settings**
- Configure platform settings
- Manage currencies and networks
- Set deposit wallet addresses
- Update exchange rates
- Configure bonus programs

---

## Admin Accounts

### Creating an Admin Account

As master, you can create admin accounts with specific permissions:

1. **Login as Master**
   ```bash
   curl -X POST https://snipe-api.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"master","password":"YOUR_MASTER_PASSWORD"}'
   ```

2. **Create Admin**
   ```bash
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
         "manageKYC": true,
         "manageTrades": true,
         "manageStaking": true,
         "manageAIArbitrage": true,
         "manageDeposits": true,
         "manageWithdrawals": true,
         "customerService": true,
         "viewReports": true,
         "viewLogs": true,
         "siteSettings": true,
         "createAdmins": false
       },
       "userAccessMode": "all"
     }'
   ```

### Admin Permission Types

| Permission | Description |
|------------|-------------|
| `manageUsers` | View and edit user profiles |
| `manageBalances` | Modify user account balances |
| `manageKYC` | Review and approve KYC submissions |
| `manageTrades` | Monitor and control trades |
| `manageStaking` | Control staking features |
| `manageAIArbitrage` | Manage AI arbitrage system |
| `manageDeposits` | Process deposit requests |
| `manageWithdrawals` | Approve withdrawal requests |
| `customerService` | Access support tickets and live chat |
| `viewReports` | Access platform analytics |
| `viewLogs` | View system audit logs |
| `siteSettings` | Modify platform settings |
| `createAdmins` | Create new admin accounts (usually master only) |

### User Access Modes

**All Users Mode** (`userAccessMode: "all"`)
- Admin can view and manage all platform users
- Full access to user management features (based on permissions)

**Assigned Users Mode** (`userAccessMode: "assigned"`)
- Admin can only view and manage specifically assigned users
- Provide `assignedUsers` array with user IDs
- Example:
  ```json
  {
    "userAccessMode": "assigned",
    "assignedUsers": ["user_id_1", "user_id_2", "user_id_3"]
  }
  ```

### Admin Login

Admins access the platform via:
- **URL**: `https://www.onchainweb.app/admin`
- **Credentials**: Username and password set during creation

---

## Real-Time Data Features

All data in the admin and master dashboards comes from **MongoDB in real-time**.

### Real-Time Endpoints

1. **Health Check with Real-Time Stats**
   ```
   GET /api/health
   ```
   Returns:
   - MongoDB connection status
   - User count
   - Admin count
   - Trade count
   - Staking plan count
   - Timestamp

2. **Authentication Status**
   ```
   GET /api/auth/status
   ```
   Returns:
   - Current user info
   - Permissions
   - Assigned users count (for admins)
   - System stats (for master)

3. **Users with Real-Time Metadata**
   ```
   GET /api/users?page=1&limit=50
   ```
   Returns:
   - User array from MongoDB
   - Pagination info
   - Real-time metadata (timestamp, source)

4. **Admin Activity Tracking**
   ```
   GET /api/admin-activity
   ```
   Returns:
   - All admin actions
   - Activity statistics
   - Real-time timestamps

### Data Refresh Rates

- **User List**: Refreshes every 30 seconds
- **Active Trades**: Refreshes every 3 seconds
- **Deposits/Uploads**: Refreshes every 30 seconds
- **Admin Activity**: Real-time on action

### Real-Time Indicators

Look for these indicators in the dashboard:
- 🟢 **Green dot**: Data is current (< 1 minute old)
- 🟡 **Yellow dot**: Data is slightly stale (1-5 minutes old)
- 🔴 **Red dot**: Data needs refresh (> 5 minutes old)

---

## Common Tasks

### Task 1: Create an Admin with Specific Permissions

**Goal**: Create an admin who can only manage KYC and deposits for specific users.

```bash
# 1. Login as master
TOKEN=$(curl -s -X POST https://snipe-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"master","password":"YOUR_PASSWORD"}' | jq -r '.token')

# 2. Create admin with limited permissions
curl -X POST https://snipe-api.onrender.com/api/auth/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kyc_admin",
    "password": "KycAdmin123!",
    "email": "kyc@example.com",
    "permissions": {
      "manageUsers": false,
      "manageBalances": false,
      "manageKYC": true,
      "manageTrades": false,
      "manageDeposits": true,
      "manageWithdrawals": false,
      "viewReports": true,
      "createAdmins": false
    },
    "userAccessMode": "assigned",
    "assignedUsers": ["user_id_1", "user_id_2"]
  }'
```

### Task 2: Update User Balance in Real-Time

```bash
# Get user by wallet
USER=$(curl -s -X GET "https://snipe-api.onrender.com/api/users/wallet/0x..." \
  -H "Authorization: Bearer $TOKEN")

USER_ID=$(echo $USER | jq -r '._id')

# Update balance
curl -X PATCH "https://snipe-api.onrender.com/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"balance": 5000}'
```

### Task 3: Monitor Admin Activity

```bash
# Get recent admin activities
curl -X GET "https://snipe-api.onrender.com/api/admin-activity?limit=20" \
  -H "Authorization: Bearer $TOKEN"

# Get activity statistics for last 24 hours
curl -X GET "https://snipe-api.onrender.com/api/admin-activity/stats?hours=24" \
  -H "Authorization: Bearer $TOKEN"
```

### Task 4: Assign More Users to an Existing Admin

```bash
# Get admin ID
ADMIN=$(curl -s -X GET "https://snipe-api.onrender.com/api/auth/admins" \
  -H "Authorization: Bearer $TOKEN" | jq '.admins[] | select(.username=="kyc_admin")')

ADMIN_ID=$(echo $ADMIN | jq -r '._id')

# Assign users
curl -X PATCH "https://snipe-api.onrender.com/api/auth/admin/$ADMIN_ID/assign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["user_id_1", "user_id_2", "user_id_3", "user_id_4"],
    "userAccessMode": "assigned"
  }'
```

### Task 5: Approve a Deposit

```bash
# Get pending deposits
DEPOSITS=$(curl -s -X GET "https://snipe-api.onrender.com/api/uploads?status=pending" \
  -H "Authorization: Bearer $TOKEN")

# Approve first deposit
DEPOSIT_ID=$(echo $DEPOSITS | jq -r '.[0]._id')

curl -X PATCH "https://snipe-api.onrender.com/api/uploads/$DEPOSIT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved", "amount": 500}'
```

---

## Troubleshooting

### Issue: Backend Not Responding

**Symptoms**: API calls timeout or return errors

**Solutions**:
1. Check backend status: `curl https://snipe-api.onrender.com/health`
2. Render.com free tier sleeps after inactivity - first call may take 30-60 seconds
3. Check MongoDB connection in Render logs
4. Verify environment variables are set

### Issue: Login Fails

**Symptoms**: "Invalid username or password" error

**Solutions**:
1. Verify master password is set: Check Render environment variables
2. For admin: Ensure admin account exists: `GET /api/auth/admins`
3. Check password meets requirements (minimum 8 characters)
4. Verify token hasn't expired (24 hour expiration)

### Issue: Admin Cannot See Users

**Symptoms**: Admin dashboard shows no users or limited users

**Solutions**:
1. Check admin's `userAccessMode`:
   - `"all"`: Should see all users
   - `"assigned"`: Only sees assigned users
2. Verify admin permissions include `manageUsers`
3. Check if users exist: Master can query `GET /api/users`

### Issue: Real-Time Data Not Updating

**Symptoms**: Dashboard shows stale data

**Solutions**:
1. Check browser console for API errors
2. Verify token is still valid: `POST /api/auth/verify`
3. Manually refresh: Click refresh button in dashboard
4. Check MongoDB connection: `GET /api/health`
5. Clear browser cache and localStorage

### Issue: Cannot Create Admin

**Symptoms**: "Admin username already exists" or other errors

**Solutions**:
1. Verify you're logged in as master (not admin)
2. Check if username is already taken: `GET /api/auth/admins`
3. Ensure password meets requirements (8+ characters)
4. Verify request body includes required fields

### Issue: Permission Denied

**Symptoms**: "Admin access required" or "Master access required"

**Solutions**:
1. Check your role in token: `POST /api/auth/verify`
2. Verify you're using correct token in Authorization header
3. Re-login if token expired
4. For admin operations, ensure you have required permissions

---

## Best Practices

1. **Security**
   - Use strong passwords (16+ characters recommended)
   - Never commit credentials to code repository
   - Rotate passwords regularly
   - Use environment variables for sensitive data

2. **Admin Management**
   - Create admins with minimum required permissions
   - Use "assigned users" mode for segmented management
   - Regularly review admin activity logs
   - Disable or delete unused admin accounts

3. **Real-Time Data**
   - Monitor system health regularly
   - Set up alerts for critical operations
   - Keep MongoDB connection stable
   - Use appropriate refresh intervals

4. **User Management**
   - Verify user identity before balance adjustments
   - Document all manual balance changes
   - Use trade modes carefully (auto/win/lose)
   - Regular backups of user data

---

## Support

For issues or questions:
- Check backend logs in Render dashboard
- Review browser console for frontend errors
- Test API endpoints with `curl` or Postman
- Verify environment variables are set correctly

---

**Last Updated**: January 2026
**Version**: 1.0
