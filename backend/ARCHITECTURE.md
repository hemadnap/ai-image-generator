# Backend Architecture Guide

## Overview

This backend is built as a serverless API using Cloudflare Workers, designed for high performance, global distribution, and low latency.

## Architecture Layers

### 1. Entry Point (`index.ts`)

- Initializes the Worker
- Sets up middleware pipeline
- Handles CORS and errors
- Routes requests to appropriate handlers

### 2. Router (`router/router.ts`)

- Maps incoming requests to route handlers
- Handles URL parsing and method matching
- Manages API versioning

### 3. Routes (`routes/`)

- Defines available endpoints
- Groups related endpoints by domain:
  - `auth.ts` - Authentication endpoints
  - `users.ts` - User management
  - `data.ts` - Analytics and dashboard data

### 4. Handlers (`handlers/`)

- Business logic implementation
- Data transformation
- Response formatting
- Error handling per endpoint

### 5. Services (`services/`)

- External API integration
- Complex operations:
  - `googleService.ts` - Google OAuth verification and token generation

### 6. Middleware (`middleware/`)

- Cross-cutting concerns:
  - CORS handling
  - Error handling
  - Request logging

### 7. Utilities (`utils/`)

- Helper functions:
  - Response builders
  - Authentication helpers
  - JWT utilities

### 8. Types (`types/`)

- TypeScript interface definitions
- Type safety across codebase

## Data Flow

```
Request
   ↓
CORS Middleware → Logging Middleware
   ↓
Router (path + method matching)
   ↓
Route Handler (route-specific logic)
   ↓
Handler Function (business logic)
   ↓
Service Layer (external integrations)
   ↓
Database/KV Operations
   ↓
Response Builder
   ↓
Response
```

## Authentication Flow

### Google OAuth

```
Frontend sends Google token
         ↓
Auth Handler
         ↓
Google Service verifies token
         ↓
Retrieve Google user info
         ↓
Generate JWT auth token
         ↓
Store session in KV
         ↓
Return user + token to frontend
```

### Protected Routes

```
Request with Bearer token
         ↓
Extract token from Authorization header
         ↓
Verify token signature
         ↓
Check token expiration
         ↓
Extract user info from token
         ↓
Proceed to handler
```

## Storage

### KV Namespaces

- **USERS_KV**: User profile data
  - Keys: `user:{userId}`
  - Persistent storage

- **SESSIONS_KV**: Session tokens and metadata
  - Keys: `session:{userId}`
  - 7-day TTL (auto-expiry)

### D1 Database (Optional)

For structured queries and analytics:

- User activity logs
- Audit trails
- Analytics data
- Relationships between data

## Error Handling

Standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": {
      /* optional context */
    }
  }
}
```

Error codes:

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Performance Considerations

1. **Caching**: Use KV for frequently accessed data
2. **Streaming**: Return large responses as streams
3. **Batching**: Combine multiple KV operations
4. **Async/Await**: Non-blocking operations
5. **Global Distribution**: Cloudflare's edge network

## Security

1. **JWT Validation**: All protected endpoints verify tokens
2. **CORS**: Restricted to known origins
3. **Input Validation**: All inputs sanitized
4. **Rate Limiting**: Can be implemented via Cloudflare rules
5. **HTTPS Only**: All requests encrypted in transit

## Scaling

- **Horizontal**: Automatic via Cloudflare's global network
- **KV Storage**: No size limits, geo-distributed
- **Database**: D1 provides SQL capabilities
- **Rate Limiting**: Built-in Cloudflare features

## Monitoring

Enable via `npm run tail` to view:

- Incoming requests
- Handler execution
- Error logs
- Performance metrics

## Testing

```bash
# Local development
npm run dev

# Test endpoints
curl http://localhost:3000/api/v1/health

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment Strategy

1. **Development**: `wrangler dev`
2. **Staging**: `npm run deploy:staging`
3. **Production**: `npm run deploy`

Use environment variables to manage configuration across stages.
