/**
 * Middleware - Error handling
 */

import { Env } from '../index'
import { serverError } from '../utils/responses'

export const errorHandler = (error: any, env: Env): Response => {
  console.error('[ERROR]', error)

  if (env.ENVIRONMENT === 'production') {
    return serverError('Internal server error')
  }

  return serverError(error.message || 'Internal server error')
}
