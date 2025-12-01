/**
 * Data Controller
 * Handles dashboard and analytics data
 */

import { Env } from '../index'
import { success, serverError } from '../utils/responses'

export const dataController = {
  async getDashboardData(request: Request, env: Env): Promise<Response> {
    try {
      // Mock dashboard data - replace with real data from D1 or KV
      const dashboardData = {
        stats: [
          { label: 'Total Users', value: 1250, trend: '+12%' },
          { label: 'Active Sessions', value: 342, trend: '+5%' },
          { label: 'Revenue', value: '$45,231', trend: '+23%' },
          { label: 'Conversion Rate', value: '3.2%', trend: '+0.5%' }
        ],
        recentActivity: [
          { id: 1, action: 'User registered', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'John Doe' },
          { id: 2, action: 'Payment received', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'Jane Smith' },
          { id: 3, action: 'New database entry', timestamp: new Date(Date.now() - 10800000).toISOString(), user: 'System' }
        ]
      }

      return success(dashboardData)
    } catch (error: any) {
      return serverError(error.message)
    }
  },

  async getAnalyticsData(request: Request, env: Env): Promise<Response> {
    try {
      // Mock analytics data - replace with real data from D1 or analytics service
      const analyticsData = {
        pageViews: [
          { date: '2024-12-16', views: 1250 },
          { date: '2024-12-17', views: 1420 },
          { date: '2024-12-18', views: 1680 },
          { date: '2024-12-19', views: 1520 },
          { date: '2024-12-20', views: 1890 },
          { date: '2024-12-21', views: 2150 },
          { date: '2024-12-22', views: 1950 }
        ],
        usersByCountry: [
          { country: 'United States', users: 450 },
          { country: 'United Kingdom', users: 280 },
          { country: 'Canada', users: 210 },
          { country: 'Australia', users: 165 },
          { country: 'Germany', users: 145 }
        ],
        deviceBreakdown: [
          { device: 'Desktop', percentage: 65 },
          { device: 'Mobile', percentage: 30 },
          { device: 'Tablet', percentage: 5 }
        ]
      }

      return success(analyticsData)
    } catch (error: any) {
      return serverError(error.message)
    }
  }
}
