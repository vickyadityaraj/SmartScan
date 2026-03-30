'use client'

import { useState, ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScanLine, LogOut, Menu, X, User } from 'lucide-react'
import { logoutAction } from '@/app/login/actions'
import { useRouter, usePathname } from 'next/navigation'
import { ProfileDialog } from '@/components/profile/profile-dialog'

export function DashboardLayout({
  children,
  roleTitle,
  navItems
}: {
  children: ReactNode
  roleTitle: string
  navItems: { label: string; href: string }[]
}) {
  const router = useRouter()
  async function handleLogout() {
    await logoutAction()
    router.push('/login')
  }

  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col transition-colors">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <ScanLine className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg">Smart Scan</span>
          <span className="text-zinc-500 ml-1 font-normal hidden sm:inline">| {roleTitle}</span>
        </div>
        
        <nav className="ml-8 hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <Link 
                key={item.href} 
                href={item.href} 
                className={`transition-all py-1 border-b-2 ${
                    pathname === item.href 
                        ? 'text-primary font-semibold border-primary' 
                        : 'text-zinc-600 hover:text-zinc-900 border-transparent dark:text-zinc-400 dark:hover:text-zinc-50 hover:border-zinc-300'
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="ml-auto flex items-center gap-2">
          <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <ProfileDialog>
            <Button variant="ghost" size="icon" title="Profile" className="text-zinc-500 hover:text-primary hover:bg-primary/10">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </ProfileDialog>
          
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out" className="text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </header>
      
      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl animate-in slide-in-from-top duration-300">
           <nav className="flex flex-col p-6 gap-3">
              {navItems.map((item) => (
                <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-4 rounded-xl text-lg flex items-center justify-between transition-all ${
                        pathname === item.href 
                            ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 translate-x-1' 
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                  {item.label}
                  {pathname === item.href && <ScanLine className="h-5 w-5 opacity-40" />}
                </Link>
              ))}
              <div className="mt-12 pt-8 border-t px-4">
                 <p className="text-sm text-zinc-400 uppercase tracking-widest font-semibold mb-2 text-center opacity-50">{roleTitle} ACCESS</p>
              </div>
           </nav>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
