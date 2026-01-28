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

1. Visit: https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users
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

**Always use:**
- ✅ Password managers (1Password, Bitwarden, LastPass)
- ✅ Secure password generators
- ✅ Two-factor authentication (2FA)

## Quick Setup

### Option 1: Automated Script (Recommended)

```bash
./setup-master-account-secure.sh
```

This will:
1. Generate secure password
2. Display credentials (save immediately!)
3. Guide you through Firebase setup

### Option 2: Manual Setup

1. **Generate Password:**
   Visit: https://passwordsgenerator.net/
   Settings:
   - Length: 16+ characters
   - Include: Uppercase, Lowercase, Numbers, Symbols
   - Example: `M@ster2026!xK9pSecure#Qw7`

2. **Create in Firebase Console:**
   - Visit: https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users
   - Click "Add user"
   - Email: `master@onchainweb.site`
   - Password: [Your generated password]
   - Click "Add user"

3. **Save to Password Manager:**
   ```
   Service: Snipe Master Admin
   URL: https://onchainweb.site/master-admin
   Username: master
   Email: master@onchainweb.site
   Password: [Your secure password]
   ```

4. **Update Environment Variable:**
   ```bash
   # In Vercel Dashboard or Onchainweb/.env
   VITE_ADMIN_ALLOWLIST=master@onchainweb.site
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

6. **Login:**
   - Visit: https://onchainweb.site/master-admin
   - Enter credentials
   - Access granted!

## First Login

After creating master account:

1. **Navigate to:** https://onchainweb.site/master-admin
2. **Login with:**
   - Email: master@onchainweb.site
   - Password: [Your secure password]
3. **You'll see:** Master Dashboard with full access

## Creating Additional Admins

Once logged in as master:

1. Go to "Admin Management" section
2. Click "Create Admin"
3. Fill in:
   - Email: `admin1@onchainweb.site`
   - Username: `admin1`
   - Password: [Generate new secure password]
   - Permissions: Select what they can do
4. Click "Create"
5. Share credentials securely with the new admin

## Security Best Practices

1. **Strong Passwords:**
   - Min 16 characters
   - Mixed case, numbers, symbols
   - No dictionary words
   - Example: `M@ster2026!xK9pSecure#Qw7`

2. **Password Storage:**
   - Use password manager
   - Never in plain text files
   - Never in emails/chats
   - Never in code/git

3. **Regular Rotation:**
   - Change master password every 90 days
   - Change admin passwords every 180 days
   - Update immediately if compromised

4. **Two-Factor Authentication:**
   - Enable in Firebase Console
   - Project Settings → Users → 2FA
   - Strongly recommended for master account

5. **Access Monitoring:**
   - Review Firebase Console → Authentication → Users
   - Check last sign-in dates
   - Disable inactive accounts

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
