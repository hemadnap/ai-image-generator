# Testing Checklist - User Authentication & Database Persistence

## Frontend Changes ✅
- [x] Updated `.env` to point to correct backend URL: `https://image_generator_api.tcsn.workers.dev/api/v1`
- [x] Enhanced AuthService with cookie management (7-day expiry)
- [x] Updated AuthStore with localStorage fallback
- [x] Added comprehensive logging for debugging

## Backend Changes ✅
- [x] Added automatic database initialization on first request
- [x] Enhanced UserRepository with detailed logging
- [x] Improved error handling in googleLogin
- [x] Added coins and language to response
- [x] Added debug endpoints to inspect database

## Testing Steps

### 1. Clear Browser Storage (Optional but recommended)
```
1. Open DevTools (F12)
2. Go to Application → Storage
3. Clear all localStorage
4. Clear all cookies
5. Close DevTools
```

### 2. Test the Login Flow
```
1. Navigate to http://localhost:3000/login
2. Click "Sign in with Google"
3. Select your Google account
4. Check console for [AUTH], [STORE], [REPO] logs
5. You should be redirected to /dashboard
```

### 3. Verify Token Storage
```
After successful login, in DevTools (F12):
- Go to Application → Local Storage
  - Look for: auth_token, user_data (JSON with id, email, name, roles, coins, language)
- Go to Application → Cookies
  - Look for: auth_token (7 day expiry)
```

### 4. Verify User in Database
```
Open a terminal and run:
curl https://image_generator_api.tcsn.workers.dev/debug/users | jq .

You should see your user in the list with:
- email (your Google email)
- first_name and last_name (from Google profile)
- roles: ["USER"]
```

### 5. Verify GET /auth/me Works
```
In DevTools → Network tab:
1. Go to any page (Dashboard, Profile, etc.)
2. Look for request to: /api/v1/auth/me
3. Should return 200 with your user data including:
   - id, email, name, roles, coins, language
```

### 6. Test Page Refresh
```
1. After login, refresh the page (Ctrl+R or Cmd+R)
2. You should remain logged in
3. Check console - should show:
   - [STORE] User initialized from server
   OR
   - [STORE] User initialized from localStorage (fallback)
```

## Debug Endpoints (Backend)

### Check Users in Database
```
GET https://image_generator_api.tcsn.workers.dev/debug/users
Returns: { success: true, users: [...] }
```

### Test Database Insert
```
POST https://image_generator_api.tcsn.workers.dev/debug/test-insert
Returns: { success: true, result: {...} }
```

## If Something Goes Wrong

### 401 Errors on /auth/me
- Check if token is stored in localStorage or cookies
- Verify .env has correct API_BASE_URL
- Check browser console for [AUTH] error messages

### User Not Saved to Database
- Check Cloudflare Worker logs for [REPO] and [AUTH] messages
- Verify database is initialized by calling /debug/users endpoint
- Check if there's a database error in googleLogin response

### Token Not Being Sent
- Verify axiosInstance.js interceptor is adding Authorization header
- Check if token is in localStorage/cookies
- Make sure .env has been updated and page is refreshed

## Environment Variables
.env file should contain:
```
VITE_API_BASE_URL=https://image_generator_api.tcsn.workers.dev/api/v1
VITE_GOOGLE_CLIENT_ID=66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com
VITE_GOOGLE_SECRET=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
VITE_APP_TITLE=Image Generator
```
