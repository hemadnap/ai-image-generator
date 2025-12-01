/**
 * Type definitions for the API
 */

export interface User {
  id: string
  email: string
  name: string
  picture?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface DashboardData {
  stats: Stat[]
  recentActivity: Activity[]
}

export interface Stat {
  label: string
  value: string | number
  trend: string
}

export interface Activity {
  id: number
  action: string
  timestamp: string
  user: string
}

export interface AnalyticsData {
  pageViews: PageView[]
  usersByCountry: CountryStats[]
  deviceBreakdown: DeviceStats[]
}

export interface PageView {
  date: string
  views: number
}

export interface CountryStats {
  country: string
  users: number
}

export interface DeviceStats {
  device: string
  percentage: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    details?: any
  }
}
