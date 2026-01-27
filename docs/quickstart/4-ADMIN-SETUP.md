# Step 4: Admin Setup

**Estimated time:** 2 minutes

## Overview

Create the master admin account to manage the platform.

## Prerequisites

- Application deployed (Step 3)
- Admin email in `VITE_ADMIN_ALLOWLIST`
- Production URL accessible

## Steps

### 1. Navigate to Master Admin Page

Visit your production URL + `/master-admin`:

```
https://your-domain.com/master-admin
```

### 2. Create Master Account

If no master account exists, you'll see the setup form.

Fill in:
- **Email:** Use the email from `VITE_ADMIN_ALLOWLIST`
- **Password:** Create a strong password (min 12 characters)
- **Confirm Password:** Re-enter the same password

### 3. Submit Form

Click "Create Master Account"

The system will:
1. Create account in Firebase Authentication
2. Create admin document in Firestore with master role
3. Redirect to login page

### 4. Login as Master

Enter your credentials and click "Login"

You'll be redirected to the Master Admin Dashboard.

## Master Account Capabilities

As master admin, you can:
- ✅ Manage all users
- ✅ Approve/reject deposits
- ✅ Process withdrawals
- ✅ Create additional admin accounts
- ✅ Configure system settings
- ✅ View analytics and logs

## Security Best Practices

### Password Requirements
- Minimum 12 characters
- Use a password manager
- Never share credentials
- Rotate every 90 days

## Verification

✅ Master account created successfully
✅ Login works
✅ Dashboard loads
✅ Admin functions accessible

## Next Step

[Step 5: Verification →](5-VERIFICATION.md)
