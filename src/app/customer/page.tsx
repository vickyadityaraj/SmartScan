import Link from 'next/link'
import { getCustomerOrders } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScanLine, ShoppingBag, ArrowRight } from 'lucide-react'

export default async function CustomerDashboard() {
  const orders = await getCustomerOrders()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Ready for your shopping trip?</p>
        </div>
        
        <Link href="/customer/scan">
          <Button size="lg" className="gap-2 h-14 rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
            <ScanLine className="h-5 w-5" />
            Start Shopping
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <ShoppingBag className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Receipts</h2>
        {orders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-zinc-500">No past orders found.</p>
              <Link href="/customer/scan" className="text-primary mt-2">Start your first scan</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order: any) => (
              <Card key={order.id} className="overflow-hidden group hover:shadow-md transition-all">
                <CardHeader className="bg-zinc-50 dark:bg-zinc-900 pb-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">${order.total_price.toFixed(2)}</CardTitle>
                      <CardDescription>{new Date(order.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                    }`}>
                      {order.status === 'verified' ? 'Completed' : 'Action Required'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-sm text-zinc-500 flex justify-between">
                    <span>{order.order_items.length} items</span>
                    <span>{order.total_weight}g</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
