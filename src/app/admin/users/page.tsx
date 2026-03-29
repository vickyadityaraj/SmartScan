'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createInternalUser, getUsersList } from '../actions'
import { Loader2, Users, ShieldPlus, UserPlus2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

export default function AdminUsersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getUsersList().then(res => {
      if (res.data) setUsers(res.data)
      setIsLoadingUsers(false)
    })
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const { error, success } = await createInternalUser(formData)
    
    setIsSubmitting(false)

    if (error) {
      toast.error(error)
    } else if (success) {
      toast.success('Internal user created securely!')
      const res = await getUsersList()
      if (res.data) setUsers(res.data)
      // clear form gently
      const form = e.target as HTMLFormElement
      form.reset()
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
        <p className="text-zinc-500">Manage internal employee credentials and capabilities.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
         
         {/* Creation Form */}
         <Card className="border-2 shadow-sm order-2 lg:order-1">
           <CardHeader className="bg-primary/5 border-b">
              <div className="flex gap-4 items-center mb-2">
                 <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                   <ShieldPlus className="h-6 w-6" />
                 </div>
                 <div>
                   <CardTitle>Provision Credentials</CardTitle>
                   <CardDescription>Grant dashboard access to staff.</CardDescription>
                 </div>
              </div>
           </CardHeader>
           <CardContent className="pt-6">
              <form id="add-user-form" onSubmit={onSubmit} className="space-y-4">
                 <div className="space-y-2">
                   <Label>Employee Name</Label>
                   <Input name="name" required placeholder="Jane Doe" className="h-11" />
                 </div>
                 <div className="space-y-2">
                   <Label>Work Email</Label>
                   <Input name="email" type="email" required placeholder="jane.doe@store.com" className="h-11" />
                 </div>
                 <div className="space-y-2">
                   <Label>Temporary Password</Label>
                   <Input name="password" type="password" required className="h-11" minLength={6} placeholder="••••••••" />
                 </div>
                 <div className="space-y-2">
                   <Label>System Role</Label>
                   <select name="role" required defaultValue="" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                     <option value="" disabled>Select access level</option>
                     <option value="management">Store Management (Inventory)</option>
                     <option value="security">Loss Prevention (Security Check)</option>
                     <option value="admin">System Admin</option>
                   </select>
                 </div>
              </form>
           </CardContent>
           <CardFooter className="pt-4 border-t">
              <Button form="add-user-form" type="submit" disabled={isSubmitting} className="w-full h-11">
                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus2 className="mr-2 h-4 w-4" />}
                 Provision Access
              </Button>
           </CardFooter>
         </Card>

         {/* Directory List */}
         <Card className="order-1 lg:order-2 h-full flex flex-col">
            <CardHeader>
               <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Active Directory</CardTitle>
               <CardDescription>All currently registered users.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
               {isLoadingUsers ? (
                 <div className="h-32 flex items-center justify-center text-zinc-500 gap-2">
                   <Loader2 className="h-5 w-5 animate-spin"/> Loading directory...
                 </div>
               ) : (
                 <div className="overflow-x-auto rounded-lg border">
                   <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b bg-zinc-50 dark:bg-zinc-900/50">
                         <tr className="border-b transition-colors text-zinc-500">
                           <th className="h-10 px-4 text-left font-medium">Name</th>
                           <th className="h-10 px-4 text-left font-medium">Email</th>
                           <th className="h-10 px-4 text-left font-medium">Role</th>
                         </tr>
                      </thead>
                      <tbody>
                         {users.map(u => (
                           <tr key={u.id} className="border-b transition-colors hover:bg-zinc-50/50">
                             <td className="p-3 font-medium">{u.name || 'Anonymous'}</td>
                             <td className="p-3 text-zinc-500">{u.email}</td>
                             <td className="p-3">
                               <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                 u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                 u.role === 'security' ? 'bg-blue-100 text-blue-700' :
                                 u.role === 'management' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-700'
                               }`}>
                                 {u.role.toUpperCase()}
                               </span>
                             </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                 </div>
               )}
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
