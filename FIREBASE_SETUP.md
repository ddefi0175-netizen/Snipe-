# Firebase Setup Guide

This guide will help you set up Firebase for the Snipe trading platform.

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Google account

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "snipe-trading")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in production mode" (we have security rules)
4. Select your region (choose closest to your users)
5. Click "Enable"

## Step 3: Enable Authentication

1. Click "Authentication" in the left menu
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## Step 4: Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "Snipe Web")
6. Copy the Firebase configuration object

## Step 5: Configure Environment Variables

1. Navigate to `Onchainweb` directory:
   ```bash
   cd Onchainweb
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and fill in your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Add your WalletConnect Project ID:
   ```env
   VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
   ```

## Step 6: Deploy Firestore Rules and Indexes

1. Login to Firebase CLI:
   ```bash
   firebase login
   ```

2. Initialize Firebase in your project (from root directory):
   ```bash
   cd ..
   firebase init
   ```
   - Select "Firestore" and "Hosting"
   - Choose your existing project
   - Accept default files (firestore.rules, firestore.indexes.json)
   - Set public directory to `Onchainweb/dist`
   - Configure as single-page app: Yes
   - Don't overwrite existing files

3. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

4. Deploy Firestore indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

## Step 7: Create Initial Admin User

1. Go to Firebase Console > Authentication
2. Click "Add user"
3. Enter email and password for master admin
4. Copy the User UID (you'll need this)
5. Go to Firestore Database
6. Create a new collection called "admins"
7. Add a document with the User UID as the document ID
8. Add these fields:
   ```json
   {
     "email": "admin@example.com",
     "username": "master",
     "role": "master",
     "permissions": {
       "manageUsers": true,
       "manageBalances": true,
       "manageKYC": true,
       "manageTrades": true,
       "viewReports": true,
       "manageStaking": true,
       "manageAIArbitrage": true,
       "manageDeposits": true,
       "manageWithdrawals": true,
       "customerService": true,
       "viewLogs": true,
       "siteSettings": true,
       "createAdmins": true
     },
     "userAccessMode": "all",
     "createdAt": [current timestamp],
     "updatedAt": [current timestamp]
   }
   ```

## Step 8: Install Dependencies and Run

1. Install frontend dependencies:
   ```bash
   cd Onchainweb
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Step 9: Build for Production

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy to Firebase Hosting (optional):
   ```bash
   cd ..
   firebase deploy --only hosting
   ```

   Or deploy to Vercel:
   ```bash
   cd Onchainweb
   vercel --prod
   ```

## Firestore Collections Structure

The following collections will be created automatically as you use the app:

- **users**: User profiles and wallet information
- **admins**: Admin accounts and permissions
- **trades**: Trading records
- **deposits**: Deposit transactions
- **withdrawals**: Withdrawal requests
- **chatMessages**: Chat messages between users and admins
- **activeChats**: Active chat sessions
- **notifications**: User notifications
- **settings**: Global application settings
- **activityLogs**: Admin activity logs

## Security

- Never commit your `.env` file to version control
- Keep your Firebase API keys secure
- Regularly review Firestore security rules
- Monitor Firebase Console for suspicious activity
- Enable App Check for additional security (optional)

## Troubleshooting

### Firebase not initializing
- Check that all required environment variables are set in `.env`
- Verify the Firebase config values match your Firebase Console
- Make sure `.env` file is in the `Onchainweb` directory

### Permission denied errors
- Check Firestore security rules are deployed
- Verify user authentication is working
- Check that user has required permissions in Firestore

### Data not updating in real-time
- Verify Firestore indexes are deployed
- Check browser console for errors
- Ensure you're using the Firebase real-time listeners correctly

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

## Support

For issues related to this setup, please open an issue on the [GitHub repository](https://github.com/ddefi0175-netizen/Snipe/issues).
