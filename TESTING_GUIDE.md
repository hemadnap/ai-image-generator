# Frontend & Backend Testing Guide

## Overview

This document outlines the unit tests and E2E tests for the OPNNG.IO application. **All external API calls are mocked** - no real calls to NanoBanana, Google, or other paid services are made during testing.

## Test Architecture

### Mocking Strategy

All external APIs are mocked using **Mock Service Worker (MSW)**:

- ✅ **NanoBanana API** - Image generation is completely mocked
- ✅ **Google OAuth** - Auth flows are mocked
- ✅ **Cloudflare D1** - Database queries are mocked
- ✅ **R2 Storage** - File operations are mocked

**Result: Tests cost $0 to run**

---

## Frontend Tests

### Setup & Installation

```bash
cd frontend
npm install
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run with coverage report
npm run test:ui       # Run with UI dashboard
```

### Test Files Structure

```
frontend/src/tests/
├── setup.js                 # MSW mock server setup
├── authStore.test.js        # Authentication store tests
├── dataStore.test.js        # Dashboard data tests
├── userStore.test.js        # User profile tests
├── utils.test.js            # Utility function tests
└── e2e.test.js              # End-to-end user flows
```

### Frontend Unit Tests

#### 1. **Auth Store Tests** (`authStore.test.js`)

Tests Pinia auth state management:

```javascript
✓ Initializes with no user
✓ Sets user on login
✓ Clears user on logout
✓ Initializes auth from stored token
✓ Handles auth initialization without token
✓ Sets error on failed login
✓ Clears error when requested
```

**What It Tests:**
- User login/logout flows
- Token persistence in localStorage
- Auth state management
- Error handling

**Mocked APIs:**
- `POST /api/v1/auth/login` - Returns mock JWT
- `GET /api/v1/auth/me` - Returns mock user data
- `POST /api/v1/auth/logout` - Returns success

#### 2. **Data Store Tests** (`dataStore.test.js`)

Tests dashboard data management:

```javascript
✓ Initializes with empty data
✓ Fetches dashboard data
✓ Fetches analytics data
✓ Sets error on fetch failure
✓ Clears error
✓ Loads data correctly
```

**Mocked APIs:**
- `GET /api/v1/dashboard/stats` - Returns mock statistics

#### 3. **User Store Tests** (`userStore.test.js`)

Tests user profile management:

```javascript
✓ Initializes with empty users
✓ Fetches user by ID
✓ Updates user profile
✓ Fetches all users
✓ Clears error
✓ Handles loading state
```

**Mocked APIs:**
- `GET /api/v1/users/:id` - Returns mock user
- `PUT /api/v1/users/:id` - Returns updated user

#### 4. **Utils Tests** (`utils.test.js`)

Tests utility functions:

```javascript
✓ Validates emails
✓ Truncates strings correctly
✓ Formats currency
✓ Formats dates
✓ Validates date objects
✓ Adds days to dates
✓ Formats date ranges
```

### Frontend E2E Tests (`e2e.test.js`)

Complete user journey tests:

#### Authentication Flow
```javascript
✓ Complete login flow
✓ Complete logout flow
✓ Session persistence on page reload
```

#### Dashboard Flow
```javascript
✓ Complete dashboard data loading
✓ Complete dashboard and analytics loading
```

#### Image Generation Flow (Mocked)
```javascript
✓ Complete image generation request (no API call to NanoBanana)
✓ Fetch generated image (mocked result)
```

#### Error Handling
```javascript
✓ Handles authentication error gracefully
✓ Recovers from failed data fetch
```

---

## Backend Tests

### Setup & Installation

```bash
cd backend
npm install
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run with coverage report
```

### Test Files Structure

```
backend/src/tests/
├── setup.ts             # MSW mock server setup
├── authHandler.test.ts  # Auth endpoint tests
├── imageHandler.test.ts # Image generation tests
├── database.test.ts     # Database utility tests
└── e2e.test.ts          # Backend E2E workflows
```

### Backend Unit Tests

#### 1. **Auth Handler Tests** (`authHandler.test.ts`)

Tests authentication endpoints:

```javascript
✓ Returns token for valid Google JWT
✓ Rejects request without token
✓ Returns current user for valid token
✓ Has proper user structure
✓ Clears session token on logout
✓ Returns success response
✓ Validates JWT structure
✓ Rejects malformed JWT
```

**Key Test Cases:**
- JWT validation and extraction
- User creation/retrieval
- Token generation
- Session management

#### 2. **Image Generation Handler Tests** (`imageHandler.test.ts`)

Tests image generation endpoints (all mocked):

```javascript
✓ Validates prompt parameter
✓ Validates size parameter
✓ Rejects invalid size
✓ Returns job ID for valid request
✓ Includes cost calculation
✓ Does NOT make real API call ← Important!
✓ Retrieves job status
✓ Returns completed image
✓ Handles processing status
✓ Handles failed generation
✓ Retrieves user images with pagination
✓ Supports pagination
✓ Returns empty list when no images
```

**Cost Calculation Tests:**
```javascript
✓ 512x512 = 5 coins
✓ 768x768 = 7.5 coins
✓ 1024x1024 = 10 coins
```

#### 3. **Database Tests** (`database.test.ts`)

Tests database operations (all mocked):

```javascript
✓ Builds valid user insert query
✓ Validates email format
✓ Rejects invalid email
✓ Builds valid user update query
✓ Builds valid image insert query
✓ Builds pagination query
✓ Calculates pagination correctly
✓ Prepares transaction for image generation
✓ Verifies sufficient balance
✓ Rejects insufficient balance
✓ Handles duplicate user error
✓ Handles not found error
✓ Handles database connection error
```

### Backend E2E Tests (`e2e.test.ts`)

Complete server workflows:

#### User Registration Flow
```javascript
✓ Complete user registration
✓ Handle returning user
```

#### Image Generation Workflow (Mocked)
```javascript
✓ Complete image generation flow (mocked)
✓ Handle image generation completion (mocked)
✓ Handle generation errors gracefully
✓ Do NOT make real NanoBanana API calls ← Important!
```

#### Dashboard Statistics
```javascript
✓ Calculate user statistics
✓ Handle empty statistics
```

#### Error Scenarios
```javascript
✓ Handle unauthorized access (401)
✓ Handle forbidden access (403)
✓ Handle insufficient balance
✓ Handle rate limiting
```

#### Data Consistency
```javascript
✓ Maintain transaction atomicity
✓ Prevent double spending
```

---

## Running Tests

### Run All Tests

```bash
# Frontend
cd frontend
npm run test:run

# Backend
cd backend
npm run test:run
```

### Run Specific Test File

```bash
# Frontend
npm run test authStore

# Backend
npm run test authHandler
```

### Run with Coverage

```bash
npm run test:coverage
```

### Watch Mode (Development)

```bash
npm run test
```

### UI Dashboard

```bash
npm run test:ui
```

---

## Test Coverage Goals

### Frontend
- **Stores**: 85%+ coverage (auth, data, user stores)
- **Utils**: 90%+ coverage (string, date utilities)
- **Components**: 70%+ coverage (basic rendering tests)
- **E2E**: All critical user flows covered

### Backend
- **Handlers**: 85%+ coverage (auth, images, users)
- **Utils**: 90%+ coverage (validation, formatting)
- **Database**: 80%+ coverage (query builders, transactions)
- **E2E**: All critical workflows covered

---

## Important Notes

### ✅ What Tests Cover

- ✅ All user authentication flows
- ✅ All state management operations
- ✅ All API request/response handling
- ✅ Error handling and recovery
- ✅ Data validation and formatting
- ✅ Cost calculations
- ✅ Balance verification
- ✅ Pagination
- ✅ Transaction atomicity

### ❌ What Tests Don't Do (Intentionally)

- ❌ Make real API calls to NanoBanana (MOCKED)
- ❌ Make real calls to Google OAuth (MOCKED)
- ❌ Write to real D1 database (MOCKED)
- ❌ Store files in R2 (MOCKED)
- ❌ Generate actual images (MOCKED)

**Why?** To save costs and ensure tests run instantly ($0 cost)

---

## Continuous Integration

### Recommended CI/CD Setup

```yaml
# GitHub Actions example
on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install && npm run test:run

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install && npm run test:run
```

---

## Debugging Tests

### View Detailed Output

```bash
npm run test:run -- --reporter=verbose
```

### Run Single Test

```bash
npm run test:run -- -t "should complete login flow"
```

### Debug Mode

```bash
node --inspect-brk ./node_modules/.bin/vitest run
```

---

## Test Data & Fixtures

### Mock Response Examples

#### Mock User
```javascript
{
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  coins: 100,
  roles: ['user'],
  language: 'en',
  authProvider: 'google'
}
```

#### Mock Image Job
```javascript
{
  jobId: 'job-12345',
  userId: 'user-123',
  prompt: 'beautiful landscape',
  status: 'processing',
  cost: 5,
  createdAt: '2025-12-01T10:00:00Z'
}
```

#### Mock Dashboard Stats
```javascript
{
  totalImages: 42,
  coinsUsed: 210,
  coinsRemaining: 290,
  averageGenerationTime: 2.5,
  lastGeneratedAt: '2025-12-01T10:00:00Z'
}
```

---

## Troubleshooting

### Tests Timeout

```bash
# Increase timeout
npm run test:run -- --testTimeout=10000
```

### Memory Issues

```bash
# Run with increased memory
node --max-old-space-size=4096 ./node_modules/.bin/vitest run
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. **Run All Tests**: `npm run test:run` in both frontend and backend
2. **Check Coverage**: `npm run test:coverage`
3. **Fix Any Failures**: Check test output and fix issues
4. **Add More Tests**: As new features are added
5. **Set Up CI/CD**: Add tests to GitHub Actions

---

## Resources

- **Vitest**: https://vitest.dev
- **MSW (Mocking)**: https://mswjs.io
- **Vue Test Utils**: https://test-utils.vuejs.org
- **Pinia Testing**: https://pinia.vuejs.org/cookbook/testing.html

---

**Total Test Cost: $0** 🎉

All external APIs are mocked - no actual charges incurred during testing.
