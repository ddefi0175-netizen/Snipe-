# API Documentation

## Overview

Snipe provides a RESTful API via Cloudflare Workers for cost-effective operations and an edge caching layer. The API is organized into several endpoints for different functionalities.

**Base URL**: `https://api.yourdomain.com` (or your Workers route)

## Authentication

Most API endpoints require authentication via Firebase Auth tokens or API keys.

### Header Format

```http
Authorization: Bearer <firebase-id-token>
```

or for admin operations:

```http
Authorization: Bearer <admin-api-key>
```

### Obtaining Firebase Token

```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();
```

## Rate Limiting

- **Standard users**: 100 requests/hour
- **Admin users**: 5,000 requests/hour
- **IP-based**: 1,000 requests/hour per IP

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## API Endpoints

### Health Check

Check API status and version.

**Endpoint**: `GET /health`

**Authentication**: None

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T19:34:42.037Z",
  "version": "1.0.0"
}
```

---

## User Management API

### Get User Data

Retrieve user profile data with edge caching.

**Endpoint**: `GET /api/users/:userId`

**Authentication**: Required (Bearer token)

**Parameters**:
- `userId` (path) - User ID

**Response** (200 OK):
```json
{
  "userId": "user123",
  "walletAddress": "0x1234...5678",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "lastActive": "2026-01-28T19:34:42.037Z"
}
```

**Headers**:
- `X-Cache: HIT` - Data served from cache
- `X-Cache: MISS` - Data fetched from Firestore

**Errors**:
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User not found

---

### Create/Update User

Create a new user or update existing user data.

**Endpoint**: `POST /api/users`

**Authentication**: Required

**Request Body**:
```json
{
  "userId": "user123",
  "walletAddress": "0x1234...5678",
  "email": "user@example.com",
  "metadata": {
    "timezone": "UTC",
    "preferences": {}
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "userId": "user123",
  "cached": true
}
```

**Errors**:
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Invalid token

---

### Update User

Update specific user fields.

**Endpoint**: `PUT /api/users/:userId`

**Authentication**: Required

**Request Body**:
```json
{
  "email": "newemail@example.com",
  "metadata": {
    "timezone": "America/New_York"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "userId": "user123",
  "data": {
    "userId": "user123",
    "walletAddress": "0x1234...5678",
    "email": "newemail@example.com",
    "updatedAt": "2026-01-28T19:34:42.037Z"
  }
}
```

---

### Delete User Cache

Clear user cache (admin only).

**Endpoint**: `DELETE /api/users/:userId`

**Authentication**: Required (Admin)

**Response** (200 OK):
```json
{
  "success": true,
  "userId": "user123",
  "message": "User cache cleared"
}
```

---

## Admin API

### List All Users

Get a list of all users (admin only).

**Endpoint**: `GET /api/admin/users`

**Authentication**: Required (Admin)

**Response** (200 OK):
```json
{
  "users": [
    {
      "userId": "user123",
      "walletAddress": "0x1234...5678",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Errors**:
- `401 Unauthorized` - Not an admin
- `429 Too Many Requests` - Rate limit exceeded

---

### Update User Permissions

Update permissions for a specific user (admin only).

**Endpoint**: `POST /api/admin/users/:userId/permissions`

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "permissions": {
    "canTrade": true,
    "canWithdraw": true,
    "verified": true
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "userId": "user123",
  "permissions": {
    "canTrade": true,
    "canWithdraw": true,
    "verified": true
  },
  "message": "Permissions updated, cache cleared"
}
```

---

### Get Platform Statistics

Retrieve platform-wide statistics (admin only).

**Endpoint**: `GET /api/admin/stats`

**Authentication**: Required (Admin)

**Response** (200 OK):
```json
{
  "totalUsers": 1234,
  "activeUsers": 567,
  "totalTrades": 8900,
  "totalVolume": "1234567.89",
  "timestamp": 1640000000
}
```

**Headers**:
- `X-Cache: HIT` - Stats served from cache (5 min TTL)
- `X-Cache: MISS` - Stats calculated fresh

---

## Cache API

### Get Cached Data

Retrieve data from edge cache.

**Endpoint**: `GET /api/cache/:collection/:id`

**Authentication**: Required

**Example**: `GET /api/cache/users/user123`

**Response** (200 OK):
```json
{
  "data": {
    "userId": "user123",
    "walletAddress": "0x1234...5678"
  },
  "cached": true,
  "timestamp": 1640000000
}
```

**Headers**:
- `X-Cache: HIT` - Cache hit
- `Cache-Control: public, max-age=60` - Browser caching

**Errors**:
- `404 Not Found` - Cache miss

---

### Update Cache

Store data in edge cache.

**Endpoint**: `POST /api/cache/:collection/:id`

**Authentication**: Required

**Request Body**:
```json
{
  "userId": "user123",
  "walletAddress": "0x1234...5678",
  "_ttl": 3600
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "collection": "users",
  "id": "user123",
  "ttl": 3600,
  "cachedAt": 1640000000
}
```

---

### Invalidate Cache

Clear cached data.

**Endpoint**: `DELETE /api/cache/:collection/:id`

**Authentication**: Required (Admin)

**Response** (200 OK):
```json
{
  "success": true,
  "collection": "users",
  "id": "user123",
  "message": "Cache invalidated"
}
```

---

## Storage API

### Upload File

Upload a file to R2 storage.

**Endpoint**: `POST /storage/upload`

**Authentication**: Required

**Request**: `multipart/form-data`

**Fields**:
- `file` (file) - The file to upload
- `category` (string) - File category: `profile`, `kyc`, `receipts`, `chat`
- `userId` (string) - User ID

**Example**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('category', 'profile');
formData.append('userId', 'user123');

const response = await fetch('/storage/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

**Response** (201 Created):
```json
{
  "success": true,
  "filename": "profile/user123/1640000000-abc123.jpg",
  "url": "https://storage.yourdomain.com/profile/user123/1640000000-abc123.jpg",
  "size": 123456,
  "type": "image/jpeg"
}
```

**Limits**:
- Maximum file size: 10MB
- Allowed types depend on category

**Errors**:
- `400 Bad Request` - Invalid file type or missing fields
- `413 Payload Too Large` - File exceeds 10MB

---

### Retrieve File

Get a file from R2 storage.

**Endpoint**: `GET /storage/file/:filename`

**Authentication**: Required

**Example**: `GET /storage/file/profile/user123/1640000000-abc123.jpg`

**Response**: Binary file data with appropriate content-type

**Headers**:
- `Content-Type: image/jpeg` (or appropriate type)
- `Cache-Control: public, max-age=31536000` (1 year for immutable files)
- `ETag: "..."` - File hash

**Errors**:
- `404 Not Found` - File not found

---

### Delete File

Delete a file from R2 storage.

**Endpoint**: `DELETE /storage/file/:filename`

**Authentication**: Required (Owner or Admin)

**Response** (200 OK):
```json
{
  "success": true,
  "filename": "profile/user123/1640000000-abc123.jpg",
  "message": "File deleted"
}
```

---

### List User Files

List all files for a specific user.

**Endpoint**: `GET /storage/list/:userId`

**Authentication**: Required

**Response** (200 OK):
```json
{
  "userId": "user123",
  "files": [
    {
      "filename": "profile/user123/1640000000-abc123.jpg",
      "size": 123456,
      "uploaded": "2026-01-28T19:34:42.037Z",
      "metadata": {
        "userId": "user123",
        "category": "profile",
        "originalName": "avatar.jpg"
      }
    }
  ],
  "count": 1
}
```

---

## KV Cache Operations

### Get Cache Value

Direct KV cache read.

**Endpoint**: `GET /cache/get/:key`

**Authentication**: Required

**Response** (200 OK):
```json
{
  "key": "user:user123",
  "value": {
    "userId": "user123",
    "walletAddress": "0x1234...5678"
  },
  "cached": true,
  "hit": true
}
```

**Headers**:
- `X-Cache: HIT` - Cache hit
- `X-Cache: MISS` - Cache miss

---

### Set Cache Value

Store value in KV cache.

**Endpoint**: `POST /cache/set`

**Authentication**: Required

**Request Body**:
```json
{
  "key": "user:user123",
  "value": {
    "userId": "user123",
    "walletAddress": "0x1234...5678"
  },
  "ttl": 3600
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "key": "user:user123",
  "ttl": 3600,
  "expiresAt": "2026-01-28T20:34:42.037Z"
}
```

---

### Delete Cache Value

Remove value from cache.

**Endpoint**: `DELETE /cache/delete/:key`

**Authentication**: Required (Admin)

**Response** (200 OK):
```json
{
  "success": true,
  "key": "user:user123",
  "message": "Cache entry deleted"
}
```

---

### Increment Counter

Increment a counter in KV (for rate limiting).

**Endpoint**: `POST /cache/increment`

**Authentication**: Required

**Request Body**:
```json
{
  "key": "ratelimit:user123",
  "increment": 1,
  "ttl": 3600
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "key": "ratelimit:user123",
  "value": 42,
  "increment": 1
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid request parameters
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `413 Payload Too Large` - File too large
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Code Examples

### JavaScript/TypeScript

```javascript
// Get user data
async function getUserData(userId, token) {
  const response = await fetch(`/api/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

// Upload file
async function uploadFile(file, userId, category, token) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  formData.append('category', category);
  
  const response = await fetch('/storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  return await response.json();
}
```

### cURL

```bash
# Get user data
curl -X GET https://api.yourdomain.com/api/users/user123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload file
curl -X POST https://api.yourdomain.com/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg" \
  -F "userId=user123" \
  -F "category=profile"

# Get platform stats (admin)
curl -X GET https://api.yourdomain.com/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## WebSocket (Future)

Real-time updates currently use Firebase's built-in `onSnapshot` listeners. Future versions may implement WebSocket connections via Cloudflare Durable Objects for additional real-time features.

---

## Versioning

The API follows semantic versioning:
- Current version: `v1`
- Breaking changes will increment major version
- New features increment minor version
- Bug fixes increment patch version

---

## Support

For API support:
- Check error messages in responses
- Review API documentation
- Check Cloudflare Workers logs
- Contact support with request IDs

---

## Changelog

### v1.0.0 (2026-01-28)
- Initial API release
- User management endpoints
- Admin operations
- Cache API
- Storage API (R2)
- KV operations
