'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendOtpEmail } from '@/lib/mailer'
import { createSession, createChallenge, verifyChallenge } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  // 1. Fetch user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('id, role, password_hash')
    .eq('email', email)
    .single()

  if (error || !user) {
    return { error: 'Invalid email or password.' }
  }

  // 2. Verify password with bcrypt
  if (!user.password_hash) {
    return { error: 'No password set for this account. Please use Signup.' }
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    return { error: 'Invalid email or password.' }
  }

  // 3. Create session
  await createSession(user.id, user.role)
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  // 1. Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return { error: 'User already exists. Please Log In.' }
  }

  // 2. Hash password and generate OTP
  const passwordHash = await bcrypt.hash(password, 10)
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // 3. Create stateless challenge cookie (contains all user data)
  await createChallenge(email, otp, { name, passwordHash })
  
  // 4. Send email
  await sendOtpEmail(email, name, otp)

  return { success: true }
}

export async function verifyOtpAction(formData: FormData) {
  const code = formData.get('code') as string
  const supabase = await createClient()

  // 1. Verify challenge from cookie
  const challenge = await verifyChallenge(code)
  if (!challenge) {
    return { error: 'Invalid or expired OTP code.' }
  }

  const { email, name, passwordHash } = challenge as any

  // 2. Create user in database now that email is verified
  const { data: newUser, error: signUpError } = await supabase
    .from('users')
    .insert({
      email,
      name,
      password_hash: passwordHash,
      role: 'customer' // default role for public signup
    })
    .select('id, role')
    .single()
  
  if (signUpError) {
    return { error: signUpError.message }
  }

  // 3. Create final session
  await createSession(newUser.id, newUser.role)
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function logoutAction() {
  const { deleteSession } = await import('@/lib/auth')
  await deleteSession()
  revalidatePath('/', 'layout')
}

export async function sendForgotPasswordOtp(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .select('id, name')
    .eq('email', email)
    .single()

  if (!user) {
    // Silent fail for security, but return success to show "Check Email"
    return { success: true }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  await createChallenge(email, otp, { mode: 'reset_password' })
  await sendOtpEmail(email, user.name, otp)

  return { success: true }
}
