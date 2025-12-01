# Environment Setup Guide

## Local Development vs Deployed Worker

Choose your setup based on your needs:

## Option 1: Local Development (Recommended for Development)

Use local backend server with frontend in development mode.

### Setup

**Backend:**
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:8787
```

**Frontend:**
```bash
cd frontend
npm install

# Update frontend/.env
VITE_API_BASE_URL=http://localhost:8787/api/v1
VITE_GOOGLE_CLIENT_ID=66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
VITE_APP_TITLE=Image Generator

npm run dev
# Frontend runs on http://localhost:3000
```

**Pros:**
- Fast development cycle
- No deployment time
- Easy debugging
- Hot reload works

**Cons:**
- Requires local database setup
- Backend only runs locally

---

## Option 2: Deployed Worker (Recommended for Testing)

Use deployed Cloudflare Worker as backend API.

### Setup

**Deploy Backend:**
```bash
cd backend
wrangler login
npm run deploy
# Note your worker URL: https://image-generator-api.YOUR-USERNAME.workers.dev
```

**Frontend:**
```bash
cd frontend
npm install

# Update frontend/.env
VITE_API_BASE_URL=https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1
VITE_GOOGLE_CLIENT_ID=66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
VITE_APP_TITLE=Image Generator

npm run dev
# Frontend runs on http://localhost:3000
```

**Pros:**
- Tests in production-like environment
- No local database needed
- Scalable immediately
- Real CORS handling

**Cons:**
- Slower feedback loop
- Need to redeploy for backend changes
- Costs money after free tier

---

## Option 3: Hybrid (Best of Both)

Keep local backend for rapid development, switch to deployed for testing.

### Local Development

```bash
# Two terminal windows

# Terminal 1 - Backend (local)
cd backend
npm run dev

# Terminal 2 - Frontend (local)
cd frontend
VITE_API_BASE_URL=http://localhost:8787/api/v1 npm run dev
```

### Before Committing/Deployment

```bash
# Deploy backend
cd backend
npm run deploy

# Update frontend
cd frontend
VITE_API_BASE_URL=https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1 npm run dev

# Test with deployed backend
```

---

## Environment Variables

### Frontend (.env)

#### Development (Local Backend)
```properties
VITE_API_BASE_URL=http://localhost:8787/api/v1
VITE_GOOGLE_CLIENT_ID=66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
VITE_APP_TITLE=Image Generator
```

#### Development (Deployed Backend)
```properties
VITE_API_BASE_URL=https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1
VITE_GOOGLE_CLIENT_ID=66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
VITE_APP_TITLE=Image Generator
```

#### Production
```properties
VITE_API_BASE_URL=https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1
VITE_GOOGLE_CLIENT_ID=YOUR_PROD_CLIENT_ID
VITE_APP_TITLE=Image Generator
```

### Backend (wrangler.toml)

#### Development Environment
```toml
[env.development]
vars = { 
  API_VERSION = "v1", 
  ENVIRONMENT = "development",
  GOOGLE_CLIENT_ID = "66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com",
  CORS_ORIGIN = "http://localhost:3000,http://localhost:8787"
}
```

#### Production Environment
```toml
[env.production]
vars = { 
  API_VERSION = "v1", 
  ENVIRONMENT = "production",
  GOOGLE_CLIENT_ID = "YOUR_PROD_CLIENT_ID",
  CORS_ORIGIN = "https://yourdomain.com"
}
```

---

## Quick Setup Commands

### Start Everything Locally

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Visit: http://localhost:3000

### Deploy Backend

```bash
cd backend
wrangler login          # First time only
npm run deploy
```

### Test with Deployed Backend

```bash
cd frontend
VITE_API_BASE_URL=https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1 npm run dev
```

### View Worker Logs

```bash
cd backend
npm run tail
```

---

## Switching Environments

### Edit frontend/.env

Change `VITE_API_BASE_URL` between:

```properties
# Local
VITE_API_BASE_URL=http://localhost:8787/api/v1

# or Deployed
VITE_API_BASE_URL=https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1
```

Then restart frontend: `npm run dev`

---

## Configuration Priority

Frontend loads environment variables in this order:

1. `.env.local` (highest priority - not committed)
2. `.env.development` (development-specific)
3. `.env` (base configuration)
4. Code defaults (lowest priority)

Example:
```bash
# Use for quick testing
echo "VITE_API_BASE_URL=https://image-generator-api.test.workers.dev/api/v1" > frontend/.env.local
npm run dev
```

---

## Troubleshooting

### "API not found" errors?

Check `VITE_API_BASE_URL` matches your backend URL:
```bash
curl https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1/health
```

### CORS errors?

1. Verify frontend URL in backend CORS_ORIGIN
2. For local: `http://localhost:3000` should work
3. For deployed: add your domain

### Connection refused?

Make sure backend is running:
```bash
# Check if local backend is running
curl http://localhost:8787/api/v1/health

# Check if deployed backend is accessible
curl https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1/health
```

---

## Recommended Workflow

### Day-to-Day Development
1. Use **Option 1: Local Development**
2. Run both backend and frontend locally
3. Rapid feedback loop

### Before Git Push
1. Test with **Option 2: Deployed Worker**
2. Run frontend against deployed backend
3. Verify everything works in production-like environment

### Deployment
1. **Option 3: Hybrid** workflow
2. Keep backend deployed
3. Frontend users hit deployed API

---

## Performance Comparison

| Aspect | Local | Deployed |
|--------|-------|----------|
| Latency | <10ms | 50-100ms |
| Cost | Free | $0.50/M requests |
| Setup Time | 2 min | 10 min |
| Feedback | Instant | 30 sec deploy |
| Data | Local | Cloud |
| Scaling | None | Automatic |

---

## Getting Your Worker URL

After deploying:

```bash
# Option 1: Check deployment output
npm run deploy
# Shows: https://image-generator-api.YOUR-USERNAME.workers.dev

# Option 2: List all workers
wrangler list

# Option 3: Check dashboard
# https://dash.cloudflare.com/ → Workers → image_generator_api
```

Replace `YOUR-USERNAME` with your actual Cloudflare username.

---

## Summary

- **Local Development:** `http://localhost:8787/api/v1`
- **Deployed Worker:** `https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1`
- **Update:** Edit `VITE_API_BASE_URL` in `frontend/.env`
- **Restart:** Frontend automatically reloads on `.env` change

🎉 You're ready to develop! Pick an option above and get started!
