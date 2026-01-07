# Snipe – Real-Time Trading Platform

A modern, accessible trading platform with real-time price updates, user dashboards, and live chat functionality. Built with Node.js, React, and MongoDB.

## 🚀 Live Demo

- **Frontend**: [https://snipe-frontend.vercel.app](https://snipe-frontend.vercel.app)
- **Backend API**: [https://snipe-backend.onrender.com](https://snipe-backend.onrender.com)
- **Documentation**: [View Docs](https://github.com/ddefi0175-netizen/Snipe)

## Features

- **Real-Time Price Updates**: Live cryptocurrency price feeds powered by CoinGecko
- **User Dashboard**: Track your trading activity, points, and performance metrics
- **Live Chat**: Real-time chat system for community engagement
- **Wallet Integration**: Connect your Web3 wallet to view balances and interact with the platform
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

| Component | Technology |
|-----------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB |
| Price Feed | CoinGecko API |
| Deployment | Vercel (frontend), Render (backend) |

## Public API Endpoints

The following endpoints are available for registered users:

- **Notifications**
  - `GET /api/notifications/:userId` – Get your notifications
  - `POST /api/notifications` – Create a notification
  - `PATCH /api/notifications/:id/read` – Mark notification as read

- **User Profile**
  - `GET /api/users` – Get user list
  - `POST /api/users` – Create or update user profile
  - `PATCH /api/users/:id` – Update your profile

- **Chat**
  - `GET /api/chat/messages` – Get active chat messages
  - `POST /api/chat/messages` – Send a message
  - `GET /api/chat/active` – Check if chat is active

- **Uploads & Media**
  - `GET /api/uploads` – Get user uploads
  - `POST /api/uploads` – Upload media
  - `PATCH /api/uploads/:id` – Update upload status

## Authentication

Register a new account or log in with your credentials through the frontend dashboard. Your session is secured with JWT tokens.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## License

See [LICENSE](LICENSE) for details.

---

**Note**: For advanced deployment and configuration, see the [DEPLOYMENT.md](DEPLOYMENT.md) guide.