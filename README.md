# Snipe – Real-Time Trading Platform

A modern, accessible trading platform with real-time price updates, user dashboards,
and live chat functionality. Built with Node.js, React, and MongoDB.

## 🚀 Live Demo

- **Frontend**: [https://www.onchainweb.app](https://www.onchainweb.app)
- **Backend API**: [https://snipe-api.onrender.com](https://snipe-api.onrender.com)
- **Documentation**: [View Docs](https://github.com/ddefi0175-netizen/Snipe)

## Features

- **Real-Time Price Updates**: Live cryptocurrency price feeds powered by CoinGecko
- **User Dashboard**: Track your trading activity, points, and performance metrics
- **Live Chat**: Real-time chat system for community engagement
- **Wallet Integration**: Connect your Web3 wallet to view balances and interact
  with the platform
- **Accessible UI**: Built with accessibility-first principles for all users
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Quick Start

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

4. **Open your browser:**

   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000`

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

The platform includes a comprehensive admin management system with granular permissions.

### Admin Hierarchy

- **Master Account**: Full platform control, can create/manage all admins
- **Admin Accounts**: Customizable permissions, can be assigned specific users

### Admin Permissions

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
| createAdmins | Create new admin accounts |

### User Assignment Modes

Admins can be configured with:

- **All Users**: Access to manage all platform users
- **Assigned Users Only**: Limited to specific user IDs

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## License

See [LICENSE](LICENSE) for details.

---

**Note**: For advanced deployment and configuration, see the
[DEPLOYMENT.md](DEPLOYMENT.md) guide.
