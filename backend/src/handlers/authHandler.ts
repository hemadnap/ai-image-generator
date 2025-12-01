/**
 * Authentication Controller
 * Handles Google OAuth login, logout, and token management
 */

import { Env } from '../index'
import { success, badRequest, unauthorized, serverError } from '../utils/responses'
import { googleService } from '../services/googleService'
import { UserRepository } from '../repositories/UserRepository'

export const authController = {
  async googleLogin(request: Request, env: Env): Promise<Response> {
    try {
      const body = await request.json() as Record<string, any>
      const { token } = body

      if (!token) {
        console.log('[AUTH] Missing token in request body')
        return badRequest('Token is required')
      }

      console.log('[AUTH] Received token, verifying with Google...')
      // Verify Google token and get user info
      const userInfo = await googleService.verifyGoogleToken(token, env)

      if (!userInfo) {
        console.log('[AUTH] Token verification failed - invalid token')
        return unauthorized('Invalid Google token')
      }
      
      console.log('[AUTH] Token verified successfully for user:', userInfo.email)

      // Find or create user in database
      let user
      try {
        user = await UserRepository.findOrCreateByGoogle(env, {
          googleId: userInfo.sub,
          email: userInfo.email,
          firstName: userInfo.name?.split(' ')[0] || '',
          lastName: userInfo.name?.split(' ').slice(1).join(' ') || '',
          language: userInfo.locale || 'en'
        })
        console.log('[AUTH] User found/created in database:', user.id, 'with roles:', user.roles)
      } catch (dbError: any) {
        console.error('[AUTH] Database error during findOrCreateByGoogle:', dbError?.message)
        console.error('[AUTH] Full error:', dbError)
        return serverError('Failed to save user to database: ' + dbError?.message)
      }

      // Generate JWT token for the user using database ID, not Google ID
      const authToken = await googleService.generateAuthToken(
        {
          sub: user.id,  // Use database UUID instead of Google ID
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        },
        env
      )

      // Store user session in KV
      await env.SESSIONS_KV.put(
        `session:${user.id}`,
        JSON.stringify({
          userId: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          roles: user.roles,
          createdAt: new Date().toISOString()
        }),
        { expirationTtl: 86400 * 7 } // 7 days
      )

      return success({
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          picture: userInfo.picture,
          roles: user.roles,
          coins: user.coins,
          language: user.language,
          authProvider: 'google'
        },
        token: authToken
      })
    } catch (error: any) {
      console.error('[AUTH] Google login error:', error)
      return serverError('Login failed: ' + error.message)
    }
  },

  async logout(request: Request, env: Env): Promise<Response> {
    try {
      // In a real app, you'd invalidate the session
      // For now, just return success
      return success({ message: 'Logged out successfully' })
    } catch (error: any) {
      return serverError(error.message)
    }
  },

  async getCurrentUser(request: Request, env: Env): Promise<Response> {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader) {
        return unauthorized('No authorization token')
      }

      const token = authHeader.replace('Bearer ', '')

      // Verify token and get user info from JWT
      const userInfo = await googleService.verifyAuthToken(token, env)

      if (!userInfo) {
        return unauthorized('Invalid token')
      }

      // Fetch full user data from database
      const user = await UserRepository.findById(env, userInfo.sub)

      if (!user) {
        return unauthorized('User not found in database')
      }

      return success({
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          roles: user.roles,
          coins: user.coins,
          language: user.language,
          authProvider: 'google'
        }
      })
    } catch (error: any) {
      console.error('[AUTH] getCurrentUser error:', error?.message)
      return serverError(error.message)
    }
  },

  async refreshToken(request: Request, env: Env): Promise<Response> {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader) {
        return unauthorized('No authorization token')
      }

      const token = authHeader.replace('Bearer ', '')
      const userInfo = await googleService.verifyAuthToken(token, env)

      if (!userInfo) {
        return unauthorized('Invalid token')
      }

      const newToken = await googleService.generateAuthToken(userInfo, env)

      return success({ token: newToken })
    } catch (error: any) {
      return serverError(error.message)
    }
  }
}
