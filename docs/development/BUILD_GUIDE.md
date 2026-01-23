# Build Guide for Vercel Deployment

This guide provides step-by-step instructions for building and deploying the Snipe trading platform to Vercel.

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed on your local machine
2. **npm or yarn** package manager
3. **Vercel Account** (free tier is sufficient)
4. **Firebase Project** set up with:
   - Firestore Database enabled
   - Authentication enabled (Email/Password provider)
   - Admin users created in Firebase Console
5. **WalletConnect Project ID** from [WalletConnect Cloud](https://cloud.walletconnect.com)

## Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/ddefi0175-netizen/Snipe-.git
cd Snipe-

# Navigate to frontend directory
cd Onchainweb

# Install dependencies
npm install
```

## Step 2: Configure Environment Variables

Create a `.env` file in the `Onchainweb` directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your Firebase and WalletConnect credentials:

```env
# ===========================================
# REQUIRED: FIREBASE CONFIGURATION
# ===========================================
# Get these from Firebase Console > Project Settings > Your apps
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ===========================================
# REQUIRED: WALLETCONNECT CONFIGURATION
# ===========================================
# Get your Project ID from https://cloud.walletconnect.com
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# ===========================================
# OPTIONAL: APP CONFIGURATION
# ===========================================
VITE_APP_NAME=OnchainWeb
VITE_APP_URL=https://your-domain.vercel.app
```

### How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Click on the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. Click on the web app icon `</>` (or create a new web app)
6. Copy all the config values to your `.env` file

### How to Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign up or log in
3. Create a new project
4. Copy the **Project ID** to your `.env` file

## Step 3: Set Up Firebase

### Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Production mode**
4. Select your preferred location

### Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** sign-in method
4. Click **Save**

### Create Admin Users

Since admin login uses Firebase Authentication, you need to create admin accounts:

1. In Firebase Console, go to **Authentication** → **Users**
2. Click **Add user**
3. For **Master Admin**:
   - Email: `master@admin.onchainweb.app` (or your preferred email)
   - Password: Create a strong password
4. For **Regular Admin**:
   - Email: `admin@admin.onchainweb.app` (or use username@admin.onchainweb.app)
   - Password: Create a strong password

**Note**: The system automatically converts usernames to emails by appending `@admin.onchainweb.app` if you enter just a username during login.

### Configure Firestore Security Rules

Copy the security rules from `firestore.rules` to your Firebase Console:

1. Go to **Firestore Database** → **Rules**
2. Paste the contents of `firestore.rules`
3. Click **Publish**

## Step 4: Build the Application Locally

Test the build locally before deploying:

```bash
# From the Onchainweb directory
npm run build
```

This will:
- Compile and bundle the React application
- Generate optimized production files in the `dist/` directory
- Perform tree-shaking and minification

### Verify Build Output

Check that the build was successful:

```bash
ls -la dist/
```

You should see:
- `index.html`
- `assets/` directory with JS and CSS files
- Other static assets

### Test Build Locally

```bash
npm run preview
```

Open `http://localhost:4173` in your browser and verify:
- ✅ App loads without errors
- ✅ You can navigate to `/master-admin`
- ✅ Login form appears (no wallet connection required)
- ✅ You can log in with Firebase credentials

## Step 5: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from the root directory (not Onchainweb)
cd ..
vercel
```

Follow the prompts:
1. **Set up and deploy**: Yes
2. **Which scope**: Select your account
3. **Link to existing project**: No (or Yes if updating)
4. **Project name**: Enter your desired name
5. **Directory**: `./` (root directory)
6. **Override settings**: No

### Option B: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `cd Onchainweb && npm install && npm run build`
   - **Output Directory**: `Onchainweb/dist`
5. Add environment variables (see Step 6)
6. Click **Deploy**

## Step 6: Configure Vercel Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**, add all variables from your `.env` file:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key | Production, Preview |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your auth domain | Production, Preview |
| `VITE_FIREBASE_PROJECT_ID` | Your project ID | Production, Preview |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your storage bucket | Production, Preview |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID | Production, Preview |
| `VITE_FIREBASE_APP_ID` | Your app ID | Production, Preview |
| `VITE_FIREBASE_MEASUREMENT_ID` | Your measurement ID | Production, Preview |
| `VITE_WALLETCONNECT_PROJECT_ID` | Your WalletConnect ID | Production, Preview |
| `VITE_APP_NAME` | OnchainWeb | Production, Preview |
| `VITE_APP_URL` | https://your-domain.vercel.app | Production |

**Important**: Click **Save** after adding each variable.

## Step 7: Verify Deployment

After deployment completes:

1. Visit your Vercel deployment URL
2. Navigate to `/master-admin`
3. Test login with your Firebase admin credentials:
   - Username: `master` (or the email you created)
   - Password: Your Firebase password
4. Verify you can access the dashboard without wallet connection

## Step 8: Configure Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `VITE_APP_URL` in environment variables

## Troubleshooting

### Build Fails with "Module not found"

**Solution**: Ensure all dependencies are installed:
```bash
cd Onchainweb
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Firebase not available" Error

**Solution**: 
1. Verify all Firebase environment variables are set in Vercel
2. Check that variable names start with `VITE_`
3. Redeploy after adding variables

### Admin Login Not Working

**Solution**:
1. Verify Firebase Authentication is enabled
2. Check that Email/Password provider is active
3. Ensure admin user exists in Firebase Console
4. Try using full email instead of username

### Real-Time Data Not Updating

**Solution**:
1. Check Firestore Database is enabled
2. Verify security rules are published
3. Ensure Firebase credentials are correct
4. Check browser console for errors

### "Too Many Requests" Error

**Solution**: This happens after multiple failed login attempts. Wait 5-10 minutes or:
1. Go to Firebase Console → Authentication → Templates
2. Adjust rate limiting settings

### WalletConnect Not Working

**Solution**:
1. Verify `VITE_WALLETCONNECT_PROJECT_ID` is set
2. Check Project ID is correct in WalletConnect Cloud
3. Ensure domain is whitelisted in WalletConnect settings

## Build Configuration

The project uses the following build configuration (defined in `vercel.json`):

```json
{
  "buildCommand": "cd Onchainweb && npm install && npm run build",
  "outputDirectory": "Onchainweb/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
- ✅ Dependencies are installed in the correct directory
- ✅ Build runs in the `Onchainweb` folder
- ✅ Output is correctly located for deployment
- ✅ SPA routing works properly (all routes redirect to index.html)

## Admin Access URLs

After deployment, access admin panels at:

- **Master Admin**: `https://your-domain.vercel.app/master-admin`
- **Regular Admin**: `https://your-domain.vercel.app/admin`

**No wallet connection required** - just username and password!

## Performance Optimization

For optimal performance:

1. Enable Vercel's **Edge Network** (automatic)
2. Use Vercel's **Analytics** to monitor performance
3. Enable **Compression** in Vercel settings
4. Monitor Firebase usage in Firebase Console

## Security Checklist

Before going live, ensure:

- [ ] Firebase security rules are properly configured
- [ ] Admin passwords are strong and secure
- [ ] Environment variables are set to Production environment
- [ ] API keys are not exposed in client code
- [ ] CORS is properly configured
- [ ] SSL/TLS is enabled (automatic with Vercel)

## Support

For issues or questions:

1. Check the [README.md](README.md) for general information
2. Review [Firebase Setup Guide](FIREBASE_SETUP.md)
3. Open an issue on [GitHub](https://github.com/ddefi0175-netizen/Snipe-/issues)

## Next Steps

After successful deployment:

1. ✅ Test all admin features
2. ✅ Verify real-time data updates
3. ✅ Test wallet connections for regular users
4. ✅ Monitor Firebase usage and costs
5. ✅ Set up monitoring and alerts
6. ✅ Create backup admin accounts

---

**Last Updated**: January 2026  
**Version**: 2.0.0  
**Status**: Production Ready
