# 🚀 Snipe Deployment Guide

Complete guide for deploying the Snipe trading platform with real-time data.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [CI/CD Configuration](#cicd-configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- GitHub account
- Render.com account (for backend)
- Vercel or GitHub Pages (for frontend)

---

## Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/ddefi0175-netizen/Snipe.git
cd Snipe
```

### 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env

# Install dependencies
npm install

# Seed the database
node seed.js

# Start development server
npm start
```

### 3. Frontend Setup

```bash
cd Onchainweb

# Copy environment template
cp .env.example .env

# Edit .env with your backend URL
nano .env

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Backend Deployment

### Environment Variables (Required)

Create `.env` in `/backend/`:

```env
# Database - Replace with your MongoDB Atlas connection string
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/snipe?retryWrites=true&w=majority

# Server
PORT=4000

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Master Account (hardcoded admin)
MASTER_USERNAME=master
MASTER_PASSWORD=OnchainWeb2025!
```

### Deploy to Render.com

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Select the `backend` folder as root directory

2. **Configure Build Settings**

   ```text
   Root Directory: backend
   Build Command: npm install
   Start Command: node index.js
   ```

3. **Add Environment Variables**
   - MONGO_URI
   - JWT_SECRET
   - MASTER_USERNAME
   - MASTER_PASSWORD
   - PORT=4000

4. **Deploy**
   - Render auto-deploys on push to `main`
   - API URL: `https://your-app.onrender.com/api`

---

## Frontend Deployment

### Environment Variables

Create `.env` in `/Onchainweb/`:

```env
VITE_API_BASE=https://your-backend.onrender.com/api
```

### Deploy to GitHub Pages (Current Setup)

The workflow at `.github/workflows/deploy.yml` auto-deploys on push:

```yaml
# Triggered on push to main branch
# Builds Onchainweb and deploys to GitHub Pages
```

### Deploy to Vercel (Alternative)

1. Import repo in [Vercel](https://vercel.com)
2. Set root directory: `Onchainweb`
3. Add environment variable: `VITE_API_BASE`
4. Deploy

---

## Database Setup

### Seed Initial Data

Run the seed script to populate MongoDB with required initial data:

```bash
cd backend
node seed.js
```

This creates:

| Collection | Records |
| ------------ | --------- |
| Settings | Site configuration |
| Admins | aqiang (admin) |
| DepositWallets | BTC, ETH, BSC, TRC20, SOL, MATIC |
| TradingLevels | 5 levels (Bronze → Diamond) |
| Currencies | USDT, BTC, ETH, BNB, SOL, TRX, USDC, MATIC |
| Networks | BTC, ETH, BSC, TRC20, SOL, MATIC |
| ExchangeRates | Crypto/USDT pairs |

### Login Credentials After Seeding

| Account | Username | Password |
| --------- | ---------- | ---------- |
| Master | master | OnchainWeb2025! |
| Admin | aqiang | Aqiang2026! |

---

## CI/CD Configuration

### GitHub Actions Secrets

Go to **Repository → Settings → Secrets and variables → Actions**

Add these secrets if needed:

| Secret | Purpose |
| -------- | --------- |
| `MONGO_URI` | MongoDB connection (if using in CI) |
| `VERCEL_TOKEN` | For Vercel deployments |
| `VERCEL_ORG_ID` | Vercel organization |
| `VERCEL_PROJECT_ID` | Vercel project |

### Current Workflow

`.github/workflows/deploy.yml` - Deploys frontend to GitHub Pages on push to `main`

---

## Testing

### Run Deployment Tests

```bash
# Test against production API
./test-deployment.sh https://snipe-api.onrender.com/api

# Test against local
./test-deployment.sh http://localhost:4000/api
```

### Manual API Tests

```bash
# Health check
curl https://snipe-api.onrender.com/api/health

# Login test
curl -X POST https://snipe-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"master","password":"OnchainWeb2025!"}'

# Get settings (with token)
curl https://snipe-api.onrender.com/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Backend Issues

#### "MongoDB connection error"

- Check `MONGO_URI` is correct
- Ensure IP is whitelisted in MongoDB Atlas (0.0.0.0/0 for Render)
- Verify database name exists

#### "No token provided"

- Include `Authorization: Bearer TOKEN` header
- Token expires after 24h, re-login

#### Render cold starts (slow first request)

- Free tier spins down after 15 mins inactivity
- First request takes 30-60 seconds
- Consider upgrading or use a keep-alive service

### Frontend Issues

#### "Failed to fetch" / CORS errors

- Verify `VITE_API_BASE` matches your backend URL
- Backend has `cors()` middleware enabled
- Check browser console for exact error

#### Login not working

- Open browser DevTools → Network tab
- Check if API request goes to correct URL
- Verify response status and body

### Database Issues

#### Empty dashboard data

- Run `node seed.js` to populate initial data
- Check MongoDB Atlas collections have data

#### Duplicate key errors

- Seed script uses `upsert`, should not duplicate
- Clear collection and re-run if needed

---

## Project Structure

```text
Snipe/
├── backend/                 # Node.js Express API
│   ├── .env                 # Environment vars (not committed)
│   ├── .env.example         # Template
│   ├── index.js             # Entry point
│   ├── seed.js              # Database seeder
│   ├── models/              # Mongoose schemas
│   └── routes/              # API routes
├── Onchainweb/              # React Vite frontend
│   ├── .env                 # Environment vars
│   ├── .env.example         # Template
│   ├── src/
│   │   ├── components/      # React components
│   │   └── lib/             # API client, utilities
│   └── dist/                # Built files
├── .github/workflows/       # CI/CD
├── test-deployment.sh       # Deployment test script
└── DEPLOYMENT.md            # This file
```

---

## API Endpoints Reference

| Endpoint | Method | Auth | Description |
| ---------- | -------- | ------ | ------------- |
| `/api/health` | GET | No | Health check |
| `/api/auth/login` | POST | No | Login |
| `/api/auth/admins` | GET | Admin | List admins |
| `/api/settings` | GET | Admin | Get settings |
| `/api/settings` | PUT | Master | Update settings |
| `/api/trading-levels` | GET | Admin | Get trading levels |
| `/api/currencies` | GET | Admin | Get currencies |
| `/api/networks` | GET | Admin | Get networks |
| `/api/deposit-wallets` | GET | Admin | Get wallets |
| `/api/rates` | GET | Admin | Get exchange rates |
| `/api/users` | GET | Admin | List users |
| `/api/chat/messages` | POST | No | Send chat message |
| `/api/chat/admin/chats` | GET | Admin | Get chat sessions |
| `/api/chat/admin/reply` | POST | Admin | Reply to chat |

---

## Support

- **Repository**: <https://github.com/ddefi0175-netizen/Snipe>
- **Backend URL**: <https://snipe-api.onrender.com>
- **Frontend URL**: <https://www.onchainweb.app>
