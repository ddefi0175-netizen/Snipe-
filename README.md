# Snipe – Real-Time Trading Platform

A modern, accessible trading platform with real-time price updates, user dashboards,
and live chat functionality. Built with Node.js, React, and MongoDB.

## 🚀 Live URLs

- **Frontend**: [https://www.onchainweb.app](https://www.onchainweb.app)
- **Backend API Base**: [https://snipe-api.onrender.com/api](https://snipe-api.onrender.com/api)
- **Health Check**: [https://snipe-api.onrender.com/health](https://snipe-api.onrender.com/health)

### Admin Access

- **Master Account**: Username is `master` (password set via `MASTER_PASSWORD` environment variable)
- **Admin Panel**: [https://www.onchainweb.app/admin](https://www.onchainweb.app/admin)
- **Master Dashboard**: [https://www.onchainweb.app/master-admin](https://www.onchainweb.app/master-admin)
- API login endpoint: `POST /api/auth/login` with `{ username, password }`
  - Master token includes full permissions and can create admins with custom permissions.
- **📖 For detailed admin usage**: See [Admin User Guide](ADMIN_USER_GUIDE.md)
- **📊 Real-time data architecture**: See [Real-Time Data Architecture](REALTIME_DATA_ARCHITECTURE.md)
- **IMPORTANT**: Never commit real credentials to the repository. Always use environment variables.

## Features

- **Real-Time Price Updates**: Live cryptocurrency price feeds powered by CoinGecko
- **Real-Time Admin Control**: Master and admin accounts control all platform functions with live data from MongoDB
- **User Dashboard**: Track your trading activity, points, and performance metrics
- **Live Chat**: Real-time chat system for community engagement
- **Wallet Integration**: Connect your Web3 wallet to view balances and interact
  with the platform
- **Admin Activity Tracking**: All admin actions are logged and monitored in real-time
- **Accessible UI**: Built with accessibility-first principles for all users
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Real-Time Data System

All admin and master account operations work with **real-time data from MongoDB**:

- ✅ User management with live balance updates
- ✅ Real-time deposit and withdrawal processing
- ✅ Live trading activity monitoring
- ✅ Instant admin permission changes
- ✅ Real-time KYC approval workflow
- ✅ Activity logs for all admin actions

**Data Sources**: All data comes from MongoDB Atlas with automatic refresh intervals:
- User data: 30-second refresh
- Active trades: 3-second refresh
- Deposits/Withdrawals: 30-second refresh

For detailed information, see [Real-Time Data Architecture](REALTIME_DATA_ARCHITECTURE.md).

## Quick Start (Local)

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ddefi0175-netizen/Snipe.git
   cd Snipe
   ```

2. **Setup Backend:**

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and other configuration
   npm install
   npm run dev
   ```

3. **Setup Frontend:**

   ```bash
   cd ../Onchainweb
   cp .env.example .env
   # Edit .env with your backend URL
   npm install
   npm run dev
   ```

4. **Run & Verify:**

   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000`
   - Health check: `curl http://localhost:4000/health`

5. **Production Env Vars (Render/Vercel):**

   - Backend: `MONGO_URI`, `JWT_SECRET`, `MASTER_USERNAME`, `MASTER_PASSWORD`, `SEED_ADMIN_PASSWORD`
   - Frontend: `VITE_API_BASE=https://snipe-api.onrender.com/api`

## Tech Stack

| Component   | Technology             |
| ----------- | ---------------------- |
| Frontend    | React + Vite           |
| Backend     | Node.js + Express      |
| Database    | MongoDB                |
| Price Feed  | CoinGecko API          |
| Deployment  | Vercel, Render         |

## Public API Endpoints

The following endpoints are available for registered users:

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

## Authentication

Register a new account or log in with your credentials through the frontend
dashboard. Your session is secured with JWT tokens.

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

For issues, questions, or feature requests, please open an issue on GitHub.

## License

See [LICENSE](LICENSE) for details.

---

**Note**: For advanced deployment and configuration, see the
[DEPLOYMENT.md](DEPLOYMENT.md) guide.
