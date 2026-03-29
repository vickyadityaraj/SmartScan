import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      roleTitle="Security"
      navItems={[
        { label: 'Verify Scan', href: '/security' },
        { label: 'Log', href: '/security/audit' },
      ]}
    >
      {children}
    </DashboardLayout>
  )
}
