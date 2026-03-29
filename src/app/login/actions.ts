'use server'

import { createClient } from '@/lib/supabase/server'
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

  const supabase = await createClient()

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
  } catch (err) {
    console.error('SMTP Error:', err)
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

  const { email, name, passwordHash } = challenge as any
  const supabase = await createClient()

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

  const supabase = await createClient()
  
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
