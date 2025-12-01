/**
 * User routes handler
 */

import { Env } from '../index'
import { userController } from '../handlers/userHandler'
import { notFound } from '../utils/responses'

export const userRoutes = {
  async handle(path: string, method: string, request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // GET /users/:id - Get user by ID
    const userIdMatch = path.match(/^\/users\/([^/]+)$/)
    if (userIdMatch && method === 'GET') {
      const userId = userIdMatch[1]
      return userController.getUserById(userId, env)
    }

    // PUT /users/:id - Update user
    if (userIdMatch && method === 'PUT') {
      const userId = userIdMatch[1]
      return userController.updateUser(userId, request, env)
    }

    // GET /users - List all users
    if (path === '/users' && method === 'GET') {
      return userController.getAllUsers(request, env)
    }

    return notFound()
  }
}
