# JWT Token ID Mismatch Fix

## Problem
After successful login (HTTP 200), when the frontend tried to verify the token by calling `GET /auth/me`, it received a 401 Unauthorized error.

## Root Cause
**ID Mismatch in JWT Token**

The JWT token was being created with the wrong user identifier:

- **JWT payload** stored: `"sub": "110340299028553669361"` (Google User ID)
- **Database stores**: `id: "3abe46af-2c5f-4d62-b86a-4b8c794e4e21"` (UUID)
- **When verifying**: Backend tried to look up user by JWT sub field → Looked for Google ID in database → Not found → 401

### Why This Happened

In `authHandler.ts` `googleLogin()`:
1. ✓ Google OAuth verified
2. ✓ User saved to database with UUID `id`
3. ✗ But JWT token was created using `userInfo` which contains Google ID as `sub`
4. ✗ When verifying token, we look up user by `sub` (Google ID)
5. ✗ Database user lookup fails because we stored the UUID, not Google ID

## Solution

**Use Database User ID in JWT Token**

**File**: `backend/src/handlers/authHandler.ts`

Changed the JWT token generation to use the database user's UUID instead of Google ID:

```typescript
// BEFORE (Wrong)
const authToken = await googleService.generateAuthToken(userInfo, env)
// userInfo.sub = Google ID = "110340299028553669361"

// AFTER (Fixed)
const authToken = await googleService.generateAuthToken(
  {
    sub: user.id,  // Database UUID = "3abe46af-2c5f-4d62-b86a-4b8c794e4e21"
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture
  },
  env
)
```

### Why This Works

Now the flow is:
1. User logs in with Google
2. Backend saves user to database with UUID
3. **JWT token created with database UUID** ✓
4. User sends token in Authorization header
5. Backend verifies token → extracts database UUID from `sub` ✓
6. Backend looks up user by database UUID ✓
7. User found → Returns 200 with user data ✓

## Authentication Flow (Fixed)

```
Login Request:
1. Frontend sends Google ID token to POST /auth/google
2. Backend verifies Google token with Google's servers
3. Backend looks up/creates user in database → Gets database UUID
4. JWT token generated with database UUID ✓
5. Frontend stores JWT and user data
6. Frontend redirects to dashboard

Verify Token Request:
1. Frontend makes GET /auth/me with JWT in Authorization header
2. Backend verifies JWT signature ✓
3. Backend extracts database UUID from JWT 'sub' field ✓
4. Backend looks up user by UUID in database ✓
5. User found → Returns 200 with user data ✓
```

## Testing

### Test: Login and Verify
1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Select Google account
4. **Expected**: 
   - POST `/auth/google` returns 200 ✓
   - GET `/auth/me` returns 200 (not 401) ✓
   - Redirected to dashboard ✓

### Test: Page Refresh After Login
1. After successful login
2. Refresh page (Ctrl+R)
3. **Expected**: Session persists, stay on dashboard ✓

### Test: Check Database
```bash
curl https://image_generator_api.tcsn.workers.dev/debug/users | jq .
```
Should show user with:
- UUID id: `"3abe46af-2c5f-4d62-b86a-4b8c794e4e21"`
- email: `"tomas@tcsn.io"`
- roles: `["USER"]`

## Files Modified

1. ✅ `backend/src/handlers/authHandler.ts` - Use database user ID in JWT

## Deployment

- **Backend Version**: `e286aa2c-8886-47fb-870c-5d79bada8860`
- **URL**: `https://image_generator_api.tcsn.workers.dev`
- **Change**: JWT token now uses database UUID instead of Google ID

## Key Takeaway

**Always use your application's primary key (database UUID) in JWT tokens, not external provider IDs.**

This ensures:
- ✓ Tokens are tied to your database records
- ✓ Token verification can find the user
- ✓ User can be looked up consistently
- ✓ No mismatch between token data and database data

## What's Now Working

✅ Login with Google
✅ JWT token generation with correct user ID
✅ Token verification (`GET /auth/me`) returns 200
✅ User data returned after login
✅ Session persists on page refresh
✅ Smooth authentication flow
