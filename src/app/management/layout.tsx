import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      roleTitle="Management"
      navItems={[
        { label: 'Inventory', href: '/management' },
        { label: 'Add Product', href: '/management/add' },
      ]}
    >
      {children}
    </DashboardLayout>
  )
}
