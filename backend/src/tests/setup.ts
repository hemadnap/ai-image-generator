import { beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock external API handlers (NanoBanana)
const handlers = [
  // Mock NanoBanana image generation API
  http.post('https://api.nanobanana.com/generate', () => {
    return HttpResponse.json({
      jobId: 'job-mock-12345',
      status: 'completed',
      images: [
        {
          url: 'https://example.com/mock-image.png',
          seed: 12345,
        },
      ],
    })
  }),

  // Mock image status check
  http.get('https://api.nanobanana.com/job/:jobId', () => {
    return HttpResponse.json({
      jobId: 'job-mock-12345',
      status: 'completed',
      progress: 100,
      images: [
        {
          url: 'https://example.com/mock-image.png',
        },
      ],
    })
  }),
]

export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen())

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Stop server after all tests
afterAll(() => server.close())
