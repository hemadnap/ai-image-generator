/**
 * Authentication utilities
 */

import { Env } from '../index'
import { unauthorized } from './responses'

export const extractToken = (request: Request): string | null => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  return parts[1]
}

export const verifyAuthToken = async (token: string, env: Env): Promise<Record<string, any> | null> => {
  // For now, return mock user data
  // In production, verify the JWT token using JWT utilities
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]))
    return decoded
  } catch (error) {
    return null
  }
}
