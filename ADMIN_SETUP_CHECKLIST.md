# Admin Provisioning Setup Checklist

## ✅ Pre-Setup (Do Once)

- [ ] **Firebase Project Created**
  - Go to https://console.firebase.google.com
  - Create a new project or select existing
  - Enable Firestore Database
  - Enable Authentication (Email/Password method)

- [ ] **WalletConnect Project Created**
  - Go to https://cloud.walletconnect.com
  - Create a project
  - Copy Project ID (looks like: `2a1b3c4d...`)

---

## ✅ Step 1: Get Firebase Credentials

1. Open [Firebase Console](https://console.firebase.google.com)
2. Go to **Project Settings** ⚙️
3. Scroll to **"Your apps"** section
4. Click your **Web app** (or create with `</> Web`)
5. Copy the config object with these 8 values:
   ```
   apiKey
   authDomain
   projectId
   storageBucket
   messagingSenderId
   appId
   measurementId
   ```

---

## ✅ Step 2: Create Master User in Firebase

1. In Firebase Console, go to **Authentication** → **Users**
2. Click **+ Create user**
3. Enter:
   - **Email**: `master@admin.onchainweb.app`
   - **Password**: Strong password (e.g., `SecureP@ss123!`)
4. Click **Create user**

✅ Master user is now created in Firebase Auth

---

## ✅ Step 3: Update Environment Variables

Edit `Onchainweb/.env`:

```env
# Firebase values from Step 1
VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# WalletConnect from Step 1
VITE_WALLETCONNECT_PROJECT_ID=YOUR_WC_PROJECT_ID

# Admin feature enable & allowlist
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app
```

**⚠️ IMPORTANT**:
- No spaces around `=`
- Save the file
- These values must be real (not placeholders)
- Don't commit `.env` to git

---

## ✅ Step 4: Verify Dependencies

Run this to ensure all packages are installed:

```bash
cd Onchainweb
npm install
```

Expected output:
```
up to date, audited X packages
```

---

## ✅ Step 5: Start Development Server

```bash
cd Onchainweb
npm run dev
```

Expected output:
```
  VITE v5.x.x  build ready in XXXms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

Open browser to: **http://localhost:5173**

---

## ✅ Step 6: Login as Master

1. Click on **Admin** link or navigate to: `http://localhost:5173/master-admin`
2. Enter:
   - **Username**: `master`
   - **Password**: (password from Step 2)
3. Click **Sign In**

✅ You should see the Master Admin Dashboard with sections:
- Admin Management
- User Management
- Financial Management
- Trading Management
- System Settings

---

## ✅ Step 7: Create Your First Admin (Optional)

From the Master Admin Dashboard:

1. Go to **Admin Management**
2. Click **+ Create New Admin**
3. Fill in:
   - **Username**: `admin1`
   - **Password**: Strong password
   - **Email**: (optional)
   - **Permissions**: Check desired permissions
   - **User Access Mode**: Select `all` or `assigned`
4. Click **Create Admin**

✅ Admin account created! This admin can now:
- Login at `/admin` with username `admin1` and password
- Access `/admin` dashboard based on their permissions

---

## ✅ Step 8: Test Wallet Connection (Optional)

To test admin auto-detection via wallet:

1. **In Master Dashboard**:
   - Find the admin you created
   - Click **Link Wallet**
   - Paste a wallet address (e.g., from MetaMask)
   - Save

2. **On public site** (`/`):
   - Click "Connect Wallet"
   - Connect with the wallet you linked
   - ✅ Should auto-redirect to admin dashboard!

---

## ✅ Step 9: Test User Auto-Provisioning (Optional)

To test automatic user creation:

1. **On public site** (`/`):
   - Click "Connect Wallet"
   - Use a **different wallet** (not linked to any admin)
   - ✅ User should auto-provision (no redirect)

2. **Check localStorage**:
   - Open DevTools (F12)
   - Console → `JSON.parse(localStorage.getItem('registeredUsers'))`
   - ✅ You should see new user entry with that wallet

---

## ✅ Step 10: Deploy to Production (When Ready)

### Before deploying:
- [ ] Test all flows locally (master login, admin creation, wallet connection)
- [ ] Set strong passwords for all admin accounts
- [ ] Update `VITE_ADMIN_ALLOWLIST` with all admin emails
- [ ] Deploy Firestore security rules: `firebase deploy --only firestore:rules`

### Deploy frontend:
```bash
cd Onchainweb
npm run build
npm run preview  # Preview production build locally
```

Then deploy to Vercel/hosting with same `.env` variables.

---

## ✅ Troubleshooting

### Error: "Cannot find Firebase config"
**Cause**: `VITE_FIREBASE_*` values missing or invalid
**Fix**:
- Verify all 8 values are filled in `Onchainweb/.env`
- Restart dev server: `npm run dev`
- No spaces around `=` in .env file

### Error: "Firebase not initialized"
**Cause**: Firebase credentials not yet loaded
**Fix**:
- Check browser console for error messages
- Verify `.env` values are correct
- Try incognito mode (clear cache)

### Error: "Admin account not allowlisted"
**Cause**: Email not in `VITE_ADMIN_ALLOWLIST`
**Fix**:
- Add email to `VITE_ADMIN_ALLOWLIST` in `.env`
- Restart dev server
- Try login again

### Error: "Invalid email format" on master login
**Cause**: Entered email instead of username
**Fix**:
- Use **username** not email
- Enter: `master` (not `master@admin.onchainweb.app`)
- Or: Enter full email if it's in allowlist

### Login shows "Firebase: Error (auth/user-not-found)"
**Cause**: User doesn't exist in Firebase Auth
**Fix**:
- Go to Firebase Console > Authentication > Users
- Verify the user exists
- If not, create it manually
- Check email spelling

### Wallet auto-login not working
**Cause**: Wallet not linked to admin
**Fix**:
- In Master Dashboard, link wallet to admin account
- Wallet address must match exactly
- Try different wallet address if still not working

### Users not auto-provisioning
**Cause**: Firebase not available or user already registered
**Fix**:
- Check `isFirebaseAvailable` in console
- Check if user already in `localStorage.registeredUsers`
- Check browser console for `[PROVISIONING]` logs

---

## 🎯 Quick Reference

| Action | Location | Credentials |
|--------|----------|-------------|
| Master Login | `/master-admin` | username: `master` |
| Admin Login | `/admin` | username from admin creation |
| User Wallet Connect | `/` | Connect wallet button |
| Firebase Console | https://console.firebase.google.com | Your Google account |
| WalletConnect | https://cloud.walletconnect.com | Your WalletConnect account |

---

## 📚 Next Steps

- [ ] Read [FIREBASE_AUTO_PROVISIONING.md](FIREBASE_AUTO_PROVISIONING.md) for detailed setup
- [ ] Read [ADMIN_USER_GUIDE.md](ADMIN_USER_GUIDE.md) for admin management
- [ ] Read [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) for Firebase credentials
- [ ] Review [.github/copilot-instructions.md](.github/copilot-instructions.md) for architecture

---

## 🆘 Still Need Help?

1. Check browser **Console** (F12) for error messages
2. Check **Network** tab for failed requests
3. Check `.env` file has all 8 Firebase values
4. Try **incognito mode** (clear browser cache)
5. Look for debug logs: `[LOGIN]`, `[PROVISIONING]`, `[ADMIN-DETECT]`

---

**Status**: ✅ **COMPLETE**
**Last Updated**: January 2026
**Time to Setup**: ~10 minutes
