import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret')

/**
 * Creates a stateless OTP challenge cookie (encrypted JWT).
 * Stores pending signup data (email, name, passwordHash) to avoid unnecessary DB inserts.
 */
export async function createChallenge(email: string, otp: string, data: { name?: string, passwordHash?: string } = {}) {
  const token = await new SignJWT({ email, otp, ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m') // OTP expires in 10 minutes
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('otp_challenge', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  })
}

/**
 * Verifies the OTP challenge token from the cookie.
 */
export async function verifyChallenge(code: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('otp_challenge')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.otp === code) {
      // Don't delete yet, the caller will delete after DB insert succeeds
      return payload
    }
    return null
  } catch (err) {
    return null
  }
}

/**
 * Creates a persistent session cookie (JWT) after successful login/verification.
 */
export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Session lasts 24 hours
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 // 24 hours
  })
}

/**
 * Retrieves and validates the current session.
 */
export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string, role: string }
  } catch (err) {
    return null
  }
}

/**
 * Logs out the user by clearing the session cookie.
 */
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
