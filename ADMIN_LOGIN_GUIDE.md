# Admin Login Guide

## Overview
The Snipe platform has two types of admin interfaces:

1. **Master Admin Dashboard** - For the master/super admin account
2. **Admin Panel** - For regular admin accounts

Both use the same backend API (`https://snipe-api.onrender.com/api`) with consistent authentication.

## How to Login

### Master Admin Account
- **URL**: `/master` or `/master-admin`
- **Default Credentials**:
  - Username: `master`
  - Password: Set during initial setup
- **Access**: Full system control, can create other admins, manage all features

### Regular Admin Account
- **URL**: `/admin`
- **Example Credentials**:
  - Username: `aqiang`, `newadmin`, `admin2`, etc.
  - Password: Set when account is created
- **Access**: Permissions-based access as configured by master admin

## Authentication Flow

Both admin types now use the centralized authentication system:

1. **API Endpoint**: `POST /auth/login`
2. **Request Body**:
   ```json
   {
     "username": "your-username",
     "password": "your-password"
   }
   ```

3. **Response**:
   ```json
   {
     "success": true,
     "token": "jwt-token-here",
     "user": {
       "username": "your-username",
       "role": "master" | "admin",
       "permissions": {...}
     }
   }
   ```

4. **Token Storage**:
   - Token is stored in `localStorage` as `adminToken`
   - User info stored as `adminUser`
   - Session persists across page refreshes

## Cold Start Handling

The backend is hosted on Render's free tier, which may sleep after inactivity. The authentication system includes:

- **Automatic Retry**: Up to 2 retries on connection failures
- **Timeout Handling**: 30s for first attempt, 60s for retries
- **User Feedback**: Clear messages about server wake-up status
- **Network Error Detection**: Handles "Failed to fetch" errors gracefully

### Expected Login Times
- **Hot Server**: < 2 seconds
- **Cold Start**: 10-60 seconds (first login after inactivity)
- **Retry Messages**: User sees "API retry 1/2" and "API retry 2/2" during cold starts

## Troubleshooting

### "Failed to fetch" Error
- **Cause**: Server is waking up from sleep or network issue
- **Solution**: Wait for automatic retries (up to 60 seconds total)
- **Action**: System automatically retries 2 times

### Timeout Error
- **Cause**: Server taking longer than 60s to wake up
- **Solution**: Refresh page and try again
- **Note**: Rare, usually only on first wake-up

### "Invalid username or password"
- **Cause**: Wrong credentials
- **Solution**: Verify username and password are correct
- **Note**: Passwords are case-sensitive and must be at least 6 characters

## API Configuration

Both admin interfaces share the same API configuration from `/src/lib/api.js`:

```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'https://snipe-api.onrender.com/api';
```

To change the API endpoint:
1. Create `.env` file in `Onchainweb/` directory
2. Add: `VITE_API_BASE=https://your-api-domain.com/api`
3. Rebuild the application

## Security Notes

- All API requests include JWT token in `Authorization` header
- Tokens expire after 24 hours
- Failed login attempts are logged
- Admin tokens are separate from user wallet authentication
- Passwords must be at least 6 characters
- Password validation performed on both client and server

## Creating New Admin Accounts

Master admin can create new admin accounts from the Master Admin Dashboard:

1. Navigate to "Admin Roles" section
2. Click "Add New Admin"
3. Set username, email, and password
4. Configure permissions (what the admin can manage)
5. Set user access mode (all users or assigned only)
6. Click "Create Admin Account"

The new admin can then login at `/admin` using their credentials.
