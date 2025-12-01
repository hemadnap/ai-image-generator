/**
 * Middleware - Request logging
 */

export const requestLogger = (request: Request) => {
  const url = new URL(request.url)
  console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname}`)
}
