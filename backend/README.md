# OPNNG.IO Backend API - Cloudflare Workers

A high-performance, serverless API built with Cloudflare Workers, optimized for the OPNNG.IO frontend application.

## 📋 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main entry point
│   ├── router/
│   │   └── router.ts          # Request routing
│   ├── routes/
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── users.ts           # User management endpoints
│   │   └── data.ts            # Data/analytics endpoints
│   ├── handlers/
│   │   ├── authHandler.ts     # Auth business logic
│   │   ├── userHandler.ts     # User business logic
│   │   └── dataHandler.ts     # Data business logic
│   ├── services/
│   │   └── googleService.ts   # Google OAuth integration
│   ├── middleware/
│   │   ├── cors.ts            # CORS handling
│   │   ├── errorHandler.ts    # Error handling
│   │   └── requestLogger.ts   # Request logging
│   ├── utils/
│   │   ├── responses.ts       # Response helpers
│   │   ├── auth.ts            # Auth utilities
│   │   └── jwt.ts             # JWT utilities
│   └── types/
│       └── index.ts           # TypeScript definitions
├── wrangler.toml             # Cloudflare config
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── .env.example              # Environment variables
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-secret-key
```

### 3. Update wrangler.toml

Replace placeholder values:

- `your-users-kv-id` - Your KV namespace ID for users
- `your-sessions-kv-id` - Your KV namespace ID for sessions
- `your-zone-id` - Your Cloudflare zone ID

### 4. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 5. Deploy to Cloudflare

```bash
npm run deploy
```

Or for staging:

```bash
npm run deploy:staging
```

## 📡 API Endpoints

### Authentication (`/api/v1/auth`)

#### POST `/auth/google`

Google OAuth login

**Request:**

```json
{
  "token": "google_access_token"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "picture": "https://...",
      "authProvider": "google"
    },
    "token": "jwt_auth_token"
  }
}
```

#### POST `/auth/logout`

Logout user

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

#### GET `/auth/me`

Get current user (requires auth)

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "picture": "https://...",
      "authProvider": "google"
    }
  }
}
```

#### POST `/auth/refresh`

Refresh auth token (requires auth)

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

### Users (`/api/v1/users`)

#### GET `/users`

List all users

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 42
  }
}
```

#### GET `/users/:id`

Get user by ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://...",
    "createdAt": "2024-12-16T10:30:00Z"
  }
}
```

#### PUT `/users/:id`

Update user (requires auth)

**Request:**

```json
{
  "name": "New Name",
  "picture": "https://new-picture.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "New Name",
    "picture": "https://new-picture.jpg"
  }
}
```

### Data (`/api/v1/data`)

#### GET `/data/dashboard`

Get dashboard statistics

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "label": "Total Users",
        "value": 1250,
        "trend": "+12%"
      }
    ],
    "recentActivity": [...]
  }
}
```

#### GET `/data/analytics`

Get analytics data

**Response:**

```json
{
  "success": true,
  "data": {
    "pageViews": [...],
    "usersByCountry": [...],
    "deviceBreakdown": [...]
  }
}
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Data Storage

### KV Namespaces

- `USERS_KV` - User data storage
- `SESSIONS_KV` - Session data (7-day TTL)

### D1 Database (Optional)

For structured queries, configure D1 database in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_id = "your-database-id"
```

## 🌍 CORS Configuration

CORS is enabled for:

- `http://localhost:3000` (development)
- `http://localhost:3001` (dev fallback)
- `https://yourdomain.com` (production)

Edit the CORS origin in `.env`:

```
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

## 🐛 Development

### Enable Debug Logging

Set `ENVIRONMENT=development` in `.env` for detailed error messages.

### View Logs

```bash
npm run tail
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 📦 Dependencies

- **wrangler** - Cloudflare Workers CLI
- **TypeScript** - Type safety
- **axios** - HTTP requests (optional)
- **jsonwebtoken** - JWT handling (optional)

## 🚀 Deployment

### 1. Create Cloudflare Account

Visit https://dash.cloudflare.com

### 2. Get API Token

Create an API token with `Workers` and `KV` permissions

### 3. Set Wrangler Config

```bash
wrangler login
```

### 4. Create KV Namespaces

```bash
wrangler kv:namespace create "USERS_KV"
wrangler kv:namespace create "SESSIONS_KV"
```

### 5. Deploy

```bash
npm run deploy
```

Your API is now live at `https://your-worker.your-subdomain.workers.dev`

## 🔄 CI/CD

GitHub Actions workflow can be set up to auto-deploy on push:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 📝 Environment Variables

| Variable               | Description                   | Required |
| ---------------------- | ----------------------------- | -------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID        | Yes      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret           | Yes      |
| `JWT_SECRET`           | Secret for JWT signing        | Yes      |
| `CORS_ORIGIN`          | Allowed CORS origins          | No       |
| `ENVIRONMENT`          | `development` or `production` | No       |

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test locally: `npm run dev`
4. Deploy to staging: `npm run deploy:staging`
5. Create pull request

## 📄 License

MIT
