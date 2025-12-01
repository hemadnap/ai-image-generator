# 🚀 Backend Deployment to Cloudflare Workers

## Worker Name: `image_generator_api`

Your backend has been configured and is ready to deploy to Cloudflare Workers!

## Quick Start (5 minutes)

### Step 1: Authenticate with Cloudflare

```bash
cd backend
wrangler login
```

This will open your browser to authorize Wrangler with Cloudflare.

### Step 2: Create Cloudflare Resources

```bash
# Make the deploy script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh

# Select option 1 to create resources
```

Or manually:

```bash
wrangler d1 create image_generator
wrangler r2 bucket create image_generator
wrangler kv:namespace create USERS_KV
wrangler kv:namespace create SESSIONS_KV
```

**Save the output IDs!** You'll need them for the next step.

### Step 3: Update wrangler.toml

Add the resource IDs to `backend/wrangler.toml`:

```toml
kv_namespaces = [
  { binding = "USERS_KV", id = "YOUR_ID_HERE" },
  { binding = "SESSIONS_KV", id = "YOUR_ID_HERE" }
]

d1_databases = [
  { binding = "DB", database_name = "image_generator", database_id = "YOUR_ID_HERE" }
]

r2_buckets = [
  { binding = "IMAGE_GENERATOR", bucket_name = "image_generator" }
]
```

### Step 4: Deploy

```bash
cd backend
npm run deploy
```

Cloudflare will build and deploy your worker. You'll see output like:

```
✨ Success! Uploaded image_generator_api to Cloudflare Workers

https://image-generator-api.your-username.workers.dev/api/v1/health
```

### Step 5: Update Frontend

Add to `frontend/.env`:

```properties
VITE_API_BASE_URL=https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1
```

Replace `YOUR-USERNAME` with your Cloudflare username.

### Step 6: Test

```bash
# Test the deployed backend
curl https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1/health

# Should return:
# {"status":"ok","version":"v1","environment":"development",...}
```

## Worker URLs

After deployment, your worker is available at:

**Development URL:**
```
https://image-generator-api.YOUR-USERNAME.workers.dev
```

**API Endpoints:**
```
https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1/auth/google
https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1/images
https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1/users
https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1/health
```

## Environment Setup

### Local Development
```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8787/api/v1

# backend
npm run dev
```

### Using Deployed Worker
```bash
# frontend/.env
VITE_API_BASE_URL=https://image-generator-api.your-username.workers.dev/api/v1

# frontend
npm run dev
```

### Production
```bash
# frontend/.env.production
VITE_API_BASE_URL=https://image-generator-api.your-username.workers.dev/api/v1

# backend (deploy when ready)
npm run deploy:production
```

## Configuration Files

### wrangler.toml
```toml
name = "image_generator_api"
main = "src/index.ts"
compatibility_date = "2024-12-16"

[env.development]
vars = { ENVIRONMENT = "development", ... }

[env.staging]
vars = { ENVIRONMENT = "staging", ... }

[env.production]
vars = { ENVIRONMENT = "production", ... }
```

### Worker Environments

```bash
# Deploy to specific environment
npm run deploy                    # Development
npm run deploy:staging            # Staging
npm run deploy:production         # Production
```

Each environment uses different D1 databases and R2 buckets.

## Available Commands

```bash
# Develop locally
npm run dev

# Deploy to development (default)
npm run deploy

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# View logs in real-time
npm run tail
# or
wrangler tail

# Type check
npm run type-check

# Lint code
npm run lint

# Use deployment helper script
./deploy.sh
```

## Deployment Script

A helpful script is included to manage deployments:

```bash
chmod +x deploy.sh
./deploy.sh
```

Menu options:
1. Create Cloudflare resources
2. Deploy to development
3. Deploy to staging
4. Deploy to production
5. View logs
6. List resources
7. Exit

## Testing After Deployment

### Test Health Endpoint

```bash
curl https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1/health
```

### Test with Frontend

1. Update `frontend/.env` with your worker URL
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to http://localhost:3000
4. Click "Login with Google"
5. You should authenticate successfully

### Troubleshooting

**CORS errors?**
- Update `CORS_ORIGIN` in `backend/src/middleware/cors.ts`
- Redeploy: `npm run deploy`

**Database not found?**
- Verify database ID in `wrangler.toml`
- Run: `wrangler d1 list`

**R2 bucket not accessible?**
- Check bucket name in `wrangler.toml`
- Run: `wrangler r2 bucket list`

**Worker not found?**
- Ensure you're logged in: `wrangler login`
- Check worker name: `wrangler list`

## Custom Domain (Optional)

To use your own domain instead of `workers.dev`:

1. Go to Cloudflare Dashboard
2. Select your domain
3. Navigate to Workers & Pages → Settings
4. Set custom domain to your subdomain
5. Redeploy

Example: `api.yourdomain.com`

## Monitoring

### View Logs

```bash
wrangler tail
```

Logs appear in real-time. Press Ctrl+C to stop.

### View in Dashboard

1. https://dash.cloudflare.com/
2. Workers & Pages
3. image_generator_api
4. Tail Consumers

## Billing

**Free Plan Includes:**
- 100,000 requests/day
- 50ms CPU time per request
- Unlimited databases
- Unlimited buckets (5GB R2 storage free)

**After free tier:**
- $0.50 per 1M requests

## Security Notes

1. **Never commit secrets** - Use `wrangler secret` command
2. **Keep credentials secure** - Google OAuth secrets should only be in env
3. **Use HTTPS** - All workers URLs are HTTPS by default
4. **Rotate tokens regularly** - Update API tokens periodically

## Common Issues

### Worker won't deploy
```
Error: Could not find wrangler.toml
```
Make sure you're in the `backend` directory when deploying.

### Database ID shows as "your-database-id"
```
Error: Database not found
```
Replace placeholder with actual database ID from `wrangler d1 list`.

### CORS errors on frontend
Verify `CORS_ORIGIN` in `wrangler.toml` includes your frontend URL:
```toml
vars = { ..., CORS_ORIGIN = "http://localhost:3000,https://yourdomain.com" }
```

## Next Steps

1. ✅ Deploy worker to Cloudflare
2. ✅ Update frontend configuration
3. ✅ Test end-to-end
4. Create image generation endpoints
5. Integrate Nanobanana API
6. Set up custom domain (optional)
7. Deploy to production

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)

---

**Deployment Status:** 🟢 Ready to Deploy

Your `image_generator_api` worker is configured and ready!

Run `./deploy.sh` or `npm run deploy` to get started. 🚀
