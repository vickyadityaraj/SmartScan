'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Loader2, 
  KeyRound,
  Fingerprint,
  Info
} from 'lucide-react'
import { 
  getUserProfileAction, 
  updatePasswordAction, 
  forgotPasswordAction, 
  verifyForgotPasswordOtpAction, 
  resetPasswordAction 
} from '@/app/login/actions'

export function ProfileDialog({ children }: { children: React.ReactElement }) {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<{name: string, email: string, role: string} | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Manual Password State
  const [updatingManual, setUpdatingManual] = useState(false)
  
  // Email Reset State
  const [resetStep, setResetStep] = useState<'idle' | 'otp' | 'new_password'>('idle')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')

  useEffect(() => {
    if (open) {
      fetchProfile()
    } else {
      // Reset state when closing
      setResetStep('idle')
      setUpdatingManual(false)
    }
  }, [open])

  async function fetchProfile() {
    setLoading(true)
    const data = await getUserProfileAction()
    setProfile(data as { name: string; email: string; role: string } | null)
    setLoading(false)
  }

  async function handleManualUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUpdatingManual(true)
    
    const formData = new FormData(e.currentTarget)
    const res = await updatePasswordAction(formData)
    
    setUpdatingManual(false)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Password updated successfully!')
      e.currentTarget.reset()
    }
  }

  async function handleRequestOtp() {
    if (!profile?.email) return
    setSendingOtp(true)
    
    const formData = new FormData()
    formData.append('email', profile.email)
    
    const res = await forgotPasswordAction(formData)
    setSendingOtp(false)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      setOtpEmail(profile.email)
      setResetStep('otp')
      toast.success('Verification code sent to your email')
    }
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setVerifyingOtp(true)
    
    const formData = new FormData(e.currentTarget)
    const res = await verifyForgotPasswordOtpAction(formData)
    
    setVerifyingOtp(false)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      setResetStep('new_password')
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResettingPassword(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append('email', otpEmail)
    
    const res = await resetPasswordAction(formData)
    setResettingPassword(false)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Password reset successfully!')
      setResetStep('idle')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800">
        <div className="h-1.5 bg-primary w-full" />
        
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Fingerprint className="h-6 w-6 text-primary" /> User Profile
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and security preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 h-12 gap-6">
            <TabsTrigger value="info" className="relative h-12 rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="security" className="relative h-12 rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
              Security
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="info" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              {loading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                  <p className="text-sm text-zinc-500 italic">Loading profile details...</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Full Name</Label>
                      <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <User className="h-4 w-4 text-zinc-400" />
                        <span className="font-medium">{profile?.name || '---'}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Email Address</Label>
                      <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <Mail className="h-4 w-4 text-zinc-400" />
                        <span className="font-medium">{profile?.email || '---'}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Account Role</Label>
                      <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <ShieldCheck className="h-4 w-4 text-zinc-400" />
                        <span className="font-bold text-primary uppercase text-sm tracking-wider">{profile?.role || '---'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 flex gap-3 text-amber-800 dark:text-amber-300 text-sm">
                    <Info className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>Profile information was assigned during account creation and cannot be changed manually.</p>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                 <h4 className="text-sm font-semibold mb-1 flex items-center gap-2"><KeyRound className="h-4 w-4" /> Password Management</h4>
                 <p className="text-xs text-zinc-500">Choose between manual update or secure email verification.</p>
              </div>

              {resetStep === 'idle' && (
                <div className="space-y-6">
                  <form onSubmit={handleManualUpdate} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Current Password</Label>
                      <Input name="currentPassword" type="password" required className="bg-white dark:bg-black h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">New Password</Label>
                      <Input name="newPassword" type="password" required className="bg-white dark:bg-black h-10" />
                    </div>
                    <Button type="submit" className="w-full font-semibold" disabled={updatingManual}>
                       {updatingManual ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                       Update Manually
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500">or</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full h-12 border-2 text-zinc-600 dark:text-zinc-300" onClick={handleRequestOtp} disabled={sendingOtp}>
                     {sendingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                     Verify via Registered Email
                  </Button>
                </div>
              )}

              {resetStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-5 py-4 animate-in zoom-in-95 duration-300">
                  <div className="text-center space-y-2">
                    <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg">Enter Dashboard Key</h3>
                    <p className="text-sm text-zinc-500">A security code was sent to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{otpEmail}</span></p>
                  </div>
                  <Input 
                    name="code" 
                    placeholder="000000" 
                    maxLength={6} 
                    className="h-14 text-center text-2xl font-mono tracking-[0.5em] focus:border-primary border-2" 
                    required 
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setResetStep('idle')}>Cancel</Button>
                    <Button type="submit" className="flex-[2] font-semibold" disabled={verifyingOtp}>
                       {verifyingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Code'}
                    </Button>
                  </div>
                </form>
              )}

              {resetStep === 'new_password' && (
                <form onSubmit={handleResetPassword} className="space-y-4 animate-in zoom-in-95 duration-300">
                   <div className="text-center mb-6">
                      <div className="h-12 w-12 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg">Set New Password</h3>
                      <p className="text-sm text-zinc-500">Security verified. You can now choose a new password.</p>
                   </div>
                   <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Create New Password</Label>
                    <Input name="password" type="password" required className="h-10" autoFocus />
                  </div>
                  <Button type="submit" className="w-full font-semibold bg-green-600 hover:bg-green-700" disabled={resettingPassword}>
                     {resettingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Finish & Save'}
                  </Button>
                </form>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
