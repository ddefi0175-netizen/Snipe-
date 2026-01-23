# ⚠️ DEPRECATED - Snipe Backend API

> **IMPORTANT**: This backend is **DEPRECATED** and kept only for legacy support.
> **Primary Database**: Firebase Firestore  
> **DO NOT USE** for new deployments or features.

## Migration Status

This backend is being phased out in favor of Firebase as the primary database:

- ✅ **Firebase is now primary**: Firestore + Firebase Auth
- ✅ **Real-time data**: Frontend uses Firestore `onSnapshot` listeners (no polling)
- ✅ **Authentication**: Firebase Auth for users
- ⚠️ **This backend**: Kept for admin operations and legacy compatibility only

### What to Use Instead

| Old (Deprecated) | New (Current) |
|-----------------|---------------|
| `POST /api/auth/register` | Firebase Auth `createUserWithEmailAndPassword()` |
| `POST /api/auth/login` | Firebase Auth `signInWithEmailAndPassword()` |
| `GET /api/users` | Firestore `collection('users')` with `onSnapshot` |
| `GET /api/trades` | Firestore `collection('trades')` with `onSnapshot` |
| `GET /api/deposits` | Firestore `collection('deposits')` with `onSnapshot` |

See `Onchainweb/src/lib/firebase.js` for Firebase implementation.

---

# Snipe Backend API (Legacy)

The Snipe backend provides a REST API for user management, real-time notifications,
chat functionality, and media uploads.

## Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas (free) or local MongoDB instance

### Setup

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT settings
   ```

3. **Seed database (optional):**

   ```bash
   npm run seed
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:4000`

## API Endpoints

All endpoints require a valid JWT token in the `Authorization` header:

```text
Authorization: Bearer <your-token>
```

### Authentication

- `POST /api/auth/register` – Create a new user account
- `POST /api/auth/login` – Log in and receive JWT token

### Notifications

- `GET /api/notifications/:userId` – Get your notifications
- `POST /api/notifications` – Create a notification
- `PATCH /api/notifications/:id/read` – Mark notification as read

### User Profile

- `GET /api/users` – Get all users (paginated)
- `POST /api/users` – Create or update user profile
- `PATCH /api/users/:id` – Update your profile information

### Chat

- `GET /api/chat/messages` – Get active chat messages
- `POST /api/chat/messages` – Send a message to chat
- `GET /api/chat/active` – Check if chat is currently active

### Uploads & Media

- `GET /api/uploads` – Get your uploads (paginated)
- `POST /api/uploads` – Upload media/file
- `PATCH /api/uploads/:id` – Update upload details

## Environment Variables

Required `.env` configuration:

```env
# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/snipe

# Server
PORT=4000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRY=7d
```

## Database Models

The backend uses the following Mongoose models:

- **User** – User profile, wallet info, points, referrals
- **Notification** – User notifications and alerts
- **ChatMessage** – Real-time chat messages
- **ActiveChat** – Chat session status
- **Upload** – Media uploads and metadata
- **BonusProgram** – Reward programs and bonuses
- **ActivityLog** – System activity tracking

## Development

### Run in watch mode

```bash
npm run dev
```

### Run tests

```bash
npm test
```

### Lint code

```bash
npm run lint
```

## Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) in the root directory for complete deployment
instructions to Render.com or other hosting providers.

## Support

For issues or questions about the API, please open an issue on GitHub.

---

**Note**: For admin/master account setup and advanced features, contact the
maintainer.
