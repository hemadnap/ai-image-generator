# Session Persistence Fix - Page Refresh

## Problem
After successful login, when refreshing the page, the user had to log in again. Session was not persisting.

## Root Cause
The `initializeAuth()` function was too aggressive:
- It would try to verify the token with the server
- If ANY error occurred (network issue, server down, timeout, etc.), it would clear the localStorage
- This prevented the offline fallback from working
- Users with valid tokens couldn't stay logged in if the server was temporarily unreachable

## Solution

### 3 Key Changes

#### 1. **authStore.js - Smart Error Handling**
**File**: `frontend/src/stores/authStore.js`

Changed `initializeAuth()` to:
- Distinguish between 401 (invalid token) and other errors
- **On 401 error**: Clear auth (token is actually invalid)
- **On other errors**: Use localStorage fallback (server might be down)
- **On success**: Use fresh server data

```javascript
if (is401) {
  // Token is invalid - clear everything
  localStorage.removeItem('auth_token')
} else {
  // Server error - use localStorage fallback
  const storedData = AuthService.getStoredUserData()
  if (storedData) {
    user.value = new User(...)  // Restore from cache
  }
}
```

#### 2. **axiosInstance.js - Smart 401 Handling**
**File**: `frontend/src/api/axiosInstance.js`

Updated axios interceptor to:
- Check if request has `skipRedirect` flag (set during initialization)
- **During init**: Don't redirect on 401, let `initializeAuth` handle it with fallback
- **During normal use**: Redirect to login on 401 (actual logout)

```javascript
const isInitRequest = error.config?.skipRedirect
if (!isInitRequest && window.location.pathname !== '/login') {
  // Only redirect during normal app usage, not during init
  window.location.href = '/login'
}
```

#### 3. **endpoints.js - Mark Init Requests**
**File**: `frontend/src/api/endpoints.js`

Updated `getCurrentUser()` to mark requests as init requests:
```javascript
getCurrentUser() {
  return apiClient.get('/auth/me', { skipRedirect: true })
}
```

#### 4. **authService.js - Throw Errors**
**File**: `frontend/src/services/authService.js`

Changed `getCurrentUser()` to throw errors instead of catching them:
- This allows `initializeAuth` to see the error and handle it appropriately
- Original behavior of swallowing errors prevented fallback logic

## How It Works Now

### Page Refresh Scenario
1. App loads
2. `initializeAuth()` runs
3. Checks if token exists in localStorage ✓
4. Makes request to `/auth/me` with `skipRedirect: true`
5. **If successful**: Use fresh server data ✓
6. **If 401**: Token is invalid, clear auth ✗ → Redirect to login
7. **If other error** (network, timeout, etc.): Use localStorage fallback ✓
8. User stays logged in (session restored)

### Normal Usage Scenario
1. User is logged in and making API calls
2. Token expires or becomes invalid
3. API call gets 401 response
4. `skipRedirect` is NOT set (normal request)
5. Axios redirects to `/login` with `window.location.href`
6. Full page reload → Fresh auth check
7. User logged out

### Logout Scenario
1. User clicks logout
2. Clear localStorage, cookies, and state
3. Navigate to home page
4. If user tries to access protected route
5. Router sees no user in state
6. Redirect to login page

## Testing

### Test 1: Page Refresh After Login ✓
1. Login with Google
2. You should see user in localStorage (`auth_token` and `user_data`)
3. Refresh page (Ctrl+R or Cmd+R)
4. **Expected**: Automatically logged in, NO redirect to login ✓

### Test 2: Server Down Scenario ✓
1. Login successfully
2. Stop backend (or disconnect network)
3. Refresh page
4. **Expected**: Restore user from localStorage, see dashboard ✓

### Test 3: Invalid Token ✓
1. Manually edit localStorage: `localStorage.setItem('auth_token', 'invalid')`
2. Refresh page
3. Server returns 401
4. **Expected**: Clear auth, redirect to login ✓

### Test 4: After Logout ✓
1. Login and verify you're logged in
2. Logout
3. Try to refresh
4. **Expected**: Redirect to login ✓

## Files Modified

1. ✅ `frontend/src/stores/authStore.js` - Smart error handling with fallback
2. ✅ `frontend/src/api/axiosInstance.js` - Conditional 401 redirect
3. ✅ `frontend/src/api/endpoints.js` - Mark init requests
4. ✅ `frontend/src/services/authService.js` - Throw errors for caller to handle

## Architecture

```
Page Refresh Flow:
┌─────────────────────┐
│  App Mounts         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ initializeAuth()    │
└──────────┬──────────┘
           │
           ├─ Check localStorage for token
           │
           ├─ If token exists:
           │  └─ GET /auth/me (skipRedirect: true)
           │     │
           │     ├─ 200 OK → Use server data ✓
           │     │
           │     ├─ 401 → Clear auth ✗
           │     │
           │     └─ Other error → Use localStorage fallback ✓
           │
           └─ User state restored
              (Either from server or localStorage)
```

## Benefits

✅ **Session persists across page refreshes**
✅ **Offline capability** - Falls back to localStorage if server down
✅ **Proper 401 handling** - Clears invalid tokens without retry loops
✅ **No infinite redirect loops** - Smart differentiation of error types
✅ **Smooth user experience** - No unexpected logouts during server issues

## Edge Cases Handled

| Scenario | Before | After |
|----------|--------|-------|
| Valid token, refresh page | ✗ Log in again | ✓ Stay logged in |
| Expired token, refresh page | ✗ Keep trying | ✓ Clear and redirect |
| Server down, valid token | ✗ Clear auth | ✓ Use fallback, stay logged in |
| Network timeout | ✗ Clear auth | ✓ Use fallback |
| User on API call gets 401 | ✗ No redirect | ✓ Redirect to login |
