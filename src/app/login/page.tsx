'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ScanLine, Mail, Lock, LogIn, UserPlus, ShieldCheck, Loader2 } from 'lucide-react'
import { loginAction, signupAction, verifyOtpAction, forgotPasswordAction, verifyForgotPasswordOtpAction, resetPasswordAction } from './actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp' | 'forgot-password' | 'reset-otp' | 'reset-new-password'>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [isSubmiting, setIsSubmiting] = useState(false)
  const router = useRouter()

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmiting(true)
    
    const formData = new FormData(event.currentTarget)
    const res = await loginAction(formData)
    
    setIsSubmiting(false)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Successfully logged in!')
      router.push('/')
    }
  }

  async function handleSignupStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmiting(true)
    
    const formData = new FormData(event.currentTarget)
    const res = await signupAction(formData)
    
    setIsSubmiting(false)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      setMode('otp')
      toast.success('OTP sent to your email / terminal!')
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmiting(true)
    
    const formData = new FormData(event.currentTarget)
    formData.append('email', email)
    formData.append('name', name)
    formData.append('password', password)

    const res = await verifyOtpAction(formData)
    
    setIsSubmiting(false)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Successfully registered and logged in!')
      router.push('/')
    }
  }


  async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmiting(true)
    
    const formData = new FormData(event.currentTarget)
    const res = await forgotPasswordAction(formData)
    
    setIsSubmiting(false)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      setMode('reset-otp')
      toast.success('Reset code sent to your email!')
    }
  }

  async function handleVerifyResetOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmiting(true)
    
    const formData = new FormData(event.currentTarget)
    const res = await verifyForgotPasswordOtpAction(formData)
    
    setIsSubmiting(false)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      setMode('reset-new-password')
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmiting(true)
    
    const formData = new FormData(event.currentTarget)
    formData.append('email', email)
    const res = await resetPasswordAction(formData)
    
    setIsSubmiting(false)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Password changed successfully!')
      setMode('login')
    }
  }

  return (
    <div className="min-h-screen grid items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      <Card className="w-full max-w-sm mx-auto shadow-2xl border-0 ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        
        <CardHeader className="space-y-1 items-center pb-8 pt-10">
            <div className="h-14 w-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300">
               <ScanLine className="h-7 w-7" />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">Smart Scan</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-center">
              {mode === 'login' ? 'Welcome back to the terminal' : 
               mode === 'signup' ? 'Create a new account' : 
               mode === 'otp' ? 'Verify your identity' :
               mode === 'forgot-password' ? 'Reset your access' :
               mode === 'reset-otp' ? 'Enter reset code' : 'Choose new password'}
            </CardDescription>
        </CardHeader>

        <CardContent className="px-8">
          {mode === 'login' && (
            <form key="login-form" onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    required 
                    className="h-11 pl-10 bg-zinc-50/50 dark:bg-zinc-900/50" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    className="h-11 pl-10 bg-zinc-50/50 dark:bg-zinc-900/50" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Button type="submit" className="w-full h-12 text-md font-semibold group" disabled={isSubmiting}>
                  {isSubmiting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                  Sign In
                </Button>
                <div className="flex justify-center">
                   <button 
                      type="button" 
                      onClick={() => setMode('forgot-password')}
                      className="text-[11px] uppercase tracking-widest font-bold text-zinc-400 hover:text-primary transition-colors"
                   >
                     Forgot Password?
                   </button>
                </div>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form key="signup-form" onSubmit={handleSignupStart} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  type="text" 
                  placeholder="John Doe" 
                  required 
                  className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Email Address</Label>
                <Input 
                  id="signup-email" 
                  name="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Create Password</Label>
                <Input 
                  id="signup-password" 
                  name="password" 
                  type="password" 
                  required 
                  className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              <Button type="submit" className="w-full h-12 text-md font-semibold" disabled={isSubmiting}>
                {isSubmiting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                Confirm via Email
              </Button>
            </form>
          )}

          {mode === 'otp' && (
            <form key="otp-form" onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <div className="text-center bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500">Verification code sent to</p>
                  <p className="text-sm font-semibold">{email}</p>
                </div>
                <div className="space-y-2 text-center">
                  <Label htmlFor="code" className="text-xs uppercase tracking-widest font-bold text-zinc-500">6-Digit Access Code</Label>
                  <Input 
                    id="code" 
                    name="code" 
                    type="text" 
                    placeholder="000000" 
                    required 
                    maxLength={6} 
                    className="h-14 text-center text-2xl font-mono tracking-[0.5em] bg-zinc-50/50 dark:bg-zinc-900/50 border-2 focus:border-primary" 
                    autoFocus 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-md font-semibold" disabled={isSubmiting}>
                {isSubmiting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                Create Account
              </Button>
            </form>
          )}

          {mode === 'forgot-password' && (
            <form key="forgot-password-form" onSubmit={handleForgotPassword} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Email Address</Label>
                <Input 
                  id="forgot-email" 
                  name="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-md font-semibold" disabled={isSubmiting}>
                {isSubmiting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
                Send Reset Code
              </Button>
            </form>
          )}

          {mode === 'reset-otp' && (
            <form key="reset-otp-form" onSubmit={handleVerifyResetOtp} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2 text-center">
                <Label htmlFor="reset-code" className="text-xs uppercase tracking-widest font-bold text-zinc-500">6-Digit Reset Code</Label>
                <Input 
                  id="reset-code" 
                  name="code" 
                  type="text" 
                  placeholder="000000" 
                  required 
                  maxLength={6} 
                  className="h-14 text-center text-2xl font-mono tracking-[0.5em] bg-zinc-50/50 dark:bg-zinc-900/50 border-2" 
                  autoFocus 
                />
              </div>
              <Button type="submit" className="w-full h-12 text-md font-semibold" disabled={isSubmiting}>
                {isSubmiting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                Verify Code
              </Button>
            </form>
          )}

          {mode === 'reset-new-password' && (
            <form key="reset-password-form" onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs uppercase tracking-widest font-bold text-zinc-500">New Password</Label>
                <Input 
                  id="new-password" 
                  name="password" 
                  type="password" 
                  required 
                  className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50" 
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full h-12 text-md font-semibold" disabled={isSubmiting}>
                {isSubmiting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
                Change Password
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="px-8 pb-8 pt-0 flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-black px-2 text-zinc-500">or</span>
              </div>
            </div>
            
            <Button 
                variant="ghost" 
                className="w-full text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900"
                onClick={() => {
                  if (mode === 'login' || mode === 'forgot-password') setMode('signup')
                  else setMode('login')
                }}
            >
                {mode === 'login' || mode === 'forgot-password' ? "New User? Create Account" : "Already have an account? Sign In"}
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
