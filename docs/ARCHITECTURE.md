# Architecture Documentation - Snipe Platform

## Overview

Snipe is a cost-optimized, production-ready DeFi trading platform built with a hybrid architecture combining Firebase for real-time features and Cloudflare for edge computing and storage.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ MetaMask │  │WalletCon │  │  Trust   │  │   OKX    │   │
│  │          │  │  nect    │  │  Wallet  │  │  Wallet  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Edge Network (Global CDN)            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │ Cloudflare     │  │ Cloudflare KV  │  │ Cloudflare R2  ││
│  │ Pages (React)  │  │ (Edge Cache)   │  │ (Storage)      ││
│  │ - Static Site  │  │ - Sub-ms reads │  │ - Zero egress  ││
│  │ - Auto SSL     │  │ - 100k free/day│  │ - $0.015/GB    ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │         Cloudflare Workers (Serverless API)              ││
│  │  - Cache API (KV)      - Storage API (R2)                ││
│  │  - Admin API           - User API                        ││
│  │  - 100k requests/day FREE                                ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend (Google)                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │   Firestore    │  │ Firebase Auth  │  │   Realtime DB  ││
│  │ - NoSQL DB     │  │ - Email/Pass   │  │ - WebSockets   ││
│  │ - Real-time    │  │ - JWT tokens   │  │ - Live updates ││
│  │ - Offline      │  │ - 50k MAU free │  │ - Presence     ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │  WalletConnect │  │   CoinGecko    │  │    Telegram    ││
│  │  - Web3 Auth   │  │ - Price Data   │  │ - Notifications││
│  └────────────────┘  └────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Design Principles

### 1. **Cost Optimization**
- Use free tiers wherever possible
- Cloudflare KV for caching (100k reads/day free)
- Cloudflare R2 for zero egress fees
- Firebase free tier for 50k MAU

### 2. **Performance**
- Edge caching with Cloudflare
- Sub-millisecond response times
- Real-time updates via WebSockets
- Optimized bundle splitting

### 3. **Reliability**
- 99.95% uptime (Firebase SLA)
- Global CDN (Cloudflare)
- Automatic failover
- No single point of failure

### 4. **Security**
- Firestore Security Rules
- Firebase Authentication
- No credentials in frontend
- HTTPS everywhere

---

## 🔧 Component Details

### Frontend (React + Vite)

**Technology:**
- React 18.3.1
- Vite 5.4.21
- Tailwind CSS 4.1.18
- React Router 7.12.0

**Key Features:**
- Code splitting for optimal loading
- Tree shaking for minimal bundle size
- Hot module replacement (HMR)
- TypeScript JSX support

**Bundle Optimization:**
```javascript
manualChunks: {
  'vendor-react': ['react', 'react-dom'],
  'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  'wallet': ['@walletconnect/universal-provider']
}
```

**Performance Targets:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Bundle size (gzipped): < 500KB
- Lighthouse score: > 90

---

### Cloudflare Workers (Serverless API)

**Endpoints:**

1. **Cache API** (`/api/cache/*`)
   - GET: Retrieve cached data
   - PUT: Store data in KV
   - DELETE: Clear cache
   - TTL: Configurable per request

2. **Storage API** (`/api/storage/*`)
   - GET: Download from R2
   - PUT: Upload to R2
   - DELETE: Remove from R2
   - Zero egress fees

3. **Admin API** (`/api/admin`)
   - POST: Execute admin operations
   - Requires Bearer token
   - Firebase Admin SDK integration

4. **Users API** (`/api/users/*`)
   - GET: Fetch user data (cached)
   - KV cache with 1-hour TTL

**Worker Configuration:**
```toml
account_id = "eb568c24da7c746c95353226eb665d00"
[[kv_namespaces]]
binding = "CACHE"
id = "488840361a874877b2b54506b15f746a"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "onchainweb"
```

---

### Firebase Backend

**Firestore Collections:**

1. **users** - User profiles and settings
   ```javascript
   {
     uid: string,
     email: string,
     walletAddress: string,
     balance: number,
     createdAt: timestamp
   }
   ```

2. **admins** - Admin accounts (master only)
   ```javascript
   {
     uid: string,
     email: string,
     role: 'master' | 'admin',
     permissions: object,
     createdAt: timestamp
   }
   ```

3. **trades** - Trading history
   ```javascript
   {
     userId: string,
     type: 'buy' | 'sell',
     amount: number,
     price: number,
     timestamp: timestamp
   }
   ```

4. **deposits** - Deposit records
5. **withdrawals** - Withdrawal records
6. **chatMessages** - Customer service messages
7. **activeChats** - Live chat sessions

**Security Rules:**
- Email-verified users only
- Admins identified by email pattern
- Master admin has full access
- Regular users own their data

---

## 🔄 Data Flow

### User Registration Flow
```
1. User connects wallet (MetaMask/WalletConnect)
   └─> Frontend validates wallet signature
2. Frontend calls Firebase Auth createUser()
   └─> Firebase creates auth user
3. Frontend writes to Firestore /users/{uid}
   └─> Security rules validate ownership
4. User profile cached in Cloudflare KV
   └─> Future requests hit cache first
```

### Real-Time Trading Flow
```
1. User initiates trade on frontend
   └─> Frontend writes to Firestore /trades
2. Firestore triggers onSnapshot listener
   └─> Real-time update to dashboard
3. Trade data cached in KV (5 min TTL)
   └─> Fast retrieval for other users
4. Admin dashboard shows live trades
   └─> WebSocket connection via Firebase
```

### File Upload Flow
```
1. User uploads file (profile pic, etc.)
   └─> Frontend calls Cloudflare service
2. Service uploads to R2 via Worker
   └─> POST /api/storage/{path}
3. Worker returns public URL
   └─> https://.../r2.cloudflarestorage.com/...
4. URL stored in Firestore
   └─> Zero egress fees on download
```

---

## 💰 Cost Analysis

### Monthly Cost Breakdown (10,000 users)

**Firebase:**
- Firestore reads: 10M = $1.80
- Firestore writes: 1M = $1.80
- Auth: Free (< 50k MAU)
- **Total: $3.60**

**Cloudflare:**
- Workers: Free (< 100k req/day)
- KV: Free (< 100k reads/day)
- R2: $0.015/GB storage
- Pages: Free
- **Total: $0.50** (estimated)

**External:**
- WalletConnect: Free
- CoinGecko: Free tier
- **Total: $0**

**Grand Total: ~$4.10/month** for 10k users

### Comparison with Traditional Architecture

| Component | Traditional | Snipe | Savings |
|-----------|-------------|-------|---------|
| Backend Server | $20/month | $0 | 100% |
| Database | $15/month | $3.60 | 76% |
| Storage | $10/month | $0.50 | 95% |
| CDN | $5/month | $0 | 100% |
| **Total** | **$50/month** | **$4.10** | **92%** |

---

## 🔐 Security Architecture

### Authentication Flow
```
1. User logs in with email/password
   └─> Firebase Auth verifies credentials
2. Firebase issues JWT token
   └─> Token includes email and custom claims
3. Frontend stores token in memory
   └─> Never in localStorage
4. Token sent with Firestore requests
   └─> Security rules validate token
5. Admin operations verify email pattern
   └─> @admin.onchainweb.* or @onchainweb.site
```

### Security Layers

1. **Network Layer**
   - Cloudflare DDoS protection
   - WAF (Web Application Firewall)
   - Rate limiting

2. **Application Layer**
   - Firebase Authentication
   - Firestore Security Rules
   - Input validation

3. **Data Layer**
   - Encryption at rest
   - Encryption in transit
   - Regular backups

---

## 📊 Performance Optimization

### Frontend Optimizations
- Code splitting by route
- Lazy loading components
- Image optimization
- Service Worker caching

### Backend Optimizations
- KV cache for hot data
- Firestore composite indexes
- Efficient query patterns
- Batch operations

### Network Optimizations
- Cloudflare global CDN
- HTTP/2 and HTTP/3
- Brotli compression
- Resource hints (preload, prefetch)

---

## 🔄 Scaling Strategy

### Horizontal Scaling
- Cloudflare Workers auto-scale
- Firebase auto-scales
- No server management needed

### Vertical Scaling
- Increase Firebase tier if needed
- Add more KV namespaces
- Use multiple R2 buckets

### Geographic Distribution
- Cloudflare: 200+ data centers
- Firebase: Multi-region replication
- Users always hit nearest edge

---

## 🛠️ Development Workflow

1. **Local Development**
   ```bash
   npm run dev  # Vite dev server
   ```

2. **Testing**
   ```bash
   npm run build  # Production build
   npm run preview  # Preview build
   ```

3. **Deployment**
   ```bash
   npm run deploy:all  # Deploy workers + pages
   ```

---

## 📚 Technology Choices

### Why React?
- Large ecosystem
- Component reusability
- Virtual DOM performance
- Wide developer adoption

### Why Firebase?
- Real-time capabilities
- No backend needed
- Generous free tier
- Managed service

### Why Cloudflare?
- Global edge network
- Zero egress fees (R2)
- Free caching (KV)
- Free Workers tier

### Why Vite?
- Fast builds
- Hot module replacement
- Modern ES modules
- Optimized production builds

---

## 🔮 Future Enhancements

1. **GraphQL API** - Replace REST with GraphQL
2. **Service Workers** - Offline support
3. **Push Notifications** - Real-time alerts
4. **Analytics Dashboard** - Usage metrics
5. **A/B Testing** - Feature flags
6. **Multi-language** - i18n support

---

**Architecture designed for scale, optimized for cost!** 🚀
