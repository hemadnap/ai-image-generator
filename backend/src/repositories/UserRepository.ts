/**
 * User Repository
 * Handles all user database operations
 */

import { Env } from '../index'
import { User, UserRole, UserRow } from '../models/User'

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export class UserRepository {
  /**
   * Create a new user
   */
  static async create(env: Env, data: {
    email: string
    googleId: string
    firstName: string
    lastName: string
    language?: string
  }): Promise<User> {
    const id = generateUUID()
    const now = new Date().toISOString()

    try {
      console.log('[REPO] Creating new user:', {
        id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        googleId: data.googleId
      })

      const result = await env.DB.prepare(`
        INSERT INTO users (
          id, email, google_id, first_name, last_name, 
          roles, language, coins, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(
          id,
          data.email,
          data.googleId,
          data.firstName,
          data.lastName,
          JSON.stringify([UserRole.USER]),
          data.language || 'en',
          0,
          now,
          now
        )
        .run()

      console.log('[REPO] Insert result:', result)

      if (!result.success) {
        console.error('[REPO] Insert failed:', result)
        throw new Error('Failed to create user: ' + (result.error || 'Unknown error'))
      }

      const user = await this.findById(env, id)
      if (!user) {
        throw new Error('User created but not found')
      }

      console.log('[REPO] User created successfully:', user.id)
      return user
    } catch (error: any) {
      console.error('[REPO] Error creating user:', error)
      throw error
    }
  }

  /**
   * Find user by ID
   */
  static async findById(env: Env, id: string): Promise<User | null> {
    const result = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>()
    return result ? new User(result) : null
  }

  /**
   * Find user by email
   */
  static async findByEmail(env: Env, email: string): Promise<User | null> {
    const result = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<UserRow>()
    return result ? new User(result) : null
  }

  /**
   * Find user by Google ID
   */
  static async findByGoogleId(env: Env, googleId: string): Promise<User | null> {
    const result = await env.DB.prepare('SELECT * FROM users WHERE google_id = ?')
      .bind(googleId)
      .first<UserRow>()
    return result ? new User(result) : null
  }

  /**
   * Find or create user (useful for OAuth login)
   */
  static async findOrCreateByGoogle(env: Env, data: {
    googleId: string
    email: string
    firstName: string
    lastName: string
    language?: string
  }): Promise<User> {
    try {
      console.log('[REPO] findOrCreateByGoogle called with:', {
        googleId: data.googleId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      })

      // Try to find existing user by Google ID
      let user = await this.findByGoogleId(env, data.googleId)
      if (user) {
        console.log('[REPO] Found existing user by Google ID:', user.id)
        return user
      }

      // Try to find existing user by email
      user = await this.findByEmail(env, data.email)
      if (user) {
        console.log('[REPO] Found existing user by email:', user.id)
        // Update Google ID if not already set
        if (!user.googleId) {
          console.log('[REPO] Updating Google ID for existing user')
          user.googleId = data.googleId
          await this.update(env, user.id, user)
        }
        return user
      }

      // Create new user
      console.log('[REPO] Creating new user')
      return this.create(env, data)
    } catch (error: any) {
      console.error('[REPO] Error in findOrCreateByGoogle:', error)
      throw error
    }
  }

  /**
   * Update user
   */
  static async update(env: Env, id: string, data: Partial<Omit<User, 'createdAt' | 'updatedAt'>>): Promise<User> {
    const now = new Date().toISOString()
    const updates: string[] = []
    const bindings: any[] = []

    if (data.email !== undefined) {
      updates.push('email = ?')
      bindings.push(data.email)
    }
    if (data.firstName !== undefined) {
      updates.push('first_name = ?')
      bindings.push(data.firstName)
    }
    if (data.lastName !== undefined) {
      updates.push('last_name = ?')
      bindings.push(data.lastName)
    }
    if (data.roles !== undefined) {
      updates.push('roles = ?')
      bindings.push(JSON.stringify(data.roles))
    }
    if (data.language !== undefined) {
      updates.push('language = ?')
      bindings.push(data.language)
    }
    if (data.coins !== undefined) {
      updates.push('coins = ?')
      bindings.push(data.coins)
    }

    updates.push('updated_at = ?')
    bindings.push(now)
    bindings.push(id)

    const result = await env.DB.prepare(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `)
      .bind(...bindings)
      .run()

    if (!result.success) {
      throw new Error('Failed to update user')
    }

    const user = await this.findById(env, id)
    if (!user) {
      throw new Error('User updated but not found')
    }

    return user
  }

  /**
   * Deduct coins from user
   */
  static async deductCoins(env: Env, userId: string, amount: number): Promise<User> {
    const user = await this.findById(env, userId)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.coins < amount) {
      throw new Error(`Insufficient coins. Required: ${amount}, Available: ${user.coins}`)
    }

    return this.update(env, userId, { coins: user.coins - amount })
  }

  /**
   * Add coins to user
   */
  static async addCoins(env: Env, userId: string, amount: number): Promise<User> {
    const user = await this.findById(env, userId)
    if (!user) {
      throw new Error('User not found')
    }

    return this.update(env, userId, { coins: user.coins + amount })
  }

  /**
   * Add role to user
   */
  static async addRole(env: Env, userId: string, role: UserRole): Promise<User> {
    const user = await this.findById(env, userId)
    if (!user) {
      throw new Error('User not found')
    }

    if (!user.roles.includes(role)) {
      user.roles.push(role)
      return this.update(env, userId, { roles: user.roles })
    }

    return user
  }

  /**
   * Remove role from user
   */
  static async removeRole(env: Env, userId: string, role: UserRole): Promise<User> {
    const user = await this.findById(env, userId)
    if (!user) {
      throw new Error('User not found')
    }

    user.roles = user.roles.filter((r) => r !== role)
    return this.update(env, userId, { roles: user.roles })
  }

  /**
   * Delete user
   */
  static async delete(env: Env, id: string): Promise<void> {
    const result = await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
    if (!result.success) {
      throw new Error('Failed to delete user')
    }
  }

  /**
   * Get all users (paginated)
   */
  static async findAll(env: Env, limit: number = 50, offset: number = 0): Promise<{ users: User[]; total: number }> {
    const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>()
    const total = countResult?.count || 0

    const results = await env.DB.prepare(
      `
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `
    )
      .bind(limit, offset)
      .all<UserRow>()

    const users = results.results?.map((row) => new User(row)) || []

    return { users, total }
  }
}
