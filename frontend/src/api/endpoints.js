import apiClient from './axiosInstance'

/**
 * Auth API endpoints
 */
export const authAPI = {
  /**
   * Login with Google token
   */
  loginWithGoogle(token) {
    return apiClient.post('/auth/google', { token })
  },

  /**
   * Logout
   */
  logout() {
    return apiClient.post('/auth/logout')
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    return apiClient.get('/auth/me', { skipRedirect: true })
  },

  /**
   * Refresh token
   */
  refreshToken() {
    return apiClient.post('/auth/refresh')
  },
}

/**
 * User API endpoints
 */
export const userAPI = {
  /**
   * Get user by ID
   */
  getUser(userId) {
    return apiClient.get(`/users/${userId}`)
  },

  /**
   * Update user profile
   */
  updateProfile(userId, data) {
    return apiClient.put(`/users/${userId}`, data)
  },

  /**
   * Get all users
   */
  getAllUsers(params = {}) {
    return apiClient.get('/users', { params })
  },
}

/**
 * Data API endpoints (example for D3 visualizations)
 */
export const dataAPI = {
  /**
   * Get dashboard data
   */
  getDashboardData(params = {}) {
    return apiClient.get('/data/dashboard', { params })
  },

  /**
   * Get analytics data
   */
  getAnalyticsData(params = {}) {
    return apiClient.get('/data/analytics', { params })
  },
}

/**
 * Image Generation API endpoints
 */
export const imageGenerationAPI = {
  /**
   * Generate image from text prompt
   */
  generateImage(data) {
    return apiClient.post('/images/generate', data)
  },

  /**
   * Get user's generated images
   */
  getUserImages(params = {}) {
    return apiClient.get('/images', { params })
  },

  /**
   * Get prompt history
   */
  getPromptHistory(params = {}) {
    return apiClient.get('/prompts', { params })
  },
}
