import { authAPI } from '@/api/endpoints'
import { User } from '@/models/User'

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Set authentication cookie
   */
  static setAuthCookie(token, days = 7) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `auth_token=${token}; ${expires}; path=/; SameSite=Lax`
    console.log('[AUTH] Cookie set with token')
  }

  /**
   * Get authentication cookie
   */
  static getAuthCookie() {
    const name = 'auth_token='
    const decodedCookie = decodeURIComponent(document.cookie)
    const cookieArray = decodedCookie.split(';')
    for (let cookie of cookieArray) {
      cookie = cookie.trim()
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length)
      }
    }
    return null
  }

  /**
   * Delete authentication cookie
   */
  static deleteAuthCookie() {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    console.log('[AUTH] Cookie deleted')
  }

  /**
   * Login with Google token
   */
  static async loginWithGoogle(token) {
    try {
      console.log('[AUTH] Logging in with Google token')
      const response = await authAPI.loginWithGoogle(token)
      console.log('[AUTH] Login response:', response.data)

      const { user, token: authToken } = response.data

      // Store token in both localStorage and cookie
      localStorage.setItem('auth_token', authToken)
      this.setAuthCookie(authToken)

      // Store complete user data in localStorage
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        roles: user.roles,
        coins: user.coins,
        language: user.language,
        authProvider: user.authProvider
      }
      localStorage.setItem('user_data', JSON.stringify(userData))
      console.log('[AUTH] User data stored:', userData)

      return new User(user.id, user.email, user.name, user.picture, user.authProvider)
    } catch (error) {
      console.error('[AUTH] Login failed:', error)
      throw error
    }
  }

  /**
   * Logout
   */
  static async logout() {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('[AUTH] Logout API failed:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      this.deleteAuthCookie()
      console.log('[AUTH] Logged out - tokens cleared')
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    try {
      const response = await authAPI.getCurrentUser()
      const { user } = response.data

      // Update stored user data
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        coins: user.coins,
        language: user.language,
        authProvider: user.authProvider
      }
      localStorage.setItem('user_data', JSON.stringify(userData))
      console.log('[AUTH] Current user data updated:', userData)

      return new User(user.id, user.email, user.name, undefined, user.authProvider)
    } catch (error) {
      console.error('[AUTH] Failed to get current user:', error?.response?.status, error?.message)
      // Re-throw the error so caller can handle it
      throw error
    }
  }

  /**
   * Get stored user data from localStorage
   */
  static getStoredUserData() {
    const data = localStorage.getItem('user_data')
    return data ? JSON.parse(data) : null
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    // Check localStorage first
    const token = localStorage.getItem('auth_token')
    if (token) {
      return true
    }

    // Fallback to cookie
    const cookieToken = this.getAuthCookie()
    return !!cookieToken
  }

  /**
   * Get auth token
   */
  static getToken() {
    // Check localStorage first
    let token = localStorage.getItem('auth_token')
    if (token) {
      return token
    }

    // Fallback to cookie
    token = this.getAuthCookie()
    if (token) {
      // Restore to localStorage for consistency
      localStorage.setItem('auth_token', token)
      return token
    }

    return null
  }
}
