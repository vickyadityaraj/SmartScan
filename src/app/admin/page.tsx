import { getAdminAnalytics } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCcw, HandCoins, Activity, Box, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const data = await getAdminAnalytics()

  if ('error' in data) {
    return <div className="p-4 bg-red-50 text-red-600 rounded">Error: {data.error}</div>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-zinc-500">Global overview of system performance and metrics.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <HandCoins className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-zinc-500 mt-1">Lifetime processed</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.totalTransactions}</div>
            <p className="text-xs text-zinc-500 mt-1">Successful Checkouts</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Box className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
            <p className="text-xs text-zinc-500 mt-1">In catalog</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors border-l-4 border-l-amber-500 border-y-transparent border-r-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <RefreshCcw className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.lowStockCount} items</div>
            <p className="text-xs text-amber-600/70 mt-1">Require immediate restocking</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Revenue Trend</CardTitle>
          <CardDescription>Daily revenue processed via self-checkout kiosks.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center p-6 border-t bg-zinc-50 dark:bg-zinc-900/50">
           {data.revenueData?.length > 0 ? (
             <div className="w-full h-full flex items-end gap-2 px-4 relative">
                <div className="absolute inset-x-8 top-1/2 border-b border-dashed border-zinc-200 z-0 content-['_'] text-zinc-300 text-xs">Mid Point</div>
                {/* Manual simple bar chart because Recharts not guaranteed installed */}
                {data.revenueData.map((d: any, i: number) => {
                   // Calculate relative height assuming max revenue is $1000 for visual sake, or dynamically
                   const maxVal = Math.max(...data.revenueData.map((v: any) => v.amount)) || 1
                   const heightPerc = Math.max((d.amount / maxVal) * 100, 5) // min 5% height

                   return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 z-10 hover:opacity-80 transition-opacity">
                        <div className="w-full bg-primary/20 rounded-t-sm" style={{ height: `${heightPerc}%` }}>
                           <div className="w-full bg-primary rounded-t-sm" style={{ height: '4px' }}/>
                        </div>
                        <span className="text-xs text-zinc-500 rotate-45 md:rotate-0 mt-2">{d.date}</span>
                     </div>
                   )
                })}
             </div>
           ) : (
              <p className="text-zinc-500">No revenue data available yet.</p>
           )}
        </CardContent>
      </Card>
    </div>
  )
}
