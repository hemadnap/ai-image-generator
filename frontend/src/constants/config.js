export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
}

export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
}

export const APP_CONFIG = {
  TITLE: import.meta.env.VITE_APP_TITLE || 'OPNNG.IO',
  VERSION: '1.0.0',
}
