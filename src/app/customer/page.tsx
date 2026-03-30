'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCustomerOrders } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScanLine, ShoppingBag, X, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      const data = await getCustomerOrders()
      setOrders(data)
      setLoading(false)
    }
    fetchOrders()
  }, [])

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
            <div className="text-2xl font-bold">{loading ? '...' : orders.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Receipts</h2>
        {loading ? (
             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="h-40 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
                ))}
             </div>
        ) : orders.length === 0 ? (
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
              <Card 
                key={order.id} 
                className="overflow-hidden group hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary/30"
                onClick={() => setSelectedOrder(order)}
              >
                <CardHeader className="bg-zinc-50 dark:bg-zinc-900 pb-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">₹{order.total_price.toFixed(2)}</CardTitle>
                      <CardDescription>{new Date(order.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'verified' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {order.status === 'verified' ? 'Completed' : 'View Pass'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex justify-between items-center">
                  <div className="text-sm text-zinc-500">
                    <span>{order.order_items?.length || 0} items • {order.total_weight}kg</span>
                  </div>
                  <QrCode className="h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <Card className="w-full max-w-sm rounded-[2rem] border-4 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="bg-primary p-6 text-primary-foreground text-center relative">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-primary-foreground hover:bg-white/20 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(null);
                    }}
                 >
                    <X className="h-5 w-5" />
                 </Button>
                 <div className="flex items-center justify-center gap-2 font-bold text-xl uppercase tracking-widest">
                   <ScanLine className="h-6 w-6" />
                   Exit Pass
                 </div>
                 <div className="text-xs opacity-80 mt-1 uppercase tracking-[0.2em] font-mono">
                   #{selectedOrder.id.substring(0, 8)}
                 </div>
              </div>
              
              <CardContent className="bg-white text-zinc-900 pt-10 pb-8 flex flex-col justify-center items-center relative">
                <div className="bg-white p-4 rounded-xl border-2 border-zinc-100 shadow-inner">
                  <QRCodeSVG 
                    value={selectedOrder.qr_code_value} 
                    size={220} 
                    bgColor={"#ffffff"} 
                    fgColor={"#000000"} 
                    level={"M"} 
                  />
                </div>
                <div className="mt-6 text-center">
                    <p className="font-bold text-lg leading-tight">Order: ₹{selectedOrder.total_price.toFixed(2)}</p>
                    <p className="text-xs text-zinc-400 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </CardContent>
              
              <div className="border-t-2 border-dashed border-zinc-200 w-[80%] mx-auto my-0" />
              
              <CardFooter className="bg-white text-center flex flex-col pt-4 p-6">
                <Button className="w-full text-lg h-14 rounded-full" variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </CardFooter>
           </Card>
        </div>
      )}
    </div>
  )
}
