import axios from 'axios'
import { API_CONFIG } from '@/constants/config'

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('[AXIOS] Received 401 for URL:', error.config?.url)
      console.log('[AXIOS] Current path:', window.location.pathname)
      
      // Never redirect if already on login page
      if (window.location.pathname === '/login') {
        console.log('[AXIOS] Already on login page, not redirecting again')
        return Promise.reject(error)
      }

      // Only redirect if this is an auth-related endpoint
      // For other endpoints, let the component handle the error
      const isAuthEndpoint = error.config?.url?.includes('/auth/')
      const isInitRequest = error.config?.skipRedirect
      
      if (!isInitRequest && (isAuthEndpoint || error.config?.url?.includes('/auth/me'))) {
        console.log('[AXIOS] Got 401 on auth endpoint, clearing auth and redirecting')
        // Clear auth and redirect
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        // Use setTimeout to ensure other code completes first
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }, 100)
      } else {
        console.log('[AXIOS] 401 on non-auth endpoint:', error.config?.url)
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
