import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CartProvider } from '@/components/providers/cart-provider'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      roleTitle="Customer"
      navItems={[
        { label: 'Dashboard', href: '/customer' },
        { label: 'Scan & Shop', href: '/customer/scan' },
      ]}
    >
      <CartProvider>
        {children}
      </CartProvider>
    </DashboardLayout>
  )
}
