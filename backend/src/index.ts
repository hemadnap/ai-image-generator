/**
 * Main Entry Point for Cloudflare Workers API
 * Routes all requests to appropriate handlers
 */

import { Router } from './router/router'
import { corsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { DatabaseInit } from './database/init'

export interface Env {
  USERS_KV: KVNamespace
  SESSIONS_KV: KVNamespace
  DB: D1Database
  IMAGE_GENERATOR: R2Bucket
  IMAGE_GENERATOR_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string
  API_VERSION: string
  ENVIRONMENT: string
  NANO_BANANA_TOKEN: string
}

const router = new Router()

// Database initialization flag (per-deployment)
let dbInitialized = false

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Initialize database on first request
      if (!dbInitialized) {
        console.log('[STARTUP] Initializing database...')
        await DatabaseInit.initialize(env)
        dbInitialized = true
        console.log('[STARTUP] Database initialization complete')
      }

      // Debug: Log environment variables on first request
      if (request.url.includes('/api/v1/auth/google')) {
        console.log('[CONFIG] GOOGLE_CLIENT_ID:', env.GOOGLE_CLIENT_ID ? '✓ SET' : '✗ MISSING')
        console.log('[CONFIG] GOOGLE_CLIENT_SECRET:', env.GOOGLE_CLIENT_SECRET ? '✓ SET' : '✗ MISSING')
        console.log('[CONFIG] JWT_SECRET:', env.JWT_SECRET ? '✓ SET' : '✗ MISSING')
      }

      // Apply middleware
      const corsResponse = corsMiddleware(request, env)
      if (corsResponse) return corsResponse

      // Log request
      requestLogger(request)

      // Route the request
      let response = await router.handle(request, env, ctx)

      // Apply CORS headers to all responses
      const headers = new Headers(response.headers)
      headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      headers.set('Access-Control-Allow-Credentials', 'true')

      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      })

      return response
    } catch (error) {
      return errorHandler(error, env)
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Handle scheduled tasks if needed
    console.log('Scheduled event:', event.cron)
  }
}
