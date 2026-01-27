# Master Account Setup - Production

## 🚨 Security Alert

**The password `Pyaegyi555@` mentioned in chat is COMPROMISED** because:
- ❌ Visible in chat history
- ❌ May be logged/stored
- ❌ Cannot be used securely

**Use the secure setup script instead.**

## ✅ Secure Setup Method

### Step 1: Run Secure Setup Script

```bash
./setup-master-account-secure.sh
```

This generates a NEW secure password and saves it to a temporary file.

### Step 2: Save to Password Manager

Copy the password from `master-credentials-SECURE.txt` and save to:
- 1Password
- Bitwarden
- LastPass
- Other secure password manager

### Step 3: Create in Firebase Console

1. Visit: https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users
2. Click "Add user"
3. Enter:
   - Email: `master@onchainweb.site`
   - Password: [From secure file]
4. Click "Add user"

### Step 4: Delete Credentials File

```bash
rm master-credentials-SECURE.txt
```

### Step 5: Login

1. Visit: https://onchainweb.site/master-admin
2. Enter credentials from password manager
3. ✅ Access granted!

## Master Account Details

```
Domain:   onchainweb.site
URL:      https://onchainweb.site/master-admin
Email:    master@onchainweb.site
Username: master
Password: [Secure password from setup script]
```

## Create Additional Admins

After logging in as master:
1. Navigate to "Admin Management" tab
2. Click "Create Admin"
3. Fill in details
4. Assign permissions
5. New admin can login at: https://onchainweb.site/admin

## Security Best Practices

✅ **DO:**
- Use password manager
- Generate strong passwords (16+ characters)
- Enable 2FA in Firebase Console
- Rotate passwords every 90 days
- Monitor Firebase Console for suspicious activity

❌ **DON'T:**
- Share credentials
- Store in plain text
- Use simple passwords
- Commit credentials to git
- Reuse passwords

---

## Alternative: After Public Release (Original Method)

### Step 1: Navigate to Master Admin Page

Visit: `https://your-domain.com/master-admin`

### Step 2: Complete First-Time Setup

Fill in the form:
- **Email**: Use the first email from `VITE_ADMIN_ALLOWLIST` in your `.env`
- **Password**: Create a strong password (minimum 12 characters, include uppercase, lowercase, numbers, symbols)
- **Confirm Password**: Re-enter the password

### Step 3: Submit and Login

Click "Create Master Account"

The system will:
1. Create the account in Firebase Authentication
2. Create admin document in Firestore with master permissions
3. Redirect you to the login page

### Step 4: First Login

Enter your credentials:
- Username/Email: Your master email
- Password: Your master password

You'll be redirected to the Master Dashboard with full system access.

## Security Recommendations

- ✅ Use a password manager to generate and store credentials
- ✅ Enable 2FA in Firebase Console (Project Settings → Users)
- ✅ Regularly rotate master password (every 90 days)
- ✅ Limit master email to secure domain (@yourdomain.com)
- ✅ Monitor Firebase Console → Authentication → Users for suspicious activity

## Master Account Credentials Template

**DO NOT commit this information to git!**

Save in your password manager:

```
Service: Snipe Master Admin
URL: https://your-domain.com/master-admin
Email: master@yourdomain.com
Password: [Generated secure password]
Created: [Date]
Last Rotated: [Date]
```

## Troubleshooting

### Email Already in Use
If you see "Email already exists", check Firebase Console → Authentication to see if the account was created but not finalized. You can:
1. Delete the account from Firebase Console
2. Try creating the master account again

### Permission Denied Errors
If you get permission denied when accessing the dashboard:
1. Verify the email is in `VITE_ADMIN_ALLOWLIST`
2. Check Firestore → admins collection for your UID
3. Ensure the admin document has `role: 'master'`

### Cannot Access Dashboard After Login
Clear your browser cache and localStorage, then login again.

## Post-Setup Actions

After creating your master account:

1. **Test all admin functions:**
   - User management
   - Deposit approval
   - Withdrawal processing
   - Admin role creation

2. **Create additional admin accounts:**
   - Navigate to Admin Management section
   - Create admin accounts with specific permissions
   - Test their access levels

3. **Configure backup access:**
   - Add a second master email to `VITE_ADMIN_ALLOWLIST`
   - Create a backup master account
   - Store credentials separately

## Support

For issues with master account setup:
- Check Firebase Console logs
- Review browser console for errors
- Verify Firestore security rules are deployed
- Contact development team with error details
