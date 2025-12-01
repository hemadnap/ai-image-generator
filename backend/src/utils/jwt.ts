/**
 * JWT utilities for token creation and verification
 */

// Simple JWT implementation (for Cloudflare Workers)
// In production, consider using a proper JWT library

export const createToken = async (payload: Record<string, any>, secret: string, expiresIn = 3600) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const iat = now
  const exp = now + expiresIn

  const body = {
    ...payload,
    iat,
    exp
  }

  const encodedHeader = btoa(JSON.stringify(header))
  const encodedBody = btoa(JSON.stringify(body))

  const message = `${encodedHeader}.${encodedBody}`
  const signature = btoa(
    new TextEncoder().encode(
      await hmacSHA256(secret, message)
    ).toString()
  )

  return `${message}.${signature}`
}

export const verifyToken = async (token: string, secret: string): Promise<Record<string, any> | null> => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerPart, bodyPart, signaturePart] = parts

    // Verify signature
    const message = `${headerPart}.${bodyPart}`
    const expectedSignature = btoa(
      new TextEncoder().encode(
        await hmacSHA256(secret, message)
      ).toString()
    )

    if (signaturePart !== expectedSignature) return null

    // Decode and parse body
    const body = JSON.parse(atob(bodyPart))

    // Check expiration
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return body
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Simple HMAC-SHA256 implementation
async function hmacSHA256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)

  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, messageData)

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
