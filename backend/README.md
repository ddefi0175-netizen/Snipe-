# Snipe Backend API

## Stack
- Node.js + Express.js
- MongoDB (Mongoose)
- REST API for notifications, users, uploads

## Setup
1. Install dependencies:
   ```bash
   cd /workspaces/Snipe/backend
   npm install
   npm run dev
   ```
2. Set up MongoDB:
   - Use MongoDB Atlas (free cloud) or local MongoDB
   - Update `.env` with your MongoDB URI if needed
3. Start server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

## API Endpoints
- `GET /api/notifications/:userId` — Get notifications for user
- `POST /api/notifications` — Create notification
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `GET /api/users` — List users
- `POST /api/users` — Create or update user by wallet
- `PATCH /api/users/:id` — Update user (points, role, etc)
- `GET /api/uploads?userId=...` — List uploads (optionally filter by user)
- `POST /api/uploads` — Create upload (user screenshot)
- `PATCH /api/uploads/:id` — Update upload status

## Next Steps
- Add authentication (JWT or similar)
- Add admin/master dashboard endpoints
- Integrate with frontend
- Add file/image upload (Cloudinary, Firebase, or similar)
