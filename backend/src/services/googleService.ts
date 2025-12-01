/**
 * Google OAuth Service
 * Handles Google token verification and auth token generation
 */

import { Env } from '../index'

// Helper function for base64url encoding
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Helper function for base64url decoding
function base64UrlDecode(str: string): Uint8Array {
  str = base64UrlFixPadding(str)
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// Helper function to fix padding
function base64UrlFixPadding(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  switch (str.length % 4) {
    case 0:
      break
    case 2:
      str += '=='
      break
    case 3:
      str += '='
      break
    default:
      throw new Error('Invalid base64url string')
  }
  return str
}

export const googleService = {
  async verifyGoogleToken(token: string, env: Env): Promise<Record<string, any> | null> {
    try {
      // The token from Google One-Tap is an ID token (JWT), not an access token
      // We need to verify it using Google's tokeninfo endpoint for ID tokens
      console.log('[AUTH] Starting token verification...')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token), {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error('[AUTH] Google token verification failed:', response.status)
        return null
      }

      const tokenInfo = await response.json() as Record<string, any>

      // Check if token verification had an error
      if (tokenInfo.error) {
        console.error('[AUTH] Google token error:', tokenInfo.error_description)
        return null
      }

      // Verify the token belongs to our app (audience check)
      if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
        console.error('[AUTH] Token audience mismatch:', tokenInfo.aud, 'expected:', env.GOOGLE_CLIENT_ID)
        return null
      }

      // Extract user info from the ID token claims
      const userInfo = {
        sub: tokenInfo.sub,  // Use 'sub' consistently throughout the app
        email: tokenInfo.email,
        email_verified: tokenInfo.email_verified,
        name: tokenInfo.name,
        picture: tokenInfo.picture,
        locale: tokenInfo.locale
      }

      console.log('[AUTH] User info extracted:', userInfo.email)
      return userInfo
    } catch (error: any) {
      console.error('[AUTH] Google token verification error:', error?.message || error)
      return null
    }
  },

  async generateAuthToken(userInfo: Record<string, any>, env: Env): Promise<string> {
    try {
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      }
      
      const now = Math.floor(Date.now() / 1000)
      const payload = {
        sub: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        iat: now,
        exp: now + 3600 * 24 * 7 // 7 days
      }

      // Encode header and payload
      const headerEncoded = base64UrlEncode(JSON.stringify(header))
      const payloadEncoded = base64UrlEncode(JSON.stringify(payload))
      const message = `${headerEncoded}.${payloadEncoded}`

      // Sign with HMAC-SHA256
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(env.JWT_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
      const signatureEncoded = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))

      return `${message}.${signatureEncoded}`
    } catch (error: any) {
      console.error('[AUTH] Error generating token:', error?.message)
      throw error
    }
  },

  async verifyAuthToken(token: string, env: Env): Promise<Record<string, any> | null> {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.error('[AUTH] Invalid token format')
        return null
      }

      const [headerEncoded, payloadEncoded, signatureEncoded] = parts
      const message = `${headerEncoded}.${payloadEncoded}`

      // Verify signature
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(env.JWT_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      )
      
      const signatureBytes = base64UrlDecode(signatureEncoded)
      const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(message))

      if (!isValid) {
        console.error('[AUTH] Invalid token signature')
        return null
      }

      const payload = JSON.parse(atob(base64UrlFixPadding(payloadEncoded)))

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.error('[AUTH] Token expired')
        return null
      }

      return payload
    } catch (error: any) {
      console.error('[AUTH] Token verification error:', error?.message)
      return null
    }
  }
}
