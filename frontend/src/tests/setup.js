import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Helper to create proper MSW responses that work with axios
const createJsonResponse = (data, status = 200) => {
  return HttpResponse.json(data, { status })
}

// Mock server handlers
const handlers = [
  // Auth endpoints
  http.post('https://image_generator_api.tcsn.workers.dev/api/v1/auth/login', () => {
    return createJsonResponse({
      token: 'mock-jwt-token-12345',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['user'],
        coins: 100,
      },
    })
  }),

  http.get('https://image_generator_api.tcsn.workers.dev/api/v1/auth/me', () => {
    return createJsonResponse({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      roles: ['user'],
      coins: 100,
      language: 'en',
      authProvider: 'google',
      createdAt: new Date().toISOString(),
    })
  }),

  http.post('https://image_generator_api.tcsn.workers.dev/api/v1/auth/logout', () => {
    return createJsonResponse({ success: true })
  }),

  // User endpoints
  http.get('https://image_generator_api.tcsn.workers.dev/api/v1/users/:id', () => {
    return createJsonResponse({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      coins: 100,
    })
  }),

  http.get('https://image_generator_api.tcsn.workers.dev/api/v1/users', () => {
    return createJsonResponse([
      {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        coins: 100,
      },
    ])
  }),

  http.put('https://image_generator_api.tcsn.workers.dev/api/v1/users/:id', () => {
    return createJsonResponse({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User Updated',
      coins: 100,
    })
  }),

  // Image generation endpoints (MOCKED - no real API calls)
  http.post('https://image_generator_api.tcsn.workers.dev/api/v1/images/generate', () => {
    return createJsonResponse({
      jobId: 'job-123',
      prompt: 'test prompt',
      status: 'processing',
      cost: 5,
      createdAt: new Date().toISOString(),
    })
  }),

  http.get('https://image_generator_api.tcsn.workers.dev/api/v1/images/:jobId', () => {
    return createJsonResponse({
      jobId: 'job-123',
      prompt: 'test prompt',
      status: 'completed',
      imageUrl: 'https://example.com/image.png',
      cost: 5,
      createdAt: new Date().toISOString(),
    })
  }),

  http.get('https://image_generator_api.tcsn.workers.dev/api/v1/images', () => {
    return createJsonResponse({
      images: [
        {
          jobId: 'job-1',
          prompt: 'beautiful landscape',
          imageUrl: 'https://example.com/image1.png',
          cost: 5,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    })
  }),

  // Dashboard endpoints
  http.get('https://image_generator_api.tcsn.workers.dev/api/v1/data/dashboard', () => {
    return createJsonResponse({
      totalImages: 42,
      coinsUsed: 210,
      coinsRemaining: 290,
      averageGenerationTime: 2.5,
      lastGeneratedAt: new Date().toISOString(),
    })
  }),

  http.get('https://image_generator_api.tcsn.workers.dev/api/v1/dashboard/stats', () => {
    return createJsonResponse({
      totalImages: 42,
      coinsUsed: 210,
      coinsRemaining: 290,
      averageGenerationTime: 2.5,
      lastGeneratedAt: new Date().toISOString(),
    })
  }),
]

export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  // Mock localStorage
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
})

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Stop server after all tests
afterAll(() => server.close())
