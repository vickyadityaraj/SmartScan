import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      roleTitle="Admin"
      navItems={[
        { label: 'Overview', href: '/admin' },
        { label: 'Users', href: '/admin/users' },
      ]}
    >
      {children}
    </DashboardLayout>
  )
}
