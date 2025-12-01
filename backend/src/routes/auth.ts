/**
 * Authentication routes handler
 */

import { Env } from '../index'
import { authController } from '../handlers/authHandler'
import { notFound } from '../utils/responses'

export const authRoutes = {
  async handle(path: string, method: string, request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // POST /auth/google - Google OAuth login
    if (path === '/auth/google' && method === 'POST') {
      return authController.googleLogin(request, env)
    }

    // POST /auth/logout - Logout
    if (path === '/auth/logout' && method === 'POST') {
      return authController.logout(request, env)
    }

    // GET /auth/me - Get current user
    if (path === '/auth/me' && method === 'GET') {
      return authController.getCurrentUser(request, env)
    }

    // POST /auth/refresh - Refresh token
    if (path === '/auth/refresh' && method === 'POST') {
      return authController.refreshToken(request, env)
    }

    return notFound()
  }
}
