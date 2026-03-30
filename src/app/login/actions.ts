'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createChallenge, verifyChallenge, createSession } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/mailer'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

/**
 * Handles the initial Signup step.
 * Checks for existing users, hashes the password, and sends an OTP via email.
 */
export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string

  if (!email || !name || !password) {
    return { error: 'Please fill in all fields' }
  }

  const supabase = await createAdminClient()

  // 1. Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, password_hash')
    .eq('email', email)
    .single()

  // If user exists and already has a password, they should login instead
  if (existingUser && existingUser.password_hash) {
    return { error: 'User already exists. Please Log In.' }
  }

  // 2. Hash password and generate OTP
  const passwordHash = await bcrypt.hash(password, 10)
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // 3. Create stateless challenge cookie (contains all user data)
  await createChallenge(email, otp, { name, passwordHash })

  // 4. Send OTP via SMTP
  try {
    await sendOtpEmail(email, otp)
    return { success: true }
  } catch (error) {
    console.error('SMTP Error:', error)
    return { error: 'Failed to send verification code. Please check SMTP settings.' }
  }
}

/**
 * Handles the OTP verification step.
 * Finalizes user creation/update in the database and creates a session.
 */
export async function verifyOtpAction(formData: FormData) {
  const code = formData.get('code') as string
  const email_from_form = formData.get('email') as string
  const name_from_form = formData.get('name') as string
  const password_from_form = formData.get('password') as string

  if (!code) {
    return { error: 'Please enter the verification code' }
  }

  const challenge = await verifyChallenge(code)

  if (!challenge) {
    return { error: 'Invalid or expired code. Please try again.' }
  }

  const { email, name, passwordHash } = challenge as { email: string; name: string; passwordHash: string }
  const supabase = await createAdminClient()

  // 2. Upsert user in database now that email is verified
  // We use upsert to handle both new signups and users migrating to password-login
  const { data: newUser, error: signUpError } = await supabase
    .from('users')
    .upsert({
      email: email || email_from_form,
      name: name || name_from_form,
      password_hash: passwordHash || (password_from_form ? await bcrypt.hash(password_from_form, 10) : undefined),
      role: 'customer' // default role for public signup
    }, { onConflict: 'email' })
    .select('id, role')
    .single()

  if (signUpError) {
    return { error: signUpError.message }
  }

  // 3. Clear the challenge and create a session
  const cookieStore = await cookies()
  cookieStore.delete('otp_challenge')
  
  await createSession(newUser.id, newUser.role)
  return { success: true }
}

/**
 * Handles the Default Login step (Email & Password).
 */
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please enter email and password' }
  }

  const supabase = await createAdminClient()
  
  const { data: user, error } = await supabase
    .from('users')
    .select('id, role, password_hash')
    .eq('email', email)
    .single()

  if (error || !user) {
    return { error: 'Invalid email or password' }
  }

  if (!user.password_hash) {
    return { error: 'No password set for this account. Please use Signup.' }
  }

  // Verify password using bcrypt
  const passwordMatch = await bcrypt.compare(password, user.password_hash)
  
  if (!passwordMatch) {
    return { error: 'Invalid email or password' }
  }

  // Create session
  await createSession(user.id, user.role)
  return { success: true }
}

/**
 * Logs out the user.
 */
export async function logoutAction() {
  const { logout } = await import('@/lib/auth')
  await logout()
}

/**
 * Initiates the Forgot Password flow by sending an OTP.
 */
export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Please enter your email address' }

  const supabase = await createAdminClient()
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!user) {
    // For security, don't confirm if user exists or not, but here we can be helpful
    return { error: 'No account found with this email' }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  await createChallenge(email, otp, { purpose: 'password_reset' })

  const { sendPasswordResetOtpEmail } = await import('@/lib/mailer')
  try {
    await sendPasswordResetOtpEmail(email, otp)
    return { success: true }
  } catch (error) {
    console.error('SMTP Error:', error)
    return { error: 'Failed to send reset code. Please try again later.' }
  }
}

/**
 * Verifies the password reset OTP.
 */
export async function verifyForgotPasswordOtpAction(formData: FormData) {
  const code = formData.get('code') as string
  if (!code) return { error: 'Please enter the verification code' }

  const challenge = await verifyChallenge(code)
  if (!challenge || (challenge as any).purpose !== 'password_reset') {
    return { error: 'Invalid or expired code' }
  }

  return { success: true, email: (challenge as { email: string }).email }
}

/**
 * Resets the password using the verified email.
 */
export async function resetPasswordAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const supabase = await createAdminClient()
  const passwordHash = await bcrypt.hash(password, 10)

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('email', email)

  if (error) return { error: error.message }

  // Clear challenge cookie
  const cookieStore = await cookies()
  cookieStore.delete('otp_challenge')

  return { success: true }
}

/**
 * Updates the password for a logged-in user.
 */
export async function updatePasswordAction(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters' }
  }

  const { getSession } = await import('@/lib/auth')
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const supabase = await createAdminClient()
  const { data: user } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', session.userId)
    .single()

  if (!user || !user.password_hash) return { error: 'User not found' }

  const match = await bcrypt.compare(currentPassword, user.password_hash)
  if (!match) return { error: 'Incorrect current password' }

  const newHash = await bcrypt.hash(newPassword, 10)
  const { error } = await supabase
    .from('users')
    .update({ password_hash: newHash })
    .eq('id', session.userId)

  if (error) return { error: error.message }
  return { success: true }
}

/**
 * Fetches current user profile.
 */
export async function getUserProfileAction() {
  const { getSession } = await import('@/lib/auth')
  const session = await getSession()
  if (!session) return null

  const supabase = await createAdminClient()
  const { data: user } = await supabase
    .from('users')
    .select('name, email, role')
    .eq('id', session.userId)
    .single()

  return user
}
