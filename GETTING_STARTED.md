# Quick Reference: Running the Project

## TL;DR - Start Here

### Fastest Way to Start (Local Development)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Visit: http://localhost:3000

That's it! 🎉

---

## Commands

### Backend

```bash
cd backend

# Install dependencies
npm install

# Start local development
npm run dev
# Runs on http://localhost:8787

# Deploy to Cloudflare
npm run deploy

# View live logs
npm run tail

# Create D1 database
wrangler d1 create image_generator

# Create R2 bucket
wrangler r2 bucket create image_generator

# Create KV namespaces
wrangler kv:namespace create USERS_KV
wrangler kv:namespace create SESSIONS_KV
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development
npm run dev
# Runs on http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview

# Switch API endpoint
./switch-api.sh
```

---

## Environment Variables

### frontend/.env (Create or Edit)

**For Local Backend:**
```properties
VITE_API_BASE_URL=http://localhost:8787/api/v1
VITE_GOOGLE_CLIENT_ID=66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
VITE_APP_TITLE=Image Generator
```

**For Deployed Backend:**
```properties
VITE_API_BASE_URL=https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1
VITE_GOOGLE_CLIENT_ID=66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
VITE_APP_TITLE=Image Generator
```

**To Switch Between Them:**
```bash
cd frontend
./switch-api.sh
```

---

## Setup Paths

### Path 1: Local Development (Recommended for Dev)

1. Install backend:
   ```bash
   cd backend && npm install
   ```

2. Start backend:
   ```bash
   npm run dev
   ```
   ✓ Running on http://localhost:8787

3. In another terminal, install frontend:
   ```bash
   cd frontend && npm install
   ```

4. Update frontend/.env:
   ```properties
   VITE_API_BASE_URL=http://localhost:8787/api/v1
   VITE_GOOGLE_CLIENT_ID=66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
   ```

5. Start frontend:
   ```bash
   npm run dev
   ```
   ✓ Running on http://localhost:3000

✅ **Done!** Visit http://localhost:3000

---

### Path 2: Deploy to Cloudflare (For Production)

1. Login to Cloudflare:
   ```bash
   cd backend
   wrangler login
   ```

2. Create resources (one time):
   ```bash
   ./deploy.sh
   # Select option 1: Create Cloudflare resources
   ```

3. Deploy backend:
   ```bash
   npm run deploy
   ```
   ✓ Check output for your worker URL

4. Update frontend/.env:
   ```properties
   VITE_API_BASE_URL=https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1
   VITE_GOOGLE_CLIENT_ID=66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
   ```

5. Start frontend:
   ```bash
   cd frontend && npm run dev
   ```
   ✓ Running on http://localhost:3000 (frontend) + deployed API

---

## File Structure Reference

```
.
├── frontend/              # Vue 3 + Vite
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── api/           # API calls
│   │   ├── components/    # Vue components
│   │   ├── views/         # Pages
│   │   ├── stores/        # Pinia state
│   │   └── ...
│   ├── .env              # Base env variables
│   ├── .env.local        # Override (created by switch-api.sh)
│   └── package.json
│
├── backend/              # Cloudflare Workers + TypeScript
│   ├── src/
│   │   ├── index.ts      # Worker entry point
│   │   ├── handlers/     # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── models/       # Data models
│   │   ├── repositories/ # Data access layer
│   │   ├── services/     # Business logic
│   │   └── ...
│   ├── wrangler.toml     # Worker config
│   └── package.json
│
└── [Documentation Files]
    ├── ENVIRONMENT_SETUP.md  # ← YOU ARE HERE (setup guide)
    ├── QUICK_REFERENCE.txt   # → Quick commands/troubleshooting
    ├── README.md
    └── ...
```

---

## Troubleshooting

### Can't connect to API?

1. **Check backend is running:**
   ```bash
   curl http://localhost:8787/api/v1/health
   ```

2. **Check frontend .env has correct URL:**
   ```bash
   grep VITE_API_BASE_URL frontend/.env*
   ```

3. **Check CORS (browser console):**
   - Look for CORS errors
   - Verify frontend URL in backend CORS_ORIGIN

### "404 on /api/v1/..."?

- Check URL has `/api/v1` (not just `/api`)
- Verify backend is on http://localhost:8787 (not :3000)

### "Port already in use"?

```bash
# Find process on port 8787
lsof -i :8787
kill -9 <PID>

# Find process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Changes not showing?

- **Backend:** Restart `npm run dev` (no hot reload)
- **Frontend:** Changes auto-reload (check console for errors)
- **Env variables:** Restart frontend after editing .env

### Google OAuth not working?

Add localhost to Google Cloud Console:
1. https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Find OAuth 2.0 Client ID → Edit
4. Add Authorized origins: `http://localhost:3000`
5. Add Authorized redirect URIs: `http://localhost:3000/auth/callback`

---

## Development Workflow

### Daily Development

```bash
# Terminal 1 - Backend (stays running)
cd backend && npm run dev

# Terminal 2 - Frontend (stays running)
cd frontend && npm run dev

# Edit code, save, auto-reloads
```

### Before Committing

1. Test with deployed API:
   ```bash
   cd frontend
   ./switch-api.sh
   # Select: 2 (Deployed Worker)
   npm run dev
   ```

2. Deploy if backend changed:
   ```bash
   cd backend
   npm run deploy
   ```

### Production Deployment

```bash
# 1. Deploy backend
cd backend && npm run deploy

# 2. Build frontend
cd frontend && npm run build

# 3. Deploy frontend to hosting (Netlify, Vercel, etc.)
```

---

## Performance Tips

### Local Development (Fast Feedback)
- Use `npm run dev` for both
- Changes reflect immediately
- Great for rapid iteration

### Testing (Production-like)
- Use deployed API: `https://image-generator-api.YOUR-USERNAME.workers.dev`
- Simulates real latency and CORS
- Better for final testing

### Production
- Deployed backend: Cloudflare Workers
- Deployed frontend: Netlify, Vercel, or GitHub Pages
- Automatic scaling and CDN

---

## API Endpoints (v1)

All endpoints start with:
- **Local:** `http://localhost:8787/api/v1`
- **Deployed:** `https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1`

### Authentication
- `POST /auth/google` - Login with Google
- `GET /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout

### Users
- `GET /users/me` - Get current user
- `PUT /users/me` - Update user profile
- `GET /users/:id` - Get user by ID

### Images (Coming Soon)
- `POST /images/generate` - Generate image
- `POST /images/upload` - Upload image
- `GET /images` - List user's images
- `GET /images/:id` - Get image details
- `DELETE /images/:id` - Delete image

---

## Next Steps

✅ **You're ready!**

1. **If you haven't yet:**
   - Start with Path 1 (Local Development)
   - Run both frontend and backend locally
   - Test authentication with Google

2. **Then:**
   - Explore the codebase
   - Build image generation components
   - Integrate Nanobanana API

3. **Finally:**
   - Deploy to Cloudflare (Path 2)
   - Test with deployed backend
   - Deploy frontend to production

---

## Resources

- **Backend Docs:** `backend/README.md`
- **Frontend Docs:** `frontend/package.json` (scripts section)
- **Environment Setup:** `ENVIRONMENT_SETUP.md`
- **Full Reference:** `QUICK_REFERENCE.txt`
- **Deployment:** `backend/DEPLOYMENT_GUIDE.md`

---

## Key Info

- **Frontend URL (dev):** http://localhost:3000
- **Backend URL (local):** http://localhost:8787/api/v1
- **Backend URL (deployed):** https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1
- **Google OAuth Client ID:** 66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
- **JWT Secret:** ICY7Jp3DE6TNkZFVLxc+e8iK01ohMnD9GWiuppbBxT8=

---

**Questions?** Check QUICK_REFERENCE.txt or ENVIRONMENT_SETUP.md!

🚀 Happy coding!
