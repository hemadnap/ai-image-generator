import { dataAPI } from '@/api/endpoints'

/**
 * Data Service for D3 visualizations and analytics
 */
export class DataService {
  /**
   * Get dashboard data
   */
  static async getDashboardData(params = {}) {
    try {
      const response = await dataAPI.getDashboardData(params)
      return response.data
    } catch (error) {
      console.error('Failed to get dashboard data:', error)
      throw error
    }
  }

  /**
   * Get analytics data
   */
  static async getAnalyticsData(params = {}) {
    try {
      const response = await dataAPI.getAnalyticsData(params)
      return response.data
    } catch (error) {
      console.error('Failed to get analytics data:', error)
      throw error
    }
  }
}
