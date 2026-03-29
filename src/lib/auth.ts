import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret')

// Final Login Session (24 hours)
export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  })
}

// Temporary OTP Challenge (10 minutes)
// We add passwordHash to the challenge so we can save it after OTP verification
export async function createChallenge(email: string, otp: string, data: { name?: string, passwordHash?: string } = {}) {
  const token = await new SignJWT({ email, otp, ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('otp_challenge', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10 
  })
}

export async function verifyChallenge(code: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('otp_challenge')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.otp === code) {
      // Clear the challenge once verified
      cookieStore.delete('otp_challenge')
      return payload
    }
  } catch (err) {
    // Challenge expired or invalid
  }
  return null
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      userId: payload.userId as string,
      role: payload.role as string
    }
  } catch (err) {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
