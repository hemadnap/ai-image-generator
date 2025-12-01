# Backend Development Quick Start

## 🚀 First Time Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
GOOGLE_CLIENT_ID=66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 3. Start Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

### 4. Test API

```bash
# Check health endpoint
curl http://localhost:3000/api/v1/health
```

## 📝 Project Structure

```
backend/
├── src/
│   ├── handlers/     # Request handlers for each endpoint
│   ├── routes/       # Route definitions
│   ├── services/     # Business logic (Google OAuth, etc.)
│   ├── middleware/   # CORS, error handling, logging
│   ├── utils/        # Helper functions
│   ├── types/        # TypeScript interfaces
│   └── index.ts      # Main entry point
├── wrangler.toml     # Cloudflare Worker config
├── package.json      # Dependencies
└── README.md         # Full documentation
```

## 🔗 API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication

- `POST /auth/google` - Login with Google token
- `GET /auth/me` - Get current user (requires token)
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token

### Users

- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user (requires token)

### Data

- `GET /data/dashboard` - Get dashboard statistics
- `GET /data/analytics` - Get analytics data

## 🧪 Testing

### Using cURL

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Get dashboard data
curl http://localhost:3000/api/v1/data/dashboard

# Get analytics
curl http://localhost:3000/api/v1/data/analytics
```

### With Authorization

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/auth/me
```

## 📦 NPM Scripts

- `npm run dev` - Start development server
- `npm run deploy` - Deploy to Cloudflare (production)
- `npm run deploy:staging` - Deploy to staging
- `npm run deploy:production` - Deploy to production
- `npm run type-check` - Check TypeScript types
- `npm run lint` - Run ESLint
- `npm run tail` - View live logs

## 🔐 Environment Variables

| Variable               | Description            | Example                 |
| ---------------------- | ---------------------- | ----------------------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID | `66286687898-...`       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret    | `GOCSPX-...`            |
| `JWT_SECRET`           | Secret for JWT signing | `your-super-secret`     |
| `CORS_ORIGIN`          | Allowed origins        | `http://localhost:3000` |
| `ENVIRONMENT`          | Environment mode       | `development`           |

## 🐛 Common Issues

### Port 3000 Already in Use

```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use different port
wrangler dev --port 8788
```

### CORS Errors

- Add your frontend URL to `CORS_ORIGIN` in `.env`
- Redeploy with `npm run dev`

### Google OAuth Issues

- Verify `GOOGLE_CLIENT_ID` matches your Google Cloud project
- Check authorized redirect URIs in Google Cloud Console

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Next Steps

1. **Connect Frontend**: Update frontend `.env` with backend URL
2. **Deploy to Staging**: Follow `DEPLOYMENT.md`
3. **Set Up Monitoring**: Enable logs in Cloudflare dashboard
4. **Add Database**: Configure D1 for persistent data storage
5. **Implement Validation**: Add input validation to handlers

## 📚 Documentation

- **Architecture**: See `ARCHITECTURE.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Full API Docs**: See `README.md`

## 🆘 Need Help?

1. Check the main `README.md` for detailed API documentation
2. Review `ARCHITECTURE.md` for system design
3. Read `DEPLOYMENT.md` for deployment instructions
4. View Cloudflare Workers docs: https://developers.cloudflare.com/workers/
