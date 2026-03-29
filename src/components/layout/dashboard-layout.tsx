'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ScanLine, LogOut } from 'lucide-react'
import { logoutAction } from '@/app/login/actions'
import { useRouter } from 'next/navigation'

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b bg-white dark:bg-zinc-950 px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <ScanLine className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg">Smart Scan</span>
          <span className="text-zinc-500 ml-2 font-normal">| {roleTitle}</span>
        </div>
        
        <nav className="ml-8 hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </header>
      
      {/* Mobile nav could go here */}

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
