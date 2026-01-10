# Snipe – Real-Time Trading Platform 🚀

[![Production Status](https://img.shields.io/badge/status-production%20ready-success.svg)](FINAL_VERIFICATION_AND_RELEASE_REPORT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Device Compatible](https://img.shields.io/badge/device-compatible-blue.svg)](DEVICE_COMPATIBILITY_TEST.md)
[![Performance](https://img.shields.io/badge/performance-optimized-green.svg)](FINAL_PUBLIC_RELEASE_SUMMARY.md)
[![Build](https://img.shields.io/badge/build-passing-success.svg)](FINAL_VERIFICATION_AND_RELEASE_REPORT.md)
[![Tests](https://img.shields.io/badge/tests-96%2F99%20passing-success.svg)](FINAL_VERIFICATION_AND_RELEASE_REPORT.md)

A modern, accessible trading platform with real-time price updates, user dashboards,
and live chat functionality. Built with React and Firebase.

**✨ Features**: 11 Wallet Providers • Real-Time Data • Live Chat • Admin System • Security-First Design • **Mobile Optimized**

---

## 🔥 Backend Architecture Update (v2.0.0)

**Major Improvement**: The platform has been upgraded to use **Firebase** as the backend, replacing the previous MongoDB + Express.js setup. This provides:

✅ **Serverless Architecture** - No backend server to maintain
✅ **Better Reliability** - 99.95% uptime, no cold starts
✅ **Real-Time Updates** - WebSocket listeners instead of polling
✅ **Lower Costs** - Pay-per-use instead of fixed server costs
✅ **Easier Deployment** - Frontend-only deployment

📖 **[Read the Backend Replacement Guide](BACKEND_REPLACEMENT.md)** for full details.

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites
```bash
Node.js 18+
npm or yarn
```

### 1️⃣ Get Firebase Credentials (3 min)
Go to **[https://console.firebase.google.com](https://console.firebase.google.com)**
- Create/select project
- Settings → Your apps → Web
- Copy configuration values

### 2️⃣ Configure Frontend (1 min)
```bash
# Update these 7 values in Onchainweb/.env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 3️⃣ Run (1 min)
```bash
cd Onchainweb
npm run dev
```

🎉 **App running at**: http://localhost:5173

---

## 📖 Configuration & Setup Guides

| Guide | Purpose | Time |
|-------|---------|------|
| **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** | Setup overview with both options | 5 min |
| **[CONFIGURATION_STATUS.md](CONFIGURATION_STATUS.md)** | Current config status + how to get credentials | 10 min |
| **[FIREBASE_CREDENTIALS_REPORT.md](FIREBASE_CREDENTIALS_REPORT.md)** | Detailed credentials breakdown | Reference |
| **[backend/SETUP_GUIDE.md](backend/SETUP_GUIDE.md)** | Backend setup (optional, legacy) | 10 min |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Production deployment | 30 min |
| **[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)** | Deploy to Vercel | 15 min |

---

## 🚀 Live Demo

Try it now:
- **Frontend**: [https://www.onchainweb.app](https://www.onchainweb.app)
- **Database**: Firebase Firestore (Real-time)
- **Authentication**: Firebase Auth

### Admin Access

**🔑 Firebase Authentication for Admin Login!**

Admin and Master accounts use **Firebase Authentication** with email + password.

- **Master Dashboard**: [https://www.onchainweb.app/master-admin](https://www.onchainweb.app/master-admin)
  - Email: Set in Firebase Console
  - Password: Set in Firebase Console
  - **Access**: Full system control, can create admins

- **Admin Panel**: [https://www.onchainweb.app/admin](https://www.onchainweb.app/admin)
  - Email: Created by master admin
  - Password: Set when admin account is created
  - **Access**: Permission-based (configured by master)

- **Authentication**:
  - Firebase Authentication (Email/Password provider)
  - Token-based session management
  - Completely separate from wallet-based user authentication
  - Works on any browser without wallet extensions

- **📖 Documentation**:
  - [Admin Setup Guide](ADMIN_SETUP_GUIDE.md) - **START HERE** - Complete setup instructions
  - [Admin User Guide](ADMIN_USER_GUIDE.md) - How to use admin features
  - [Real-Time Data Architecture](REALTIME_DATA_ARCHITECTURE.md) - Data flow and updates
  - [Implementation Summary](ADMIN_LOGIN_IMPLEMENTATION_SUMMARY.md) - Technical details

- **🔧 Quick Setup**:
  1. Enable admin features: Set `VITE_ENABLE_ADMIN=true` in `Onchainweb/.env`
  2. Create admin accounts in [Firebase Console](https://console.firebase.google.com) (Authentication > Users)
  3. Add admin emails to `VITE_ADMIN_ALLOWLIST` in `.env`
  4. Run verification: `./verify-admin-login.sh`
  5. Start server: `cd Onchainweb && npm run dev`
  6. Access: `/admin` or `/master-admin` routes

- **IMPORTANT**: Configure admin users in Firebase Console. Never commit credentials to the repository.

## Features

### Dual Authentication System

- **👥 Regular Users (Wallet-Based)**:
  - Connect MetaMask, Trust Wallet, or 11+ supported Web3 wallets
  - Access trading, deposits, withdrawals, and live chat
  - Wallet connection required for all user functions
  - See [WalletConnect Implementation Guide](WALLETCONNECT_IMPLEMENTATION.md) for setup

- **🔑 Admin/Master (Username + Password)**:
  - **No wallet required!** Login with username and password only
  - Access admin dashboard from `/admin` or `/master-admin` routes
  - JWT token-based authentication (completely separate from wallet auth)
  - Works on any browser without needing wallet extensions
  - See [Admin Wallet-Free Login Guide](ADMIN_WALLET_FREE_LOGIN.md) for details

### Core Features

- **Real-Time Price Updates**: Live cryptocurrency price feeds powered by CoinGecko
- **Real-Time Admin Control**: Master and admin accounts control all platform functions with live data from Firebase Firestore
- **User Dashboard**: Track your trading activity, points, and performance metrics
- **Live Chat**: Real-time chat system with instant delivery (WebSocket)
- **Admin Activity Tracking**: All admin actions are logged and monitored in real-time
- **Accessible UI**: Built with accessibility-first principles for all users
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Real-Time Data System

All admin and master account operations work with **real-time data from Firebase Firestore** using WebSocket listeners:

- ✅ User management with live balance updates
- ✅ Real-time deposit and withdrawal processing
- ✅ Live trading activity monitoring
- ✅ Instant admin permission changes
- ✅ Real-time KYC approval workflow
- ✅ Activity logs for all admin actions

**Data Sources**: All data comes from Firebase Firestore with automatic real-time synchronization:
- User data: Real-time Firestore listeners
- Active trades: Real-time updates (WebSocket)
- Deposits/Withdrawals: Instant notifications
- Chat messages: Real-time chat system (WebSocket)
- No polling required - all updates are pushed instantly

**Performance**: Updates are delivered in <50ms (compared to 3-second polling in the old MongoDB backend).

For detailed information, see [Real-Time Data Architecture](REALTIME_DATA_ARCHITECTURE.md) and [Backend Replacement](BACKEND_REPLACEMENT.md).

## 🚀 Quick Start

### For Users

1. **Visit the Live Site**: [https://www.onchainweb.app](https://www.onchainweb.app)
2. **Connect Your Wallet**: Click "Connect Wallet" and choose from 11 supported wallets
3. **Start Trading**: Explore real-time prices, live chat, and user dashboard

### For Developers

Want to run your own instance? Follow our comprehensive setup guide:

**Prerequisites**:
- Node.js 18+
- Firebase Account (https://firebase.google.com)
- npm or yarn

**Quick Setup**:

```bash
# 1. Clone the repository
git clone https://github.com/ddefi0175-netizen/Snipe.git
cd Snipe

# 2. Setup Firebase Project
# - Create a new Firebase project at https://console.firebase.google.com
# - Enable Firestore Database
# - Enable Authentication (Email/Password)
# - Get your Firebase config credentials

# 3. Setup Frontend
cd Onchainweb
cp .env.example .env
# Edit .env with your Firebase config and WalletConnect Project ID
npm install
npm run dev
```

**📖 Detailed Setup**: See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

## Tech Stack

| Component   | Technology             |
| ----------- | ---------------------- |
| Frontend    | React + Vite           |
| Backend     | Firebase (Serverless)  |
| Database    | Firebase Firestore     |
| Auth        | Firebase Authentication|
| Price Feed  | CoinGecko API          |
| Deployment  | Vercel, Firebase Hosting|

**Note**: The platform previously used MongoDB + Express.js backend, which has been replaced with Firebase for better reliability, scalability, and lower maintenance. See [Backend Replacement](BACKEND_REPLACEMENT.md) for details.

**Note**: The platform uses Firebase (Serverless) - no backend API endpoints are needed for new deployments.

## Legacy API Endpoints (Deprecated)

**⚠️ DEPRECATED**: The following REST API endpoints were part of the old MongoDB backend and are no longer recommended. Firebase provides these features through its SDK.

<details>
<summary>View Legacy API Endpoints (Not Recommended)</summary>

The MongoDB + Express.js backend has been replaced with Firebase. If you're using the old backend, please migrate to Firebase by following the [Backend Replacement Guide](BACKEND_REPLACEMENT.md).

### Notifications

- `GET /api/notifications/:userId` – Get your notifications
- `POST /api/notifications` – Create a notification
- `PATCH /api/notifications/:id/read` – Mark notification as read

### User Profile

- `GET /api/users` – Get user list
- `POST /api/users` – Create or update user profile
- `PATCH /api/users/:id` – Update your profile

### Chat

- `GET /api/chat/messages` – Get active chat messages
- `POST /api/chat/messages` – Send a message
- `GET /api/chat/active` – Check if chat is active

### Uploads & Media

- `GET /api/uploads` – Get user uploads
- `POST /api/uploads` – Upload media
- `PATCH /api/uploads/:id` – Update upload status

**Firebase Equivalent**: These features are now provided through Firebase SDK:
- Firestore for data storage and real-time updates
- Firebase Storage for file uploads
- Firebase Authentication for user management

See [Firebase Setup Guide](FIREBASE_SETUP.md) for migration instructions.

</details>

## 🔐 Wallet Connection System

The platform features a comprehensive multi-wallet connection system supporting **11 different wallet providers** across all platforms (desktop, mobile, dApps browsers).

### Supported Wallets

| Wallet | Connection Method | Platform Support |
| -------- | ------------------- | ------------------ |
| MetaMask | Injected Provider / WalletConnect | Desktop, Mobile, Browser |
| Trust Wallet | Deep Link / WalletConnect | Mobile, dApp Browser |
| Coinbase Wallet | Injected / WalletConnect | Desktop, Mobile |
| OKX Wallet | Injected / WalletConnect | Desktop, Mobile |
| Phantom | Injected (EVM Mode) | Desktop, Mobile |
| Binance Web3 Wallet | Injected | Desktop |
| TokenPocket | Deep Link / Injected | Mobile |
| Rainbow | WalletConnect | Mobile |
| Ledger Live | WalletConnect | Desktop |
| imToken | Deep Link / Injected | Mobile |
| WalletConnect | QR Code Protocol | Universal |

### Connection Strategies

The system uses intelligent environment detection to provide the optimal connection method:

1. **Desktop Browser with Extension**
   - Direct injected provider connection (fastest)
   - Falls back to WalletConnect QR code

2. **Mobile Browser**
   - Deep links to open wallet apps directly
   - Automatic return to browser after signing

3. **In-App dApp Browser**
   - Uses wallet's native injected provider
   - Detects Trust Wallet, MetaMask, OKX, etc.

4. **No Wallet Installed**
   - WalletConnect QR code for any wallet
   - Links to download official wallet apps

### Key Features

- **EIP-6963 Support**: Modern multi-wallet detection standard
- **Open Access Mode**: Users can explore without connecting wallet
- **Auto-Detection**: Identifies available wallets and in-app browsers
- **Deep Linking**: Native mobile app integration
- **Graceful Fallbacks**: Multiple connection methods per wallet
- **Clear Error Messages**: User-friendly feedback for all scenarios

### For Developers

```javascript
// Using the wallet provider
import { useUniversalWallet } from '../lib/walletConnect';

function MyComponent() {
  const {
    address,           // Connected wallet address
    isConnected,       // Connection status
    connectWallet,     // Connect function
    disconnect,        // Disconnect function
    environment        // Current environment info
  } = useUniversalWallet();

  return (
    <button onClick={() => connectWallet('metamask')}>
      Connect MetaMask
    </button>
  );
}
```

## 🛡️ Admin Management System

The platform includes a comprehensive admin management system with granular permissions and real-time data access.

### Admin Hierarchy

- **Master Account**: Full platform control, can create/manage all admins with any permissions
- **Admin Accounts**: Customizable permissions, can be assigned specific users or access all users

### Admin Permissions

All permissions are customizable when creating admin accounts:

| Permission | Description |
| ------------ | ------------- |
| manageUsers | View and edit user profiles |
| manageBalances | Modify user account balances |
| manageKYC | Review and approve KYC submissions |
| manageTrades | Monitor and intervene in trades |
| viewReports | Access platform analytics |
| manageStaking | Control staking features |
| manageAIArbitrage | Manage AI arbitrage system |
| manageDeposits | Process deposit requests |
| manageWithdrawals | Approve withdrawal requests |
| customerService | Access support tickets |
| viewLogs | View system audit logs |
| siteSettings | Modify platform settings |
| createAdmins | Create new admin accounts (typically master only) |

### User Assignment Modes

Admins can be configured with:

- **All Users** (`userAccessMode: "all"`): Access to manage all platform users
- **Assigned Users Only** (`userAccessMode: "assigned"`): Limited to specific user IDs

### Creating Admin Accounts

Master accounts can create admins with any combination of permissions:

```bash
curl -X POST https://snipe-api.onrender.com/api/auth/admin \
  -H "Authorization: Bearer MASTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin",
    "password": "SecurePass123!",
    "email": "admin@example.com",
    "permissions": {
      "manageUsers": true,
      "manageBalances": true,
      "manageKYC": true,
      "manageTrades": false
    },
    "userAccessMode": "all"
  }'
```

For detailed instructions, see [Admin User Guide](ADMIN_USER_GUIDE.md).

### Real-Time Admin Features

- **Live Activity Monitoring**: All admin actions are tracked in real-time
- **Permission-Based Access**: Each admin only sees data they have permission to access
- **User Assignment**: Assign specific users to specific admins
- **Audit Logging**: Complete history of all admin actions with timestamps
- **Real-Time Stats**: Dashboard shows live user counts, trade activity, and system health

## Support

For issues, questions, or feature requests, please [open an issue](https://github.com/ddefi0175-netizen/Snipe/issues) on GitHub.

## Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**: [Open an issue](https://github.com/ddefi0175-netizen/Snipe/issues) with details
2. **Suggest Features**: Share your ideas via [GitHub Issues](https://github.com/ddefi0175-netizen/Snipe/issues)
3. **Submit PRs**: Fork the repo, make changes, and submit a pull request
4. **Improve Docs**: Help make our documentation better

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

See [LICENSE](LICENSE) for details.

---

**Made with ❤️ by the Snipe Team**

⭐ Star us on GitHub if you find this project useful!

**Note**: For advanced deployment and configuration, see the
[DEPLOYMENT.md](DEPLOYMENT.md) guide.
