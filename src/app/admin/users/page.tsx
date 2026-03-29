'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createInternalUser, getUsersList, deleteUserAction } from '../actions'
import { Loader2, Users, ShieldPlus, UserPlus2, Trash2, Search, Filter, Mail, ShieldCheck } from 'lucide-react'

export default function AdminUsersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setIsLoadingUsers(true)
    const res = await getUsersList()
    if (res.data) setUsers(res.data)
    setIsLoadingUsers(false)
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

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
      fetchUsers()
      const form = e.target as HTMLFormElement
      form.reset()
    }
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`Are you sure you want to delete ${userName || 'this user'}? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(userId)
    const { error, success } = await deleteUserAction(userId)
    setIsDeleting(null)

    if (error) {
      toast.error(error)
    } else if (success) {
      toast.success('User removed from directory')
      fetchUsers()
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
                   <select 
                      name="role" 
                      required 
                      defaultValue=""
                      className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
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
          <Card className="order-1 lg:order-2 h-full flex flex-col border-2 shadow-md">
             <CardHeader className="border-b bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Active Directory</CardTitle>
                    <CardDescription>All currently registered users.</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                      <Input 
                        placeholder="Search users..." 
                        className="pl-8 h-9 text-xs w-full sm:w-[200px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                      <select 
                        className="pl-8 h-9 text-xs w-full sm:w-[130px] rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="security">Security</option>
                        <option value="management">Management</option>
                        <option value="customer">Customer</option>
                      </select>
                    </div>
                  </div>
                </div>
             </CardHeader>
             <CardContent className="flex-1 p-0 overflow-hidden">
                {isLoadingUsers ? (
                  <div className="h-64 flex flex-col items-center justify-center text-zinc-500 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/> 
                    <p className="text-sm font-medium">Loading directory...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-zinc-500 gap-2 border-dashed border-2 m-4 rounded-xl">
                    <Search className="h-10 w-10 opacity-20" />
                    <p className="font-medium">No users found</p>
                    <p className="text-xs">Try adjusting your filters or search query.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="bg-zinc-100/50 dark:bg-zinc-800/50">
                            <tr className="border-b transition-colors text-zinc-500">
                              <th className="h-12 px-4 text-left font-semibold">User Details</th>
                              <th className="h-12 px-4 text-left font-semibold">Role</th>
                              <th className="h-12 px-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.map(u => (
                              <tr key={u.id} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 group">
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{u.name || 'Anonymous'}</span>
                                    <span className="text-xs text-zinc-500 flex items-center gap-1"><Mail className="h-3 w-3" /> {u.email}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant={
                                    u.role === 'admin' ? 'default' : 
                                    u.role === 'security' ? 'secondary' : 
                                    u.role === 'management' ? 'outline' : 'secondary'
                                  } className="capitalize py-0.5">
                                    {u.role}
                                  </Badge>
                                </td>
                                <td className="p-4 text-right">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDelete(u.id, u.name)}
                                    disabled={isDeleting === u.id}
                                  >
                                    {isDeleting === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y">
                       {filteredUsers.map(u => (
                         <div key={u.id} className="p-5 flex flex-col gap-4 bg-white dark:bg-zinc-950">
                            <div className="flex items-start justify-between">
                               <div className="flex gap-3">
                                  <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                     <Users className="h-5 w-5 text-zinc-400" />
                                  </div>
                                  <div className="flex flex-col mt-0.5">
                                     <span className="font-bold text-zinc-900 dark:text-zinc-100">{u.name || 'Anonymous'}</span>
                                     <span className="text-xs text-zinc-500 break-all">{u.email}</span>
                                  </div>
                               </div>
                               <Badge variant={
                                    u.role === 'admin' ? 'default' : 
                                    u.role === 'security' ? 'secondary' : 
                                    u.role === 'management' ? 'outline' : 'secondary'
                                  } className="capitalize">
                                 {u.role}
                               </Badge>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-zinc-50 dark:border-zinc-900">
                               <div className="text-[10px] text-zinc-400 uppercase font-semibold">User ID: {u.id.slice(0, 8)}...</div>
                               <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-red-500 h-9 px-4 font-semibold"
                                  onClick={() => handleDelete(u.id, u.name)}
                                  disabled={isDeleting === u.id}
                               >
                                  {isDeleting === u.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                  Delete User
                               </Button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </>
                )}
             </CardContent>
          </Card>
      </div>
    </div>
  )
}
