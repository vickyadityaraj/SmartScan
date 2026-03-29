'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { loginAction, signupAction, verifyOtpAction } from './actions'
import { toast } from 'sonner'
import { Loader2, ScanLine, Mail, ArrowRight, ShieldCheck, UserPlus, LogIn, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login')
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
              {mode === 'login' ? 'Welcome back to the terminal' : mode === 'signup' ? 'Create a new account' : 'Verify your identity'}
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
              <Button type="submit" className="w-full h-12 text-md font-semibold group" disabled={isSubmiting}>
                {isSubmiting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                Sign In
              </Button>
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
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 bg-zinc-50/50 dark:bg-zinc-900/50 px-8 py-6 mt-4 border-t border-zinc-100 dark:border-zinc-800">
          {mode === 'login' ? (
            <p className="text-sm text-center text-zinc-500">
              New user?{' '}
              <button 
                type="button" 
                onClick={() => setMode('signup')}
                className="text-primary font-bold hover:underline"
              >
                Signup
              </button>
            </p>
          ) : (
            <button 
              type="button" 
              onClick={() => setMode('login')}
              className="text-sm text-center text-zinc-500 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Back to Sign In
            </button>
          )}
          <p className="text-center w-full text-[10px] uppercase tracking-tighter text-zinc-400">
            Secure biometric-ready terminal. Authorized personnel only.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
