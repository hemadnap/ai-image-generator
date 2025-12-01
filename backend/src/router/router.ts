/**
 * Router - Maps requests to handlers based on path and method
 */

import { Env } from '../index'
import { authRoutes } from '../routes/auth'
import { userRoutes } from '../routes/users'
import { dataRoutes } from '../routes/data'
import { imageGenerationRoutes } from '../routes/images'
import { notFound } from '../utils/responses'

export class Router {
  async handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // API version prefix
    const versionPrefix = `/api/${env.API_VERSION}`

    // Remove version prefix from path for routing
    let routePath = path
    if (path.startsWith(versionPrefix)) {
      routePath = path.substring(versionPrefix.length) || '/'
    }

    // Route to appropriate handler
    if (routePath.startsWith('/auth')) {
      return authRoutes.handle(routePath, method, request, env, ctx)
    }

    if (routePath.startsWith('/users')) {
      return userRoutes.handle(routePath, method, request, env, ctx)
    }

    if (routePath.startsWith('/data')) {
      return dataRoutes.handle(routePath, method, request, env, ctx)
    }

    if (routePath.startsWith('/images') || routePath.startsWith('/prompts')) {
      return imageGenerationRoutes.handle(routePath, method, request, env, ctx)
    }

    if (routePath === '/' || routePath === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          version: env.API_VERSION,
          environment: env.ENVIRONMENT,
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Debug endpoint to check users in database
    if (routePath === '/debug/users' && method === 'GET') {
      try {
        const result = await env.DB.prepare('SELECT id, email, first_name, last_name, roles FROM users LIMIT 10').all()
        return new Response(
          JSON.stringify({
            success: true,
            users: result.results || []
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      } catch (error: any) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Debug endpoint to check config
    if (routePath === '/debug/config' || path === '/debug/config') {
      return new Response(
        JSON.stringify({
          apiVersion: env.API_VERSION,
          versionPrefix: `/api/${env.API_VERSION}`,
          incomingPath: path,
          parsedRoutePath: routePath,
          pathStartsWithPrefix: path.startsWith(`/api/${env.API_VERSION}`)
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Debug endpoint to test inserting a user
    if (routePath === '/debug/test-insert' && method === 'POST') {
      try {
        const now = new Date().toISOString()
        const result = await env.DB.prepare(`
          INSERT INTO users (
            id, email, google_id, first_name, last_name, 
            roles, language, coins, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
          .bind(
            'test-user-id-123',
            'test@example.com',
            'google-test-123',
            'Test',
            'User',
            '["USER"]',
            'en',
            0,
            now,
            now
          )
          .run()
        
        return new Response(
          JSON.stringify({
            success: true,
            result: result
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      } catch (error: any) {
        console.error('[DEBUG] Insert error:', error)
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message,
            errorCause: error.cause?.message
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    return notFound('Route not found')
  }
}
