/**
 * Utility functions for HTTP responses
 */

export const success = (data: any, status = 200) => {
  return new Response(JSON.stringify({ success: true, ...data }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export const error = (message: string, status = 400, details?: any) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message, ...(details && { details }) }
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

export const notFound = (message = 'Not found') => {
  return error(message, 404)
}

export const unauthorized = (message = 'Unauthorized') => {
  return error(message, 401)
}

export const forbidden = (message = 'Forbidden') => {
  return error(message, 403)
}

export const badRequest = (message = 'Bad request') => {
  return error(message, 400)
}

export const serverError = (message = 'Internal server error') => {
  return error(message, 500)
}
