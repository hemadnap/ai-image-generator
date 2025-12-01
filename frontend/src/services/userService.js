import { userAPI } from '@/api/endpoints'
import { User } from '@/models/User'

/**
 * User Service
 */
export class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    try {
      const response = await userAPI.getUser(userId)
      const { user } = response.data
      return new User(user.id, user.email, user.name, user.picture, user.authProvider)
    } catch (error) {
      console.error('Failed to get user:', error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, profileData) {
    try {
      const response = await userAPI.updateProfile(userId, profileData)
      const { user } = response.data
      return new User(user.id, user.email, user.name, user.picture, user.authProvider)
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  /**
   * Get all users
   */
  static async getAllUsers(params = {}) {
    try {
      const response = await userAPI.getAllUsers(params)
      const { users } = response.data
      return users.map(
        (user) => new User(user.id, user.email, user.name, user.picture, user.authProvider),
      )
    } catch (error) {
      console.error('Failed to get users:', error)
      throw error
    }
  }
}
