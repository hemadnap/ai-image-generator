import axios from 'axios'

// Create axios instance with default config
const httpClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens or common headers here
    if (import.meta.env.VITE_API_BASE_URL) {
      config.baseURL = import.meta.env.VITE_API_BASE_URL
    }

    // Log request for debugging (remove in production)
    console.log('Making request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
    })

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Global error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      })

      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          console.error('Unauthorized access')
          break
        case 403:
          // Handle forbidden
          console.error('Forbidden access')
          break
        case 404:
          // Handle not found
          console.error('Resource not found')
          break
        case 429:
          // Handle rate limiting
          console.error('Rate limit exceeded')
          break
        case 500:
          // Handle server error
          console.error('Internal server error')
          break
        default:
          console.error('Request failed with status:', error.response.status)
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error:', error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message)
    }

    return Promise.reject(error)
  }
)

// API methods
export const api = {
  // Generic methods
  get: (url, config = {}) => httpClient.get(url, config),
  post: (url, data = {}, config = {}) => httpClient.post(url, data, config),
  put: (url, data = {}, config = {}) => httpClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => httpClient.patch(url, data, config),
  delete: (url, config = {}) => httpClient.delete(url, config),

  // File upload
  uploadFile: (url, file, config = {}) => {
    const formData = new FormData()
    formData.append('file', file)

    return httpClient.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
    })
  },
}

export { httpClient }
export default httpClient
