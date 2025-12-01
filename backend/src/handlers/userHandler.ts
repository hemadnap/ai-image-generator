/**
 * User Controller
 * Handles user data operations
 */

import { Env } from '../index'
import { success, badRequest, notFound, serverError } from '../utils/responses'

export const userController = {
  async getUserById(userId: string, env: Env): Promise<Response> {
    try {
      // Fetch user from KV
      const userData = await env.USERS_KV.get(`user:${userId}`)

      if (!userData) {
        return notFound('User not found')
      }

      return success(JSON.parse(userData))
    } catch (error: any) {
      return serverError(error.message)
    }
  },

  async updateUser(userId: string, request: Request, env: Env): Promise<Response> {
    try {
      const body = await request.json() as Record<string, any>

      // Get current user data
      const userData = await env.USERS_KV.get(`user:${userId}`)

      if (!userData) {
        return notFound('User not found')
      }

      const currentUser = JSON.parse(userData)
      const updatedUser = { ...currentUser, ...body, id: userId }

      // Update in KV
      await env.USERS_KV.put(`user:${userId}`, JSON.stringify(updatedUser))

      return success(updatedUser)
    } catch (error: any) {
      return serverError(error.message)
    }
  },

  async getAllUsers(request: Request, env: Env): Promise<Response> {
    try {
      // List all users from KV (in production, use D1 database for better querying)
      const keys = await env.USERS_KV.list({ prefix: 'user:' })

      const users = []
      for (const key of keys.keys) {
        const userData = await env.USERS_KV.get(key.name)
        if (userData) {
          users.push(JSON.parse(userData))
        }
      }

      return success({ users, total: users.length })
    } catch (error: any) {
      return serverError(error.message)
    }
  }
}
